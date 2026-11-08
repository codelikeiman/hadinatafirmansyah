import { useEffect, useRef } from "react";
import { GRAPH_GROUPS, GRAPH_LINKS, GRAPH_NODES, G_COLORS } from "../../data/profile";
import { useReveal } from "../../lib/useReveal";
import SectionHead from "./SectionHead";
import BorderBeam from "../../components/ui/BorderBeam";

/** Gambar graf dengan d3 (dipanggil setelah modul d3 dimuat). Mengembalikan fungsi cleanup. */
function draw(el, d3) {
  const svg = d3.select(el);
  const W = el.clientWidth || 680, H = el.clientHeight || 460;
  const nodes = GRAPH_NODES.map((d, i) => ({ ...d, x: W / 2 + Math.cos(i) * 60, y: H / 2 + Math.sin(i) * 60 }));
  const links = GRAPH_LINKS.map(([s, t]) => ({ source: s, target: t }));

  const sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(76).strength(0.6))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(W / 2, H / 2).strength(0.8))
    .force("collide", d3.forceCollide(30))
    .force("boundary", () => {
      const pad = 40;
      for (const n of nodes) {
        if (n.x < pad) n.vx += (pad - n.x) * 0.12;
        if (n.x > W - pad) n.vx += (W - pad - n.x) * 0.12;
        if (n.y < pad) n.vy += (pad - n.y) * 0.12;
        if (n.y > H - pad) n.vy += (H - pad - n.y) * 0.12;
      }
    });
  sim.stop();
  for (let i = 0; i < 120; i++) sim.tick();
  sim.restart();

  const defs = svg.append("defs");
  const glow = defs.append("filter").attr("id", "node-glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
  glow.append("feGaussianBlur").attr("stdDeviation", 3).attr("result", "b");
  const merge = glow.append("feMerge");
  merge.append("feMergeNode").attr("in", "b");
  merge.append("feMergeNode").attr("in", "SourceGraphic");

  const linkSel = svg.append("g").selectAll("line").data(links).enter().append("line")
    .attr("stroke", "rgba(20,128,47,.55)").attr("stroke-width", 1).attr("stroke-dasharray", "3 3");

  const nodeSel = svg.append("g").selectAll("g").data(nodes).enter().append("g")
    .style("cursor", "grab")
    .call(d3.drag()
      .on("start", (ev, d) => { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
      .on("end", (ev, d) => { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

  nodeSel.append("circle").attr("r", d => 6 + d.lv * 0.1).attr("fill", d => G_COLORS[d.g]).attr("opacity", 0.9).attr("filter", "url(#node-glow)");
  nodeSel.append("circle").attr("r", d => 11 + d.lv * 0.1).attr("fill", "transparent").attr("stroke", d => G_COLORS[d.g]).attr("stroke-width", 0.6).attr("stroke-opacity", 0.35);
  nodeSel.append("text").text(d => d.id).attr("dy", d => -(8 + d.lv * 0.1 + 6)).attr("text-anchor", "middle")
    .attr("fill", "#c2ffd3").attr("font-size", "9px").attr("font-family", "JetBrains Mono, monospace").attr("letter-spacing", "1px").attr("pointer-events", "none");

  nodeSel.on("mouseenter", (_, d) => {
    const near = new Set([d.id]);
    links.forEach(l => { if (l.source.id === d.id) near.add(l.target.id); if (l.target.id === d.id) near.add(l.source.id); });
    nodeSel.attr("opacity", n => (near.has(n.id) ? 1 : 0.18));
    linkSel.attr("stroke", l => (l.source.id === d.id || l.target.id === d.id ? "#00ff41" : "rgba(20,128,47,.15)")).attr("stroke-width", l => (l.source.id === d.id || l.target.id === d.id ? 1.6 : 1));
  }).on("mouseleave", () => {
    nodeSel.attr("opacity", 1);
    linkSel.attr("stroke", "rgba(20,128,47,.55)").attr("stroke-width", 1);
  });

  sim.on("tick", () => {
    for (const n of nodes) {
      n.x = Math.max(36, Math.min(W - 36, n.x));
      n.y = Math.max(36, Math.min(H - 36, n.y));
    }
    linkSel.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    nodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  return () => { sim.stop(); svg.selectAll("*").remove(); };
}

/** Graf dependensi tech stack: simulasi gaya d3-force, node bisa di-drag. */
export default function TechGraph() {
  const svgRef = useRef(null);
  const [ref, vis] = useReveal();

  useEffect(() => {
    const el = svgRef.current;
    if (!vis || !el) return;
    let cleanup = () => {}, cancelled = false;
    // modul d3 (force/selection/drag) baru diunduh saat section ini terlihat
    Promise.all([import("d3-force"), import("d3-selection"), import("d3-drag")]).then(([force, selection, dragMod]) => {
      if (cancelled) return;
      cleanup = draw(el, { ...force, ...selection, ...dragMod });
    });
    return () => { cancelled = true; cleanup(); };
  }, [vis]);


  return (
    <section id="graph" className="sec">
      <SectionHead label="// 05 — DEPENDENCY GRAPH" title="TECH" accent="ECOSYSTEM" />
      <div ref={ref} className={`reveal${vis ? " show" : ""} sec-win`}>
        <BorderBeam size={160} duration={12} colorFrom="#00f0ff" colorTo="#00ff41" />
        <div className="win-bar">
          <div className="win-buttons">{["#ff5f56", "#ffbd2e", "#27c93f"].map(c => <div key={c} className="win-btn" style={{ background: c }} />)}</div>
          <span className="win-title">graph --layout=force --directed=false</span>
          <div className="win-tag"><span className="text-tx2">DRAG / HOVER</span> nodes</div>
        </div>
        <div className="graph-container">
          <svg ref={svgRef} aria-label="Graf tech stack" role="img" />
          <div className="graph-hint">D3 FORCE SIMULATION · {GRAPH_NODES.length} NODES · {GRAPH_LINKS.length} EDGES</div>
        </div>
      </div>
      <div className="graph-legend">
        {GRAPH_GROUPS.map(([g, label]) => (
          <div key={g} className="legend-item"><div className="legend-dot" style={{ background: G_COLORS[g], boxShadow: `0 0 6px ${G_COLORS[g]}` }} /><span>{label}</span></div>
        ))}
      </div>
    </section>
  );
}
