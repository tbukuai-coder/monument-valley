# Monument — a quiet homage

A small isometric puzzle game inspired by ustwo's *Monument Valley*. Single static
HTML file, zero dependencies, no build step — just open `index.html` in a browser
(desktop or mobile).

## How to play

- **Tap/click a tile** to walk there.
- **Drag the warm-colored rotating bar** to turn it in 90° steps. It can carry you
  while it turns.
- Reach the glowing door to finish a chapter. Nine chapters total; progress is
  saved in `localStorage`.
- Chapters IV–VI have **two travelers** (a mother and child, after Monument
  Valley 2). Tap a traveler to select them; each must reach their own door, and
  they can't pass through each other. IV shares one bridge between two paths,
  V has the mother depart upward so the child inherits her road, and VI is a
  single-lane road where they can only pass by riding the bridge through a
  180° turn.
- Chapters VII–IX borrow from Monument Valley 3: open water, a **draggable
  sailboat** that ferries you between shores (VII), a **tide dial** that raises
  and lowers the sea — rafts float on the surface, low causeways drown, and
  connections reconfigure with the water level (VIII) — and a finale where you
  must fetch the **last fragment of light** from a high perch before the dark
  lighthouse door will open (IX).

## The trick

The world uses Monument Valley's impossible-geometry rule: two tiles are connected
whenever they *look* adjacent on screen, even if they are far apart or at different
heights in the underlying grid. Rotating a bridge into visual alignment creates a
real, walkable connection. Concretely, with screen projection `sx = x − y`,
`sy = (x + y)/2 − z`, tiles connect iff `|Δsx| = 1` and `|Δsy| = 0.5`.

## Development notes

- All level data lives in the `LEVELS` array between the `/* LEVELS-START */` and
  `/* LEVELS-END */` markers in `index.html`.
- Levels can be verified headlessly: a validator that replicates the adjacency rule
  and BFS-searches the (tile, rotation) state space checks that each chapter is
  solvable, cannot be solved without rotating, and has no stranding states. If you
  change level data, re-run that check (the original script pattern: extract the
  LEVELS block, build edges per rotation state, BFS with walk/rotate actions).
- Rendering is canvas 2D with painter's-algorithm depth sort (`key = x + y + 0.62z`).
- Sound is a tiny WebAudio synth (steps, rotation thock, completion chime); mutable
  via the corner button.

Inspired by ustwo games' Monument Valley — this is a fan homage, not affiliated.
