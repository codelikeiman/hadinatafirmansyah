import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { PROJECTS, SKILLS, TOOLCHAIN } from "../../data/profile";
import { useInViewport } from "../../lib/useInViewport";
import { cn } from "../../lib/cn";

const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = Matter;

const CHIPS = [
  ...SKILLS.map(s => ({ label: s.id.replace(".service", ""), tone: "g" })),
  ...TOOLCHAIN.map(t => ({ label: t, tone: "c" })),
  ...PROJECTS.map(p => ({ label: p.name, tone: "a", big: true })),
];

const TONES = {
  g: "border-g text-g shadow-[0_0_14px_#00ff4155]",
  c: "border-b text-b shadow-[0_0_14px_#00f0ff44]",
  a: "border-amber bg-amber/10 text-amber shadow-[0_0_18px_#ffd40055]",
};

/**
 * Matter.js tanpa renderer canvas: setiap body disinkronkan ke elemen DOM
 * (teks tetap tajam & bisa di-style Tailwind). Drag/lempar pakai MouseConstraint.
 */
export default function MatterPit() {
  const wrapRef = useRef(null);
  const chipRefs = useRef([]);
  const api = useRef(null);
  const active = useInViewport(wrapRef, { rootMargin: "0px" });
  const [gravity, setGravity] = useState(1);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const W = wrap.clientWidth, H = wrap.clientHeight;
    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    const wall = { isStatic: true, render: { visible: false } };
    const T = 200;
    const walls = [
      Bodies.rectangle(W / 2, H + T / 2, W * 3, T, wall),
      Bodies.rectangle(-T / 2, H / 2, T, H * 4, wall),
      Bodies.rectangle(W + T / 2, H / 2, T, H * 4, wall),
      Bodies.rectangle(W / 2, -T / 2 - 2, W * 3, T, wall),
    ];
    Composite.add(engine.world, walls);

    // tata awal ala flex-wrap di bagian atas area (tanpa tumpang tindih), lalu biarkan jatuh
    const spawn = [];
    let cx = 16, cy = 16, rowH = 0;
    for (const el of chipRefs.current) {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (cx + w > W - 16) { cx = 16; cy += rowH + 14; rowH = 0; }
      spawn.push({ x: cx + w / 2, y: cy + h / 2 });
      cx += w + 14;
      rowH = Math.max(rowH, h);
    }
    const pairs = chipRefs.current.map((el, i) => {
      const w = el.offsetWidth, h = el.offsetHeight;
      const body = Bodies.rectangle(spawn[i].x, spawn[i].y, w, h, { chamfer: { radius: 3 }, restitution: 0.35, friction: 0.08, frictionAir: 0.012, angle: ((i % 7) - 3) * 0.04 });
      return { el, body, w, h, home: spawn[i] };
    });
    Composite.add(engine.world, pairs.map(p => p.body));

    const mouse = Mouse.create(wrap);
    // Matter memblokir wheel (preventDefault) — kembalikan scroll halaman normal
    for (const ev of ["wheel", "mousewheel", "DOMMouseScroll"]) wrap.removeEventListener(ev, mouse.mousewheel);
    const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.18, damping: 0.08, render: { visible: false } } });
    Composite.add(engine.world, mc);
    // lepas drag walau tombol dilepas di luar area
    const releaseOutside = e => mouse.mouseup(e);
    window.addEventListener("mouseup", releaseOutside);
    Events.on(mc, "startdrag", () => wrap.classList.add("dragging"));
    Events.on(mc, "enddrag", () => wrap.classList.remove("dragging"));

    let raf = 0, last = performance.now(), acc = 0, running = true;
    const STEP = 1000 / 60;
    const loop = now => {
      raf = requestAnimationFrame(loop);
      if (!running) { last = now; return; }
      acc += Math.min(100, now - last);
      last = now;
      while (acc >= STEP) { Engine.update(engine, STEP); acc -= STEP; }
      for (const p of pairs) {
        const { x, y } = p.body.position;
        p.el.style.transform = `translate3d(${x - p.w / 2}px,${y - p.h / 2}px,0) rotate(${p.body.angle}rad)`;
      }
    };
    raf = requestAnimationFrame(loop);

    const bodies = pairs.map(p => p.body);
    api.current = {
      setRunning: v => { running = v; },
      gravity: g => { engine.gravity.y = g; bodies.forEach(b => Body.setStatic(b, false)); },
      shake: () => bodies.forEach(b => Body.applyForce(b, b.position, { x: (Math.random() - 0.5) * 0.06 * b.mass, y: -Math.random() * 0.09 * b.mass })),
      explode: () => {
        const c = { x: W / 2, y: H * 0.85 };
        bodies.forEach(b => {
          const dx = b.position.x - c.x, dy = b.position.y - c.y, d = Math.max(40, Math.hypot(dx, dy));
          Body.applyForce(b, b.position, { x: (dx / d) * 0.12 * b.mass, y: ((dy / d) * 0.12 - 0.08) * b.mass });
        });
      },
      reset: () => pairs.forEach((p, i) => {
        Body.setPosition(p.body, p.home);
        Body.setVelocity(p.body, { x: 0, y: 0 });
        Body.setAngularVelocity(p.body, 0);
        Body.setAngle(p.body, ((i % 7) - 3) * 0.04);
      }),
    };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mouseup", releaseOutside);
      Events.off(mc);
      Mouse.clearSourceEvents?.(mouse);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      api.current = null;
    };
  }, []);

  useEffect(() => { api.current?.setRunning(active); }, [active]);

  const setG = g => { setGravity(g); api.current?.gravity(g); };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
        {[["↓ 1g", 1], ["↑ -1g", -1], ["0g", 0], ["moon", 0.17]].map(([l, g]) => (
          <button key={l} type="button" onClick={() => setG(g)} className={cn("border px-3 py-1.5 tracking-wider", gravity === g ? "border-g bg-g text-black" : "border-line2 text-tx2 hover:text-g")}>{l}</button>
        ))}
        <span className="mx-1 text-tx3">│</span>
        <button type="button" onClick={() => api.current?.shake()} className="border border-line2 px-3 py-1.5 text-tx2 hover:border-b hover:text-b">⇆ shake</button>
        <button type="button" onClick={() => api.current?.explode()} className="border border-red/60 px-3 py-1.5 text-red hover:bg-red hover:text-black">✹ explode</button>
        <button type="button" onClick={() => api.current?.reset()} className="border border-line2 px-3 py-1.5 text-tx2 hover:text-g">↺ reset</button>
        <span className="ml-auto text-tx3">{CHIPS.length} bodies · 60Hz fixed step · {active ? "running" : "paused (offscreen)"}</span>
      </div>
      <div ref={wrapRef} className="matter-pit relative h-[62vh] min-h-[420px] touch-none select-none overflow-hidden border border-line2 bg-[radial-gradient(ellipse_at_50%_120%,#00ff4122,transparent_60%)]" data-cursor="drag & throw">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(#0c4a2033_1px,transparent_1px),linear-gradient(90deg,#0c4a2033_1px,transparent_1px)] bg-[size:32px_32px]" />
        {CHIPS.map((c, i) => (
          <div
            key={c.label}
            ref={el => { chipRefs.current[i] = el; }}
            className={cn("absolute left-0 top-0 whitespace-nowrap border bg-black/85 px-3 py-1.5 text-[12px] font-semibold tracking-wide will-change-transform", TONES[c.tone], c.big && "px-4 py-2.5 text-[14px]")}
            style={{ transform: "translate3d(-999px,-999px,0)" }}
          >
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
