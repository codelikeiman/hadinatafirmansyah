import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PROJECTS, SKILLS, TOOLCHAIN } from "../../data/profile";
import { useInViewport } from "../../lib/useInViewport";
import { cn } from "../../lib/cn";

const LABELS = [
  ...PROJECTS.map(p => ({ text: p.name, color: "#ffd400" })),
  ...SKILLS.map(s => ({ text: s.id.replace(".service", ""), color: "#00ff41" })),
  ...TOOLCHAIN.slice(0, 7).map(t => ({ text: t, color: "#00f0ff" })),
];

/** Tekstur "shipping container": rusuk vertikal + label stencil + noise karat halus. */
function containerTexture(text, color) {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = "#020a05";
  g.fillRect(0, 0, 512, 256);
  for (let x = 0; x < 512; x += 22) {
    g.fillStyle = x % 44 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.35)";
    g.fillRect(x, 0, 11, 256);
  }
  g.strokeStyle = color;
  g.lineWidth = 10;
  g.strokeRect(8, 8, 496, 240);
  g.shadowColor = color;
  g.shadowBlur = 24;
  g.fillStyle = color;
  g.font = `bold ${text.length > 11 ? 46 : 62}px "JetBrains Mono", monospace`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text.toUpperCase(), 256, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Rapier (WASM) + Three.js: menara kontainer berlabel tech stack.
 * Klik/tap = tembakkan bola plasma; drag = orbit kamera.
 */
