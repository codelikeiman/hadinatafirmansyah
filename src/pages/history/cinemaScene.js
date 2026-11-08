import * as THREE from "three";
import { CHAPTERS, stationX, stationZ } from "./script";

const PALETTE = CHAPTERS.map(c => new THREE.Color(c.color));

function monolithTexture(ch) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 768;
  const g = c.getContext("2d");
  const grad = g.createLinearGradient(0, 0, 0, 768);
  grad.addColorStop(0, "#020805");
  grad.addColorStop(1, "#000");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 768);
  for (let y = 0; y < 768; y += 4) { g.fillStyle = "rgba(255,255,255,.025)"; g.fillRect(0, y, 512, 1); }
  g.strokeStyle = ch.color;
  g.lineWidth = 6;
  g.strokeRect(14, 14, 484, 740);
  g.shadowColor = ch.color;
  g.shadowBlur = 40;
  g.fillStyle = ch.color;
  g.textAlign = "center";
  g.font = `bold ${ch.year.length > 3 ? 150 : 170}px "JetBrains Mono", monospace`;
  g.fillText(ch.year, 256, 330);
  g.shadowBlur = 16;
  g.font = 'bold 38px "JetBrains Mono", monospace';
  const words = ch.title.toUpperCase().split(" ");
  let line = "", y = 450;
  for (const w of words) {
    if ((line + w).length > 14) { g.fillText(line.trim(), 256, y); line = ""; y += 52; }
    line += w + " ";
  }
  g.fillText(line.trim(), 256, y);
  g.globalAlpha = 0.6;
  g.font = '26px "JetBrains Mono", monospace';
  g.fillText(ch.where.toUpperCase(), 256, 690);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Scene "data highway": terowongan cincin, ribuan partikel data, dan monolit
 * per chapter. Semua parameter kamera & atmosfer di-drive Theatre.js lewat apply().
 */
export function createCinema(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.018);
  const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 400);
  camera.position.set(0, 1.6, 16);

  const disposables = [];
  const track = o => { disposables.push(o); return o; };

  // terowongan cincin
  const ringGeo = track(new THREE.TorusGeometry(13, 0.035, 6, 96));
  const rings = [];
  const depth = -STATION_DEPTH();
  for (let z = 6; z > depth; z -= 3.2) {
    const mat = track(new THREE.MeshBasicMaterial({ color: 0x00ff41, transparent: true, opacity: 0.55 }));
    const m = new THREE.Mesh(ringGeo, mat);
    m.position.z = z;
    m.rotation.z = z * 0.07;
    m.scale.setScalar(0.9 + Math.abs(Math.sin(z * 0.11)) * 0.25);
    scene.add(m);
    rings.push(m);
  }

  // partikel data (titik + garis "streak" saat warp)
  const COUNT = 9000;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const a = Math.random() * Math.PI * 2, r = 2 + Math.random() * 10.5;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = Math.sin(a) * r;
    pos[i * 3 + 2] = 10 + Math.random() * depth * 1.05;
  }
  const pGeo = track(new THREE.BufferGeometry());
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  // sprite titik bulat bercahaya (radial gradient) — bukan kotak default PointsMaterial
  const dot = document.createElement("canvas");
  dot.width = dot.height = 64;
  const dg = dot.getContext("2d"), rg = dg.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, "rgba(255,255,255,1)");
  rg.addColorStop(0.35, "rgba(255,255,255,.55)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  dg.fillStyle = rg;
  dg.fillRect(0, 0, 64, 64);
  const dotTex = track(new THREE.CanvasTexture(dot));
  const pMat = track(new THREE.PointsMaterial({ color: 0x7dffb0, size: 0.11, map: dotTex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // monolit per chapter
  const slabGeo = track(new THREE.BoxGeometry(5.2, 7.8, 0.5));
  const edgeGeo = track(new THREE.EdgesGeometry(slabGeo));
  CHAPTERS.forEach((ch, i) => {
    const k = i + 1;
    const tex = track(monolithTexture(ch));
    const face = track(new THREE.MeshBasicMaterial({ map: tex }));
    const side = track(new THREE.MeshBasicMaterial({ color: 0x020a05 }));
    const slab = new THREE.Mesh(slabGeo, [side, side, side, side, face, side]);
    slab.position.set(stationX(k), 1.2, stationZ(k));
    slab.rotation.y = -stationX(k) * 0.07;
    const edges = new THREE.LineSegments(edgeGeo, track(new THREE.LineBasicMaterial({ color: ch.color })));
    slab.add(edges);
    scene.add(slab);
    const halo = new THREE.Mesh(track(new THREE.RingGeometry(5.6, 5.75, 64)), track(new THREE.MeshBasicMaterial({ color: ch.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })));
    halo.position.copy(slab.position).setY(1.2);
    halo.position.z -= 0.6;
    scene.add(halo);
  });

  // lantai grid
  const grid = new THREE.GridHelper(40, 40, 0x00ff41, 0x0c4a20);
  grid.position.y = -5;
  grid.scale.z = -depth / 40 + 1;
  grid.position.z = depth / 2;
  grid.material.transparent = true;
  grid.material.opacity = 0.3;
  scene.add(grid);
  disposables.push(grid.geometry, grid.material);

  const tmpColor = new THREE.Color();
  const state = { x: 0, y: 1.6, z: 16, roll: 0, fov: 55, hue: 0, density: 0.018, warp: 0 };

  const apply = () => {
    camera.position.set(state.x, state.y, state.z);
    camera.lookAt(state.x * 0.35, 1.2, state.z - 24);
    camera.rotation.z += state.roll;
    if (camera.fov !== state.fov) { camera.fov = state.fov; camera.updateProjectionMatrix(); }
    const h = Math.max(0, Math.min(PALETTE.length - 1, state.hue));
    const i0 = Math.floor(h), i1 = Math.min(PALETTE.length - 1, i0 + 1);
    tmpColor.copy(PALETTE[i0]).lerp(PALETTE[i1], h - i0);
    scene.fog.color.copy(tmpColor).multiplyScalar(0.12);
    scene.fog.density = state.density;
    rings.forEach(r => r.material.color.copy(tmpColor));
    pMat.size = 0.11 + state.warp * 0.07;
    pMat.color.copy(tmpColor).lerp(new THREE.Color(0xffffff), 0.4);
  };

  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  let running = true;
  renderer.setAnimationLoop(t => {
    if (!running) return;
    rings.forEach((r, i) => { r.rotation.z += 0.0015 * (i % 2 ? 1 : -1) * (1 + state.warp * 6); });
    points.rotation.z = t * 0.00004;
    apply();
    renderer.render(scene, camera);
  });

  return {
    /** dipanggil dari onValuesChange Theatre */
    set: patch => Object.assign(state, patch),
    pause: p => { running = !p; },
    dispose: () => {
      running = false;
      renderer.setAnimationLoop(null);
      ro.disconnect();
      disposables.forEach(d => d.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

function STATION_DEPTH() {
  return -stationZ(CHAPTERS.length) + 60;
}
