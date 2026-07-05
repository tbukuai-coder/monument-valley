# Roadmap

Where this homage could go next. Items are roughly ordered by value within
each section; nothing here is committed work. Keep the invariants from
`CLAUDE.md`: one HTML file, zero dependencies, every chapter validator-proven.

## Near-term polish

- [ ] **Chapter select** — the title screen should list unlocked chapters
      (progress already lives in `localStorage`) instead of only resuming.
- [ ] **Click-to-retarget while walking** — currently taps are ignored
      mid-walk; queue or redirect to the new target instead.
- [ ] **`prefers-reduced-motion`** — damp particles, water glints, and pulse
      hints when set.
- [ ] **Mobile audit** — long-press/scroll interference on iOS Safari,
      first-gesture audio unlock, safe-area insets for the mute button.
- [ ] **OG/social meta + favicon** so the GitHub Pages link unfurls nicely.
- [ ] **Per-chapter restart button** (small corner glyph) for when a player
      wants to replay a solved layout.

## Engine work (unblocks new puzzle types)

- [ ] **Multiple movers per level** — the engine assumes at most one rotator
      and one ferry (`rotor`, `ferryS` singletons). Generalize to a `movers[]`
      list so late chapters can compose two bridges, or bridge + boat.
- [ ] **Sliding slab mover** — a straight-line draggable platform (ferry
      without water); mostly a rename/generalization of the ferry code.
- [ ] **Camera rotation** — MV's other signature: rotate the whole world 90°
      so different things visually align. The adjacency rule already keys off
      screen space; this mainly needs projection + input + validator support.
- [ ] **Level editor page** — a second HTML file that renders a level from a
      textarea JSON, shows all magic edges live (port of the validator), and
      exports a `LEVELS` entry. Would cut level-authoring iteration a lot.

## Mechanics backlog (each is a chapter hook)

- [ ] **Totem companion** (MV1's Totem): a movable column that acts as a
      walkable tile and can plug gaps; a second "character" with no door.
- [ ] **Crow people**: patrolling blockers walking fixed loops; occupancy
      already exists, they just need a patrol tick in `step()`.
- [ ] **Pressure plates**: a tile that, while occupied, swaps another
      element's state (e.g. holds the tide high) — pairs beautifully with
      two-traveler levels.
- [ ] **Penrose loop chapter**: a staircase that visually loops using the
      existing magic-edge rule at three+ heights.
- [ ] **Light beams** (MV3): the orb could power a beam that toggles a mover
      lock — sequencing puzzles without new movement code.

## Story arc (chapters X+)

The arc so far: solo wanderer (I–III) → mother & child (IV–VI) → the child
grown, restoring the light (VII–IX). Natural continuation: **"The Return"** —
the lightkeeper sails home through transformed early-game architecture
(remixed Chapter I–III geometry at night, now with water), ending at the
garden from Chapter I with both doors lit. Reuse of early layouts is cheap
(same `LEVELS` entries, new palettes/mechanisms) and lands emotionally.

## Distribution

- [ ] PWA manifest + service worker for offline play (still no build step —
      hand-written manifest, one small SW file).
- [ ] itch.io mirror (zip of the repo; it's already self-contained).
