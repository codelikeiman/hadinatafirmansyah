/**
 * Animasi Lottie yang ditulis langsung sebagai data (format Bodymovin v5),
 * lalu diputar oleh dotLottie (ThorVG WASM). Tanpa After Effects, tanpa file
 * eksternal: setiap layer/shape/keyframe dibangun lewat helper kecil di bawah.
 */
const FR = 60;
const rgb = hex => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
};
const st = k => ({ a: 0, k });
const arr = v => (Array.isArray(v) ? v : [v]);
/** properti beranimasi: frames = [[frame, value, ease?]], ease default in-out */
const an = frames => ({
  a: 1,
  k: frames.map(([t, s, ease = "io"], i) => {
    const kf = { t, s: arr(s) };
    if (i < frames.length - 1) {
      const e = { io: [[0.5], [0], [0.5], [1]], lin: [[0.33], [0.33], [0.67], [0.67]], out: [[0.2], [0], [0.1], [1]] }[ease];
      kf.o = { x: e[0], y: e[1] };
      kf.i = { x: e[2], y: e[3] };
    }
    return kf;
  }),
});

const transform = (p = [0, 0], extra = {}) => ({ ty: "tr", p: st(p), a: st([0, 0]), s: st([100, 100]), r: st(0), o: st(100), sk: st(0), sa: st(0), ...extra });
const group = (nm, items, tr) => ({ ty: "gr", nm, it: [...items, tr ?? transform()] });
const rect = (w, h, p = [0, 0], r = 0) => ({ ty: "rc", d: 1, s: st([w, h]), p: st(p), r: st(r) });
const ellipse = (w, h = w, p = [0, 0]) => ({ ty: "el", d: 1, s: st([w, h]), p: st(p) });
const path = (v, closed = true) => ({ ty: "sh", ks: st({ i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), v, c: closed }) });
const fill = (hex, o = 100) => ({ ty: "fl", c: st(rgb(hex)), o: typeof o === "number" ? st(o) : o, r: 1 });
const stroke = (hex, w = 2, o = 100) => ({ ty: "st", c: st(rgb(hex)), o: typeof o === "number" ? st(o) : o, w: st(w), lc: 2, lj: 2 });
const trim = (s, e, o = 0) => ({ ty: "tm", s: typeof s === "number" ? st(s) : s, e: typeof e === "number" ? st(e) : e, o: typeof o === "number" ? st(o) : o, m: 1 });

let ind = 0;
const layer = (nm, shapes, ks = {}, op = 120) => ({
  ddd: 0, ind: ++ind, ty: 4, nm, sr: 1, ao: 0, ip: 0, op, st: 0, bm: 0,
  ks: { o: st(100), r: st(0), p: st([100, 100, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]), ...ks },
  shapes,
});
const comp = (nm, layers, op = 120) => ({ v: "5.7.4", fr: FR, ip: 0, op, w: 200, h: 200, nm, ddd: 0, assets: [], layers });

const hexPts = r => Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI / 3) * i - Math.PI / 2;
  return [Math.round(Math.cos(a) * r * 100) / 100, Math.round(Math.sin(a) * r * 100) / 100];
});

/** 1. hex loader: heksagon digambar oleh trim path sambil berputar */
export const hexLoader = comp("hex-loader", [
  layer("core", [group("dot", [ellipse(14), fill("#c2ffd3")])], { s: an([[0, [80, 80, 100]], [60, [130, 130, 100]], [120, [80, 80, 100]]]) }),
  layer("hex-in", [group("h", [path(hexPts(38)), stroke("#00f0ff", 3), trim(an([[0, 0], [60, 40], [120, 100]]), an([[0, 20], [60, 90], [120, 100]]))])], { r: an([[0, 0, "lin"], [120, -360]]) }),
  layer("hex-out", [group("h", [path(hexPts(70)), stroke("#00ff41", 5), trim(an([[0, 0], [70, 0], [120, 100]]), an([[0, 0], [60, 100], [120, 100]]))])], { r: an([[0, 0, "lin"], [120, 180]]) }),
  layer("ring", [group("r", [ellipse(170), stroke("#14802f", 1.5, 70)])]),
]);

/** 2. server rack: tiga unit dengan LED berkedip bergiliran + bar pemindai */
const rackUnit = (y, phase) => group(`u${y}`, [
  group("led1", [ellipse(9, 9, [-52, 0]), fill("#00ff41", an([[0 + phase, 100], [10 + phase, 15], [20 + phase, 100], [120, 100]]))]),
  group("led2", [ellipse(9, 9, [-36, 0]), fill("#ffd400", an([[0, 30], [30 + phase, 100], [50 + phase, 30], [120, 30]]))]),
  group("slots", [rect(70, 4, [22, -6], 1), rect(70, 4, [22, 6], 1), fill("#14802f")]),
  group("body", [rect(150, 34, [0, 0], 4), stroke("#00ff41", 2), fill("#020a05")]),
], transform([0, y]));
export const serverRack = comp("server-rack", [
  layer("scan", [group("bar", [rect(160, 3, [0, 0]), fill("#00f0ff", 80)], transform([0, 0], { p: an([[0, [0, -62]], [60, [0, 62]], [120, [0, -62]]]) }))]),
  layer("rack", [rackUnit(-42, 0), rackUnit(0, 18), rackUnit(42, 36)]),
  layer("frame", [group("f", [rect(172, 150, [0, 0], 6), stroke("#0c4a20", 2)])]),
]);

/** 3. radar pulse: sapuan berputar + blip yang muncul & memudar */
const blip = (x, y, delay) => group(`b${x}`, [ellipse(10), fill("#00ff41")], transform([x, y], {
  s: an([[delay, [0, 0]], [delay + 8, [160, 160]], [delay + 30, [100, 100]], [120, [100, 100]]]),
  o: an([[delay, 0], [delay + 8, 100], [Math.min(delay + 60, 118), 0], [120, 0]]),
}));
export const radarPulse = comp("radar", [
  layer("blips", [blip(30, -40, 10), blip(-45, 20, 45), blip(50, 38, 80)]),
  layer("sweep", [group("w", [path([[0, 0], [0, -78], [44, -64]]), fill("#00ff41", 35)])], { r: an([[0, 0, "lin"], [120, 360]]) }),
  layer("rings", [group("r", [ellipse(156), ellipse(104), ellipse(52), stroke("#14802f", 1.5)])]),
  layer("pulse", [group("p", [ellipse(156), stroke("#00f0ff", 2)], transform([0, 0], { s: an([[0, [20, 20]], [90, [110, 110]], [120, [110, 110]]]), o: an([[0, 100], [90, 0], [120, 0]]) }))]),
]);
