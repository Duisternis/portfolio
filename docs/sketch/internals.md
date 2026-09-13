# internals

`src/lib/sketch.ts`, about 800 lines, no dependencies. Two exports:

- `renderSketch(source, caption?)` returns an svg string, or a `<figure>` when captioned
- `sketchPlugin`, a Sätteri mdast plugin that swaps a `sketch` code node for that string

## pipeline

```
markdown  ->  sketchPlugin.code()  ->  renderSketch  ->  raw html spliced back in
```

Inside `renderSketch`:

1. `parse` walks the source line by line into `{ boxes, links, art, groups, legend, centred }`
2. `rect` turns each box into pixels; `frames` maps name to rect
3. `place` routes every link and positions its label
4. `bounds` fits each group around its members
5. `extent` measures everything and returns the viewBox
6. the draw functions emit strings, in paint order
7. `drawLegend` sits below the content, right aligned

Paint order is groups, boxes, primitives, links, legend. Primitives draw in source order,
which is how a `filled` shape can cover a lifeline declared earlier.

## the parser

One regex per line shape, tried in order, first match wins. Order matters in two places:

- `TEXT` is tried before `splitModifiers`, so a caption ending in the word `dashed` is not
  eaten as a modifier
- `LINK`'s arrow alternation is longest first, `<-->|<->|<--|<-|-->|->|--`

`splitModifiers` pops known trailing words off the end of a line. `parseAttrs` reads
`key=value` pairs and rejects anything left over, so a typo is an error rather than
silently ignored.

## routing

`pickSides` compares the horizontal and vertical separation of two boxes and takes the
larger. An explicit `@side` overrides it. `anchor` turns a side into a point on the edge,
`elbow` returns the polyline, and `straight` renders it.

Four side combinations, three path shapes:

- both horizontal: H, V, H with the elbow at the midpoint x
- both vertical: V, H, V
- mixed: a single corner

`route` returns `points`, which `extent` measures. This matters: a link can leave the box
hull entirely, and before that was fixed such a wire ran off the canvas.

## labels

`place` folds each label paragraph to the available width, then picks a first baseline
from the placement:

| case | stack |
| --- | --- |
| `below` | down from the anchor |
| `above`, or a horizontal link | up, last line just above the wire |
| a vertical link | centred on the elbow |

The label's first baseline is stored already shifted, so `drawLink` and `extent` both just
walk `y + index * CELL_H` and cannot disagree.

## geometry constants

```
CELL_W 7    cell width, the font's advance at 14px
CELL_H 18   cell height, the site's line height
BASELINE 13 baseline offset inside a cell
PAD 1       cells of padding around the canvas
LABEL_WIDTH 24  fallback wrap width when there is no gap to measure
```

These are the one place the engine hardcodes the type metrics. CSS cannot hand a number to
a build script, so a font size change means editing these too.

## shapes

`outline` returns the border for a box. `db` is a path with two elliptical caps plus a
second arc for the visible lip. `hex` is an octagon with a one cell corner cut. `person`
is a rounded rect plus a head circle above the top edge, which `extent` has to know about
or the head clips.

## the viewer

`src/pages/writeups/[...slug].astro` carries an inline script, loaded only on writeup
pages. Clicking a diagram clones it into a full screen overlay, positioned at the source
element's exact rect, then transitions to a fitted transform. Drag pans, wheel zooms at
the cursor, Esc or a background click closes it and animates back.

Two CSS traps, both already hit and fixed:

- `img, svg { max-width: 100% }` applies to diagrams. The inline copy wants
  `height: auto` with it, or the browser letterboxes the drawing inside a too tall box.
  The viewer's clone wants `max-width: none`, or the lens shows a shrunken copy.
- a `moved` flag guards the close-on-click, otherwise a drag that ends on the backdrop
  closes the viewer and reads as the drag not working
