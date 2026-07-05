# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A Monument Valley homage: an isometric puzzle game in **one static HTML file**
(`index.html`), zero dependencies, no build step. Nine chapters. It is its own
git repo (inside a larger non-git Lightning AI workspace), pushed to
github.com/tbukuai-coder/monument-valley. See `ROADMAP.md` for planned work.

## Non-negotiable workflow

1. **All level data lives between `/* LEVELS-START */` and `/* LEVELS-END */`
   in `index.html`.** The validator parses those markers — keep them intact,
   and keep the block a pure literal (no computed values).
2. **After ANY change to level data or graph/mechanism logic, run
   `node validate.js` and require `ALL LEVELS OK`.** It replicates the game's
   adjacency rule and BFS-searches the full joint state space (characters ×
   rotation × ferry × tide × orb). It checks four things per chapter: solvable;
   NOT solvable without using mechanisms; no node overlaps; no stranding (goal
   reachable from every reachable state). It also prints every cross-height
   "magic" edge per mechanism state — eyeball that list and confirm only the
   edges you intended exist.
3. If you change the adjacency rule or add a mechanic in `index.html`, mirror
   it in `validate.js` — they are deliberately parallel implementations.
4. **Deploy = `git push` to `main`.** GitHub Pages deploys via the Actions
   workflow (`.github/workflows/pages.yml`), usually <1 min. Do NOT re-enable
   the legacy Pages builder; it hangs/fails on this repo.
5. Update `README.md` (chapter count, mechanics) alongside gameplay changes.

## How the engine works (the parts that bite)

- Grid coords `(x, y, z)`; screen projection `sx = x − y`,
  `sy = (x + y)/2 − z`. **Two tiles are connected iff they LOOK adjacent:
  `|Δsx| = 1` and `|Δsy| = 0.5`.** This one rule produces both normal
  adjacency and the impossible-geometry links. There are no explicit edge
  lists — connections are emergent, which is why validation matters.
- Consequence: for tiles two z-levels apart, a deck tile D links to a ground
  tile G iff `D − G ∈ {(2,1),(1,2),(3,2),(2,3)}` (in x,y). When authoring,
  accidental members of that set create shortcut edges — the validator's
  magic-edge report catches them, but expect to nudge coordinates.
- Mechanisms (all optional per level): `rot` (one draggable 90°-snapping bar
  rotator; riders ride), `ferry` (one draggable boat gliding a↔b; riders
  ride), `tide` + `floats` (two water levels; float nodes sit AT the water z;
  statics below water are removed from the graph; toggling is blocked if it
  would submerge an occupied tile), `orbAt` (ALL doors stay locked until any
  traveler ends a path on the orb tile; the pick-upper carries it visibly).
  `rot.needsLight:true` makes the rotator sleep (dark `rotDark` palette,
  undraggable) until the orb carrier comes within manhattan distance 2 of the
  pivot — then it wakes permanently (never re-sleeps; this is what makes
  stranding impossible). One rotator/ferry per level max.
- Multi-character levels use `chars:[{start,doorAt,child?,villager?}]`;
  characters block each other (BFS treats the other's tile as a wall).
  `villager:true` renders grey-robed with a round cap. Several characters may
  share one door tile — each enters in turn (entering frees the tile). Legacy
  single-char levels use top-level `start`/`doorAt` — keep both fields set
  even on `chars` levels (fitLevel/back-compat reads them).
- Door tiles must be **terminal** (dead ends): the engine only triggers
  door-entry/orb-pickup when a walk path ENDS on the tile, and the validator
  models arrival as forced entry. A walk-through door would desync the two.
- Painter's sort key is `x + y + 0.62z`; water is drawn between submerged and
  emergent items. Levels with `sea`/`tide` need `water:"r,g,b"` and place
  walkways at z ≥ 1 so slabs clear the water plane.

## Conventions

- One palette per chapter (sky pair, block/rotBlock/decoBlock triples, door +
  glow, particle tint); mechanisms are always the warm accent against cool
  architecture. Chapter names are two-word poetic ("The Parting"); hints on
  the intro card teach the one new idea in-fiction.
- Story arc: I–III princess-style solo, IV–VI mother & child (MV2), VII–IX
  the grown child as lightkeeper at sea (MV3). Extend the arc, don't reset it.
- Verification beyond the validator is manual: open `index.html` in a browser
  (or the GitHub Pages URL after push) and play the changed chapter. There is
  no lint/test suite.
- A claude.ai artifact mirror exists (strip the doctype/html/head/body wrapper
  and republish the inner content); only refresh it when asked or when already
  publishing a release.
