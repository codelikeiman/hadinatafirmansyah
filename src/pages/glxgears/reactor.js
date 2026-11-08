import * as THREE from "three/webgpu";
import {
  abs, color, cos, dot, float, fract, hash, instanceIndex, mix, mx_noise_float, normalLocal, normalView,
  oneMinus, pass, positionLocal, positionView, pow, sin, smoothstep, time, uniform, uv, vec3, vec4,
} from "three/tsl";
import { bloom } from "three/addons/tsl/display/BloomNode.js";
import { rgbShift } from "three/addons/tsl/display/RGBShiftNode.js";
import { scanlines, vignette } from "three/addons/tsl/display/CRT.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**
 * "Reactor core" — scene Three.js yang ditulis full TSL (Three Shading Language):
 *  - core: icosahedron 70k+ segitiga, vertex didorong noise MaterialX (mx_noise_float)
 *  - cangkang wireframe, 3 cincin giroskop emissive
 *  - 4.000 partikel = 1 draw call (Sprite instanced, posisi dihitung di shader dari instanceIndex)
 *  - post-processing node: bloom → RGB shift → scanline CRT → vignette
 * WebGPURenderer otomatis fallback ke backend WebGL2 bila WebGPU tidak tersedia.
 */
export async function createReactor(container, { reducedMotion = false, forceWebGL = false, onStats } = {}) {
  const renderer = new THREE.WebGPURenderer({ antialias: true, powerPreference: "high-performance", forceWebGL });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:none";
  container.appendChild(renderer.domElement);
  await renderer.init();
  const backend = renderer.backend.isWebGPUBackend ? "WebGPU" : "WebGL2 (fallback)";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0.8, 6.4);

  // ── uniform yang bisa diubah dari UI ─────────────────────────────────────
  const U = {
    amp: uniform(0.28),
    freq: uniform(1.6),
    speed: uniform(reducedMotion ? 0.08 : 0.45),
    heat: uniform(0),
  };

  // ── core ────────────────────────────────────────────────────────────────
  const coreGeo = new THREE.IcosahedronGeometry(1.15, 60);
  const coreMat = new THREE.MeshBasicNodeMaterial();
  const flow = vec3(0, time.mul(U.speed), time.mul(U.speed).mul(0.5));
  const n = mx_noise_float(positionLocal.mul(U.freq).add(flow));
  coreMat.positionNode = positionLocal.add(normalLocal.mul(n.mul(U.amp)));
  const fresnel = pow(oneMinus(abs(dot(normalView, positionView.normalize().negate()))), 2.4);
  const band = smoothstep(-0.3, 0.7, n);
  // garis kontur "topografi" yang ikut beriak bersama noise
  const contour = smoothstep(0.86, 1.0, fract(n.mul(7).add(time.mul(0.15))));
  coreMat.colorNode = mix(color(0x000c04), color(0x00c832), band.mul(band))
    .add(color(0xc2ffd3).mul(contour).mul(0.85))
    .add(color(0x00f0ff).mul(fresnel).mul(1.3))
    .add(color(0xc2ffd3).mul(U.heat).mul(1.8));
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // ── cangkang wireframe ──────────────────────────────────────────────────
  const shellMat = new THREE.MeshBasicNodeMaterial({ wireframe: true, transparent: true });
  shellMat.colorNode = color(0x00ff41);
  shellMat.opacityNode = float(0.16).add(U.heat.mul(0.5));
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.85, 2), shellMat);
  scene.add(shell);

  // ── cincin giroskop ─────────────────────────────────────────────────────
  const rings = [0x00f0ff, 0xffd400, 0x00ff41].map((c, i) => {
    const m = new THREE.MeshBasicNodeMaterial();
    m.colorNode = color(c).mul(1.6);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.25 + i * 0.22, 0.01, 8, 240), m);
    ring.rotation.set(Math.PI / 2 + i * 0.5, i * 0.7, 0);
    scene.add(ring);
    return ring;
  });

  // ── partikel orbit: 1 draw call, posisi dihitung di GPU ─────────────────
  const COUNT = 4000;
  const s1 = hash(instanceIndex), s2 = hash(instanceIndex.add(17)), s3 = hash(instanceIndex.add(91));
  const radius = s1.mul(2.8).add(1.9);
  const ang = time.mul(s2.mul(0.32).add(0.06)).mul(U.speed.mul(2.2)).add(s3.mul(6.2831853));
  const lift = s3.sub(0.5).mul(radius).mul(0.42).add(sin(time.mul(0.7).add(s1.mul(30))).mul(0.08));
  const pMat = new THREE.SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  pMat.positionNode = vec3(cos(ang).mul(radius), lift, sin(ang).mul(radius));
  pMat.colorNode = mix(color(0x00ff41), color(0x00f0ff), s2).mul(1.5);
  pMat.scaleNode = s1.mul(0.022).add(0.006);
  pMat.opacityNode = smoothstep(0.5, 0.0, uv().sub(0.5).length());
  const particles = new THREE.Sprite(pMat);
  particles.count = COUNT;
  particles.frustumCulled = false;
  scene.add(particles);

  // ── lantai grid ─────────────────────────────────────────────────────────
  const grid = new THREE.GridHelper(30, 60, 0x00ff41, 0x0c4a20);
  grid.position.y = -2.4;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);

  // ── post-processing (node) ──────────────────────────────────────────────
  const pipeline = new THREE.RenderPipeline(renderer);
  const scenePass = pass(scene, camera);
  const sceneColor = scenePass.getTextureNode("output");
  const bloomPass = bloom(sceneColor, 0.75, 0.45, 0.14);
  const glow = sceneColor.add(bloomPass);
  const crtOut = vec4(vignette(scanlines(rgbShift(glow, 0.0016).rgb, 0.2, 900, 0.12), 0.55, 0.55), 1);
  pipeline.outputNode = crtOut;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.2;
  controls.maxDistance = 12;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.7;

  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const tris = Math.round(coreGeo.attributes.position.count / 3 + 3 * (240 * 8 * 2));
  let frames = 0, last = performance.now(), running = true;
  let spin = reducedMotion ? 0.1 : 1;

  renderer.setAnimationLoop(() => {
    if (!running) return;
    const dt = 1 / 60;
    controls.update();
    core.rotation.y += 0.12 * dt * spin;
    shell.rotation.y -= 0.18 * dt * spin;
    shell.rotation.x += 0.07 * dt * spin;
    rings.forEach((r, i) => { r.rotation.z += (0.3 + i * 0.17) * dt * spin * (i % 2 ? -1 : 1); r.rotation.x += 0.05 * dt * spin; });
    U.heat.value *= 0.94;
    pipeline.render();
    frames++;
    const now = performance.now();
    if (now - last > 500) {
      onStats?.({ fps: Math.round((frames * 1000) / (now - last)), backend, tris, particles: COUNT });
      frames = 0;
      last = now;
    }
  });

  return {
    backend,
    setAmp: v => { U.amp.value = v; },
    setFreq: v => { U.freq.value = v; },
    setSpeed: v => { U.speed.value = v; },
    setSpin: v => { spin = v; },
    setBloom: v => { bloomPass.strength.value = v; },
    setCrt: on => { pipeline.outputNode = on ? crtOut : glow; pipeline.needsUpdate = true; },
    /** objek yang bisa dianimasikan anime.js (heat) */
    uniforms: U,
    pause: p => { running = !p; },
    dispose: () => {
      running = false;
      renderer.setAnimationLoop(null);
      ro.disconnect();
      controls.dispose();
      pipeline.dispose();
      scene.traverse(o => {
        o.geometry?.dispose?.();
        o.material?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
