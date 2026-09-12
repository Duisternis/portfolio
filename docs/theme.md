# UI Theming Guidelines

## Principle

The interface should feel like a well-designed technical instrument: engineered, not decorated. Dark, quiet, precise, slightly industrial. Dense where information matters, spacious where hierarchy matters.

Personality comes from proportion, typography, and information hierarchy — never from decoration.

Influences (as sensibility, not theme): engineering instruments, technical documentation, workshop equipment, old technical manuals.

## Tokens

Define these once and reuse them everywhere. Do not introduce one-off values unless the purpose is genuinely different.

**Color**

- `bg` — near-black charcoal
- `surface` — slightly lighter charcoal (elevated)
- `surface-2` — dark grey (secondary)
- `border` — low-contrast grey, visible but not assertive
- `text` — warm off-white
- `text-2` — muted grey
- `text-3` — dim grey (metadata)
- `accent` — muted amber

**Type**

- GohuFont (bitmap) for everything: content, headings, labels, metadata
- One size, 14px, 18px line height. No scale, no second size anywhere
- One weight, 400. The font has no bold and no italic; emphasis is colour only
- Bitmap font, so only 14px and integer multiples render correctly. Never scale it
- Smoothing off: `-webkit-font-smoothing: none`, `font-smooth: never`

**Spacing / geometry**

- Vertical spacing is multiples of `--spacing` (9px, half a line), so everything
  lands on the 18px baseline
- Horizontal spacing and column widths are in `ch`, so they land on the character cell
- Border width: 1px default
- Radius: small or moderate, one value plus an optional larger one
- Transitions: short, 120ms to 200ms, opacity and small position only

**Grid**

- `--col-left` 24ch, `--col-main` 80ch, `--col-right` 30ch, `--gutter` 6ch
- Fixed widths, centred block. Never stretch the gutters to fill the viewport

## Accent

Amber is an indicator light, not a brand color. Use it for active navigation, links, focus states, selected elements, small status indicators, and small graphical details.

Never use it as a large surface, a gradient, or a glow. The interface stays predominantly neutral.

## Surfaces

Spacing and alignment carry division. A gap between groups is the separator; a rule
line is not. No rules under headings, no vertical column bars, no middot separators
between list items.

Dot leaders are the one exception, and they are not a rule line. Use them scarcely: at
most one row per group, on the row that heads it. A leader ties a name on the left to
its value on the right across a wide gap; rows that are already close together do not
get one, they right-align instead. Leaders are `text-3`.

Do not number things for texture. Indices appear only where the number is the
information. Selection is a `>` marker in a fixed one character column, blank when not
selected, so nothing shifts.

Scrollbars are hidden while scrolling stays available. Temporary, pending a replacement.

Borders and tonal shifts are for the few things that are genuinely a container: a code
block, an input. Shadows are absent. Most content is not a card.

## Layout

Three columns, fixed widths, identical on every route. Navigating must not move the
main column or change the frame. A rail that has nothing to say on a page is still a
rail; give it something real or leave it empty, never collapse it.

Repeated things share one layout. Same columns, same order, same indent, stacked one
below another, so the eye reads down a single edge.

The character grid cannot reflow. Below 1180px the layout stacks to one column, below
700px it goes fluid and the grid is given up rather than shrunk.

## Density

High information density is fine if it stays readable. Small uppercase or monospace labels, indices, dates, versions, and status indicators are the main tools for hierarchy.

Include such elements only when they carry real information. Never fabricate technical-looking detail for effect.

## Components

All controls share border treatment, radius, type, spacing, and interaction behavior. Every interactive element needs default, hover, focus, active, disabled, and selected states. Focus states stay visible and accessible.

Icons are simple and geometric with consistent stroke weight and a small footprint. No emoji in the UI.

## Dates

Three letter month plus two digit year, lowercase: `aug 26`. Ranges are two of those
separated by spacing, never a dash: `feb 26  aug 26`. Use a bare year only when the
month is genuinely unknown.

## Copy

Concise, factual, direct, slightly technical. No marketing language, slogans, or forced cleverness. The design carries the personality.

## Imagery

Only if purposeful: photographs, technical illustrations, diagrams, screenshots, textures, simple abstract compositions. No stock photography, no AI or cybersecurity imagery, no decorative 3D renders.

## Prohibited

Rule lines under headings. Middot separators. A second font size. Faux bold or faux
italic. Cyberpunk or hacker-terminal aesthetics. Matrix styling. Neon or gradient accents. Glassmorphism and frosted panels. Glowing elements. Heavy shadows. Large rounded floating cards. Giant hero typography. Animated backgrounds, parallax, glitch, typing effects, or any motion without a functional reason. Fake terminal output, circuit-board patterns, scattered code or binary as decoration. Generic SaaS or developer-portfolio styling.
