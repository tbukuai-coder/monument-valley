// Headless validator for monument-valley/index.html levels.
// Replicates the game's adjacency + mechanism rules and searches the full
// joint state space: (char positions..., rotation, ferry, tide, orb).
const fs = require("fs");
const html = fs.readFileSync(process.argv[2] || "/teamspace/studios/this_studio/monument-valley/index.html", "utf8");
const m = html.match(/\/\* LEVELS-START \*\/\s*const LEVELS = ([\s\S]*?);\s*\/\* LEVELS-END \*\//);
if (!m) { console.error("LEVELS block not found"); process.exit(1); }
const LEVELS = eval("(" + m[1] + ")");

function rotCW(dx, dy, k) { for (let i = 0; i < ((k % 4) + 4) % 4; i++) { const t = dx; dx = dy; dy = -t; } return [dx, dy]; }

let fail = 0;
LEVELS.forEach(L => {
  console.log(`\n=== Chapter ${L.numeral} — ${L.name} ===`);
  const hasRot = !!L.rot, hasFerry = !!L.ferry, hasTide = !!L.tide;
  const water = t => hasTide ? (t ? L.tide.high : L.tide.low) : (L.sea ? L.sea.z : -1e9);

  // nodes for a mechanism state; submerged statics excluded
  function nodesAt(rot, ft, tide) {
    const w = water(tide), out = [];
    L.statics.forEach((s, i) => { if (s[2] >= w - 0.01) out.push({ id: "s" + i, x: s[0], y: s[1], z: s[2] }); });
    if (hasRot) L.rot.cells.forEach((c, i) => {
      const [dx, dy] = rotCW(c[0], c[1], rot);
      out.push({ id: "r" + i, x: L.rot.p[0] + dx, y: L.rot.p[1] + dy, z: L.rot.z });
    });
    if (hasFerry) out.push({ id: "f0", x: L.ferry.a[0] + (L.ferry.b[0] - L.ferry.a[0]) * ft, y: L.ferry.a[1] + (L.ferry.b[1] - L.ferry.a[1]) * ft, z: L.ferry.z });
    if (L.floats) L.floats.forEach((f, i) => out.push({ id: "w" + i, x: f[0], y: f[1], z: w }));
    return out;
  }
  function edgesOf(nodes) {
    const E = new Map(nodes.map(n => [n.id, new Set()]));
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dsx = (a.x - a.y) - (b.x - b.y);
      const dsy = ((a.x + a.y) / 2 - a.z) - ((b.x + b.y) / 2 - b.z);
      if (Math.abs(Math.abs(dsx) - 1) < .01 && Math.abs(Math.abs(dsy) - 0.5) < .01) {
        E.get(a.id).add(b.id); E.get(b.id).add(a.id);
      }
    }
    return E;
  }
  const memo = new Map();
  function world(rot, ft, tide) {
    const k = rot + "|" + ft + "|" + tide;
    if (!memo.has(k)) {
      const ns = nodesAt(rot, ft, tide);
      memo.set(k, { nodes: ns, byId: Object.fromEntries(ns.map(n => [n.id, n])), edges: edgesOf(ns) });
    }
    return memo.get(k);
  }

  // report cross-z (magic) edges across mechanism states
  const rots = hasRot ? [0, 1, 2, 3] : [0], fts = hasFerry ? [0, 1] : [0], tides = hasTide ? [0, 1] : [0];
  for (const r of rots) for (const f of fts) for (const td of tides) {
    const w = world(r, f, td), magic = [];
    for (const [id, set] of w.edges) for (const o of set)
      if (id < o && w.byId[id].z !== w.byId[o].z)
        magic.push(`${id}(${w.byId[id].x},${w.byId[id].y},${w.byId[id].z})<->${o}(${w.byId[o].x},${w.byId[o].y},${w.byId[o].z})`);
    const tag = `rot=${r}${hasFerry ? " ferry=" + f : ""}${hasTide ? " tide=" + (td ? "high" : "low") : ""}`;
    console.log(`  ${tag}: magic: ${magic.length ? magic.join("  ") : "none"}`);
    const seen = new Set();
    for (const n of w.nodes) { const k = n.x + "," + n.y + "," + n.z; if (seen.has(k)) { console.log(`  !! ${tag}: overlap at ${k}`); fail++; } seen.add(k); }
  }

  const defs = L.chars || [{ start: L.start, doorAt: L.doorAt }];
  const w0 = world(0, 0, 0);
  const chars = defs.map(d => ({
    startId: w0.nodes.find(n => n.x === d.start[0] && n.y === d.start[1] && n.z === d.start[2]).id,
    door: d.doorAt,
  }));
  const NC = chars.length;
  const orbNeeded = !!L.orbAt;

  // state: [pos0..posN-1, rot, ft, tide, orb]; pos = nodeId or "DONE"
  function next(state) {
    const rot = state[NC], ft = state[NC + 1], tide = state[NC + 2], orb = state[NC + 3];
    const w = world(rot, ft, tide), out = [];
    for (let ci = 0; ci < NC; ci++) {
      const p = state[ci]; if (p === "DONE") continue;
      if (!w.edges.has(p)) continue; // shouldn't happen (drown guard), but be safe
      for (const o of w.edges.get(p)) {
        if (state.some((q, j) => j < NC && j !== ci && q === o)) continue; // occupied
        const s = state.slice();
        const n = w.byId[o], d = chars[ci].door;
        let norb = orb;
        if (L.orbAt && !orb && n.x === L.orbAt[0] && n.y === L.orbAt[1] && n.z === L.orbAt[2]) norb = 1;
        const atDoor = n.x === d[0] && n.y === d[1] && n.z === d[2];
        s[ci] = (atDoor && (!orbNeeded || norb)) ? "DONE" : o;
        s[NC + 3] = norb;
        out.push({ s, op: 0 });
      }
    }
    if (hasRot) for (const dr of [1, 3]) { const s = state.slice(); s[NC] = (rot + dr) % 4; out.push({ s, op: 1 }); }
    if (hasFerry) { const s = state.slice(); s[NC + 1] = 1 - ft; out.push({ s, op: 1 }); }
    if (hasTide) {
      const nw = water(1 - tide);
      // blocked if any active char stands on a static tile that would submerge
      const drown = state.slice(0, NC).some(p => p !== "DONE" && p[0] === "s" && w.byId[p] && w.byId[p].z < nw - 0.01);
      if (!drown) { const s = state.slice(); s[NC + 2] = 1 - tide; out.push({ s, op: 1 }); }
    }
    return out;
  }
  const start = [...chars.map(c => c.startId), 0, 0, 0, 0];
  const isGoal = s => chars.every((c, i) => s[i] === "DONE");
  const keyOf = s => s.join("|");

  function solve(maxOps) {
    const q = [{ s: start, ops: 0, steps: 0 }], seen = new Set([keyOf(start)]);
    while (q.length) {
      const { s, ops, steps } = q.shift();
      if (isGoal(s)) return { ops, steps };
      for (const nx of next(s)) {
        if (nx.op && ops >= maxOps) continue;
        const k = keyOf(nx.s);
        if (!seen.has(k)) { seen.add(k); q.push({ s: nx.s, ops: ops + nx.op, steps: steps + (nx.op ? 0 : 1) }); }
      }
    }
    return null;
  }

  const noOps = solve(0);
  const full = solve(999);
  if (noOps) { console.log(`  !! SOLVABLE WITHOUT ANY MECHANISM (${noOps.steps} steps) — puzzle broken`); fail++; }
  else console.log(`  ok: not solvable without using mechanisms`);
  if (full) console.log(`  ok: solvable — ~${full.ops} mechanism uses, ~${full.steps} steps (${NC} traveler(s)${orbNeeded ? ", orb" : ""})`);
  else { console.log(`  !! NOT SOLVABLE AT ALL`); fail++; }

  // stranding: goal reachable from every reachable state
  {
    const q = [start], seen = new Set([keyOf(start)]), states = [];
    while (q.length) {
      const s = q.shift(); states.push(s);
      for (const nx of next(s)) { const k = keyOf(nx.s); if (!seen.has(k)) { seen.add(k); q.push(nx.s); } }
    }
    let stuck = 0;
    for (const s0 of states) {
      const q2 = [s0], s2 = new Set([keyOf(s0)]); let ok = false;
      while (q2.length && !ok) {
        const s = q2.shift();
        if (isGoal(s)) { ok = true; break; }
        for (const nx of next(s)) { const k = keyOf(nx.s); if (!s2.has(k)) { s2.add(k); q2.push(nx.s); } }
      }
      if (!ok) stuck++;
    }
    if (stuck) { console.log(`  !! ${stuck} reachable states cannot reach the goal (stranding)`); fail++; }
    else console.log(`  ok: no stranding (${states.length} reachable states)`);
  }
});
console.log(fail ? `\nFAIL: ${fail} problem(s)` : "\nALL LEVELS OK");
process.exit(fail ? 1 : 0);
