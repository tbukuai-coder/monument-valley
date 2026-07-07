# Monument — a quiet homage

A small isometric puzzle game inspired by ustwo's *Monument Valley*. Single static
HTML file, zero dependencies, no build step — just open `index.html` in a browser
(desktop or mobile).

## How to play

- **Tap/click a tile** to walk there.
- **Drag the warm-colored rotating bar** to turn it in 90° steps. It can carry you
  while it turns.
- Reach the glowing door to finish a chapter. Ten chapters total; progress is
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
- Chapter X adds **villagers** — extra travelers in grey robes who must all
  reach a shared refuge door, ferried one at a time by boat — and a **sleeping
  bridge** that only wakes (permanently) when the carried light comes near it.

## The trick

The world uses Monument Valley's impossible-geometry rule: two tiles are connected
whenever they *look* adjacent on screen, even if they are far apart or at different
heights in the underlying grid. Rotating a bridge into visual alignment creates a
real, walkable connection. Concretely, with screen projection `sx = x − y`,
`sy = (x + y)/2 − z`, tiles connect iff `|Δsx| = 1` and `|Δsy| = 0.5`.

## Homepage

`home.html` is an animated landing page for the game (v2), drawn with the
game's own projection and painter's sort. The hero is an atmospheric diorama —
a spired monument on a plateau with drifting clouds, bobbing floating islands,
passing birds, and mouse parallax. Below it the rose-bridge demo is
**interactive**: drag the bridge (or use the button) until the road lines up
and a traveler crosses the impossible gap, driven by the engine's real
adjacency rule. Then a scroll-driven journey morphs the sky through all ten
chapters' palettes (sun, moon, and stars included) past a frosted card per
chapter, followed by the mechanisms with animated icons. Light theme is
Chapter I's dawn; dark theme is Chapter VI's night. Served at
https://tbukuai-coder.github.io/monument-valley/home.html

## Development notes

- All level data lives in the `LEVELS` array between the `/* LEVELS-START */` and
  `/* LEVELS-END */` markers in `index.html`.
- Levels are verified headlessly with `node validate.js`: it replicates the
  adjacency rule and BFS-searches the full joint state space (characters ×
  rotation × ferry × tide × orb), checking that each chapter is solvable, cannot
  be solved without its mechanisms, has only intended impossible-geometry edges,
  and has no stranding states. Run it after any level or logic change.
- Rendering is canvas 2D with painter's-algorithm depth sort (`key = x + y + 0.62z`).
- Sound is a tiny WebAudio synth (steps, rotation thock, completion chime); mutable
  via the corner button.

Inspired by ustwo games' Monument Valley — this is a fan homage, not affiliated.
