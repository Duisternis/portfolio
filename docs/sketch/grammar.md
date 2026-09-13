# grammar

One statement per line. Blank lines ignored, `#` starts a comment. A name may contain
spaces; for a box everything before ` at ` is the name.

Coordinates are cells and take decimals, so `28.5` is half a line down. A cell is 7px
across and 18px down.

## boxes

```
box <name> at <col>,<row> size <w>x<h> [attrs] : <body>
```

Body is optional. `|` starts a new paragraph. The engine wraps each paragraph to the box
width and centres the whole block vertically, splitting an odd leftover row into 9px
above and below.

Text tiers inside a box, one type size, colour only:

| line | colour |
| --- | --- |
| the name | `--color-text` |
| paragraph 1 | `--color-text-3`, metadata |
| paragraph 2+ | `--color-text-2`, description |

The tier follows the paragraph, not the rendered line, so a metadata string that wraps
keeps its colour on the second line.

| attribute | values |
| --- | --- |
| `shape=` | `rect` (default), `person`, `db`, `hex` |
| `align=` | `center`, default is left |
| `tone=` | `default`, `muted`, `focus` |

There is deliberately no way to write a literal colour. See `decisions.md`.

## links

```
<a> -> <b> [placement] [dotted] : <label> | <label>
```

| arrow | meaning |
| --- | --- |
| `->` | head at the target |
| `<-` | head at the source |
| `<->` | heads at both ends |
| `--` | no head |
| `-->` `<--` `<-->` | the dashed versions |

`dotted` is a trailing word, not an arrow form, because it combines with any of them.

Ends take an optional side: `mdast@right -> worker@left`. Sides are `left`, `right`,
`top`, `bottom`. Without one the engine picks the axis with the larger separation.

Labels wrap: to the gap they have, or to 24 characters when there is no gap to measure.
A horizontal link labels above the wire in the gap. A vertical one centres its block on
the elbow, beside the wire when there is no jog. `above` and `below` move the block clear
of both boxes and stack it away from them.

## groups

```
group <name> : <box>, <box>, <box>
```

The only thing in the language with no coordinates. Fits itself around its members, one
cell of padding each side and two lines at the top for its name. Drawn behind everything.

## primitives

```
path <col>,<row> > <col>,<row> > ...
line <col>,<row> > <col>,<row>
curve <col>,<row> > ...
circle <col>,<row> r <cols>
dot <col>,<row>
text <col>,<row> [meta|body] : <content>
```

`curve` is a Catmull-Rom spline through the points, so it passes through every point
given. There is no control point syntax.

`circle` radius is in columns, so it is round rather than oval on a non-square cell.

`text` takes the same three tiers as a box body: default is the text colour, `meta` is
dim, `body` is between.

Trailing modifiers on a shape:

| modifier | effect |
| --- | --- |
| `dashed` `dotted` | stroke pattern |
| `accent` | amber stroke, or amber fill on a dot |
| `arrow` | head at the last point, angled to the last segment |
| `closed` | join the last point back to the first |
| `filled` | fill with `--color-surface-2`, implies `closed` |
| `mask` | fill with `--color-bg` and no stroke, implies `closed` |

`mask` exists to hide what is behind a label, a lifeline most often, without looking like
a panel.

## document directives

```
legend <key> : <text>
align center
```

`legend` adds one key row bottom right; `<key>` is a tone (`muted`, `focus`) or a line
style (`solid`, `dashed`, `dotted`), which decides the swatch. `align center` centres
this diagram in the column; off by default, and it does not move the caption.

## errors

These fail rather than render something subtly wrong:

- a line that does not parse, with its line number
- a link to a box that was never declared
- a group member that is not a declared box
- a duplicate box name
- a box linked to itself
- box text wider or taller than the box
- a gap too narrow to hold a label at all, under 8 cells

Astro catches render errors, logs them, and still exits zero. A broken diagram publishes
that page with an empty body. Read the log, not the exit code.