export default function RapierYard() {
  const wrapRef = useRef(null);
  const api = useRef(null);
  const active = useInViewport(wrapRef, { rootMargin: "0px" });
  const [state, setState] = useState("loading");
  const [stats, setStats] = useState({ bodies: 0, shots: 0 });
  const [zeroG, setZeroG] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    let disposed = false, cleanup = () => {};

    import("@dimforge/rapier3d-compat").then(async ({ default: RAPIER }) => {
      await RAPIER.init();
      if (disposed) return;
      const W = () => wrap.clientWidth, H = () => wrap.clientHeight;

      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
      renderer.setSize(W(), H());
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.5;
      renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:none";
      wrap.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      scene.fog = new THREE.FogExp2(0x000000, 0.026);
      const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 200);
      camera.position.set(11, 7.5, 15);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 2.2, 0);
      controls.enableDamping = true;
      controls.maxPolarAngle = Math.PI * 0.48;
      controls.minDistance = 6;
      controls.maxDistance = 40;

      scene.add(new THREE.HemisphereLight(0x9effc0, 0x0a1a10, 1.4));
      const sun = new THREE.DirectionalLight(0xffffff, 3.2);
      sun.position.set(8, 16, 6);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 50 });
      scene.add(sun);
      const glow = new THREE.PointLight(0x00ff41, 30, 30, 1.6);
      glow.position.set(0, 6, 0);
      scene.add(glow);

      const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0x010603, roughness: 0.95 }));
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);
      const grid = new THREE.GridHelper(120, 120, 0x00ff41, 0x0c4a20);
      grid.position.y = 0.01;
      grid.material.transparent = true;
      grid.material.opacity = 0.28;
      scene.add(grid);

      const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
      world.timestep = 1 / 60;
      world.createCollider(RAPIER.ColliderDesc.cuboid(60, 0.1, 60).setTranslation(0, -0.1, 0).setFriction(0.9));

      const boxGeo = new THREE.BoxGeometry(2, 1, 1);
      const sideMat = new THREE.MeshStandardMaterial({ color: 0x0b3a1c, roughness: 0.55, metalness: 0.35 });
      const materials = LABELS.map(l => {
        const map = containerTexture(l.text, l.color);
        const face = new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.9, roughness: 0.5, metalness: 0.2 });
        return [sideMat, sideMat, sideMat, sideMat, face, face];
      });

      const sphereGeo = new THREE.SphereGeometry(0.34, 24, 16);
      const sphereMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 2.6 });
      const items = [];
      let shots = 0;

      const addBox = (x, y, z, i) => {
        const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z).setCanSleep(true));
        world.createCollider(RAPIER.ColliderDesc.cuboid(1, 0.5, 0.5).setFriction(0.8).setRestitution(0.05).setDensity(1.4), body);
        const mesh = new THREE.Mesh(boxGeo, materials[i % materials.length]);
        mesh.castShadow = mesh.receiveShadow = true;
        scene.add(mesh);
        items.push({ body, mesh, kind: "box" });
      };

      const build = () => {
        for (const it of items.splice(0)) { world.removeRigidBody(it.body); scene.remove(it.mesh); }
        let i = 0;
        // dua menara piramida yang saling silang
        for (let row = 0; row < 5; row++) {
          for (let k = 0; k < 5 - row; k++) addBox(-4 + k * 2.04 + row * 1.02, 0.5 + row * 1.02, -1.2, i++);
        }
        for (let row = 0; row < 4; row++) {
          for (let k = 0; k < 4 - row; k++) addBox(0.6 + k * 2.04 + row * 1.02, 0.5 + row * 1.02, 2.2, i++);
        }
        for (let h = 0; h < 6; h++) addBox(-7.5, 0.5 + h * 1.02, 3.5, i++);
        setStats({ bodies: items.length, shots });
      };
      build();

      const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
      const shoot = (cx, cy) => {
        const r = renderer.domElement.getBoundingClientRect();
        ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const o = ray.ray.origin.clone().addScaledVector(ray.ray.direction, 1.2), d = ray.ray.direction;
        const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(o.x, o.y, o.z).setLinvel(d.x * 42, d.y * 42, d.z * 42).setCcdEnabled(true));
        world.createCollider(RAPIER.ColliderDesc.ball(0.34).setDensity(9).setRestitution(0.3), body);
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.castShadow = true;
        scene.add(mesh);
        items.push({ body, mesh, kind: "ball" });
        const balls = items.filter(it => it.kind === "ball");
        if (balls.length > 24) {
          const old = balls[0];
          world.removeRigidBody(old.body);
          scene.remove(old.mesh);
          items.splice(items.indexOf(old), 1);
        }
        shots++;
        setStats({ bodies: items.length, shots });
      };

      let down = null;
      const onDown = e => { down = { x: e.clientX, y: e.clientY }; };
      const onUp = e => {
        if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) shoot(e.clientX, e.clientY);
        down = null;
      };
      renderer.domElement.addEventListener("pointerdown", onDown);
      renderer.domElement.addEventListener("pointerup", onUp);

      const ro = new ResizeObserver(() => {
        camera.aspect = W() / H();
        camera.updateProjectionMatrix();
        renderer.setSize(W(), H());
      });
      ro.observe(wrap);

      let running = true, acc = 0, last = performance.now();
      renderer.setAnimationLoop(now => {
        if (!running) { last = now; return; }
        acc += Math.min(0.1, (now - last) / 1000);
        last = now;
        while (acc >= 1 / 60) { world.step(); acc -= 1 / 60; }
        for (const it of items) {
          const t = it.body.translation(), q = it.body.rotation();
          it.mesh.position.set(t.x, t.y, t.z);
          it.mesh.quaternion.set(q.x, q.y, q.z, q.w);
        }
        glow.intensity = 26 + Math.sin(now / 400) * 6;
        controls.update();
        renderer.render(scene, camera);
      });

      api.current = {
        setRunning: v => { running = v; },
        rebuild: build,
        quake: () => items.forEach(it => {
          it.body.wakeUp();
          it.body.applyImpulse({ x: (Math.random() - 0.5) * 6, y: 4 + Math.random() * 6, z: (Math.random() - 0.5) * 6 }, true);
        }),
        gravity: zero => { world.gravity = { x: 0, y: zero ? 0.35 : -9.81, z: 0 }; items.forEach(it => it.body.wakeUp()); },
        volley: () => {
          const r = renderer.domElement.getBoundingClientRect();
          for (let k = 0; k < 6; k++) setTimeout(() => shoot(r.left + r.width * (0.35 + Math.random() * 0.3), r.top + r.height * (0.35 + Math.random() * 0.3)), k * 90);
        },
      };
      setState("ready");

      cleanup = () => {
        renderer.setAnimationLoop(null);
        ro.disconnect();
        controls.dispose();
        renderer.domElement.removeEventListener("pointerdown", onDown);
        renderer.domElement.removeEventListener("pointerup", onUp);
        world.free();
        materials.forEach(m => { m[4].map.dispose(); m[4].dispose(); });
        [boxGeo, sphereGeo, sideMat, sphereMat, ground.geometry, ground.material, grid.geometry, grid.material].forEach(x => x.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        api.current = null;
      };
    }).catch(err => {
      console.error("[rapier]", err);
      if (!disposed) setState("error");
    });

    return () => { disposed = true; cleanup(); };
  }, []);

  useEffect(() => { api.current?.setRunning(active); }, [active, state]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
        <button type="button" onClick={() => api.current?.volley()} className="border border-b px-3 py-1.5 text-b hover:bg-b hover:text-black">◎ volley ×6</button>
        <button type="button" onClick={() => api.current?.quake()} className="border border-amber/70 px-3 py-1.5 text-amber hover:bg-amber hover:text-black">≋ earthquake</button>
        <button type="button" onClick={() => { const z = !zeroG; setZeroG(z); api.current?.gravity(z); }} className={cn("border px-3 py-1.5", zeroG ? "border-g bg-g text-black" : "border-line2 text-tx2 hover:text-g")}>
          {zeroG ? "◌ zero-g ON" : "◌ zero-g"}
        </button>
        <button type="button" onClick={() => api.current?.rebuild()} className="border border-line2 px-3 py-1.5 text-tx2 hover:text-g">↺ rebuild</button>
        <span className="ml-auto text-tx3">{stats.bodies} rigid bodies · {stats.shots} shots · rapier WASM</span>
      </div>
      <div ref={wrapRef} className="relative h-[62vh] min-h-[420px] overflow-hidden border border-line2 bg-black" data-cursor="click = fire">
        {state !== "ready" && (
          <div className="absolute inset-0 grid place-items-center text-center text-[12px] tracking-[.25em] text-tx2">
            {state === "loading" ? <div><div className="pl-hex mx-auto mb-3 size-12 animate-spin border border-g [animation-duration:2s]" />LOADING RAPIER WASM…</div> : <div className="text-red">✖ physics engine gagal dimuat</div>}
          </div>
        )}
      </div>
    </div>
  );
}
