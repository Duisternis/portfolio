---
title: diagrams as code
date: 2026-09-13
summary: a sketch fence that compiles to inline svg on the character grid
draft: false
---

Diagrams on this site are text. A `sketch` fence is parsed at build time and replaced
with inline svg; no image files, no diagram editor, no client javascript. The svg
lands on the same 7x18 character cell the text sits on, so a box edge lines up with a
column of prose.

## a diagram

Source:

```text
box browser at 0,0  size 20x3
box cdn     at 30,0 size 20x3
box origin  at 60,0 size 18x3

browser -> cdn    : http
cdn     -> origin : miss
```

Result:

```sketch request path
box browser at 0,0  size 20x3
box cdn     at 30,0 size 20x3
box origin  at 60,0 size 18x3

browser -> cdn    : http
cdn     -> origin : miss
```

The text after the fence language becomes the caption.

That is the whole of it for a simple picture:

| line | meaning |
| --- | --- |
| `box <name> at <col>,<row> size <w>x<h>` | a labelled box, placed in cells |
| `box <name> at ... size <w>x<h> : <text>` | body text under the name, wrapped to the box |
| `<a> -> <b>` | a link between two boxes |
| `<a> -> <b> : <label>` | the same, with a label |

`#` starts a comment. A name may contain spaces; everything before ` at ` is the name,
and the name is also the label drawn inside the box.

Positions are explicit. There is no layout pass deciding where things go, which means
a diagram looks the way it was written and a small edit does not reshuffle the rest of
the picture.

## routing

Links route themselves. The engine takes the two boxes, picks the axis with clear space
between them, and draws a three segment orthogonal path with the elbow at the midpoint.
The arrowhead is the only amber thing in the picture.

```sketch build pipeline
box markdown   at 0,0   size 22x3
box mdast      at 0,6   size 22x3
box sketch svg at 42,6  size 22x3
box html       at 0,12  size 22x3

markdown -> mdast
mdast   --> sketch svg : lang=sketch
mdast    -> html
```

A horizontal link labels above the wire, in the gap. A vertical one labels beside the
wire, or above the horizontal jog when it has one, with the block centred on the elbow.
A label never sits on a line.

Long labels wrap rather than stretch: to the gap they have, or to 24 characters when
there is no gap to measure. Nothing relocates itself, though. If the gap is too narrow
to hold anything, that is an authoring error, not something the engine quietly moves
somewhere else; widen the gap or say where the label goes.

| line | meaning |
| --- | --- |
| `<a> --> <b>` | dashed |
| `<a> <-> <b>` | a head on both ends, `<-->` for the dashed version |
| `<a> -- <b>` | a plain line, no head |
| `<a> <- <b>` | head on the other end, `<--` for the dashed version |
| `<a> -> <b> dotted` | a dotted line |
| `: <label> \| <label>` | stack two lines of label |
| `<a> -> <b> above : <label>` | label clear above both boxes, `below` for under |

## anchors

Left alone, a link picks its own sides: horizontal when the boxes have clear space
between them, vertical otherwise. Two boxes that overlap on both axes have no such
space, and the guess is wrong. `@side` settles it.

```sketch retry path
box queue  at 0,0  size 18x3
box worker at 30,0 size 18x3
box store  at 30,6 size 18x3

queue <-> worker : lease
worker -> store : write
store@left -> queue@bottom : ack
```

A link with one horizontal end and one vertical end draws as a single corner, and the
label sits at the corner rather than floating off to the side.

| line | meaning |
| --- | --- |
| `<a>@right -> <b>` | leave on a named side, let the engine choose the other |
| `<a>@bottom -> <b>@left` | name both |

Sides are `left`, `right`, `top`, `bottom`.

## boxes

A box holds more than a name. Everything after the colon is body text, `|` starts a new
paragraph, and the engine wraps it to the box and centres the block vertically. Attributes
go between the size and the colon.

| attribute | meaning |
| --- | --- |
| `shape=person` | an outline figure, `db` a cylinder, `hex` an eight sided shape |
| `align=center` | centre the text block, default is left |
| `tone=muted` | dimmed, for something outside the subject |
| `tone=focus` | accent border and name, for the thing being discussed |

The first paragraph of body text is metadata and prints dim; everything after it is
description and prints between that and the name. Three tiers, one type size.

A tone is a role, not a colour. There is no way to write a literal colour into a diagram,
which is what keeps a diagram following the theme like the rest of the page.

## groups

A group is the one thing in the language with no coordinates. It takes a list of boxes
and fits itself around them, a cell of padding on the sides and two lines at the top for
its own name. Move a member and the region follows; there is no second set of numbers
to keep in sync.

```sketch edge deploy
group edge : worker, cache

box browser at 0,7   size 16x3
box worker  at 26,3  size 16x3
box cache   at 26,11 size 16x3
box origin  at 56,3  size 16x3

browser -> worker : http
worker  -> cache  : lookup
worker  -> origin : miss
```

Groups draw behind everything else, so a link that crosses one reads as crossing a
boundary rather than colliding with a shape. A box may sit in more than one group, and
a name that is not a declared box is an error.

| line | meaning |
| --- | --- |
| `group <name> : <box>, <box>` | a dashed region fitted around the named boxes |
| `legend <key> : <text>` | one key row, bottom right; `<key>` is a tone or a line style |
| `align center` | centre this diagram in the column, off by default |

## primitives

Boxes and links cover architecture diagrams. Everything else takes raw cell coordinates
and a modifier word or two on the end of the line.

```sketch primitives
text 0,0 : primitives
line 1,3 > 1,8
path 5,8 > 9,3 > 13,8 > 17,3 dashed
circle 24,5.5 r 3
dot 24,5.5 accent
circle 34,5.5 r 3 accent
```

Coordinates take decimals, so a shape can sit on a half cell when the grid is too
coarse. Boxes and links are the only things that route themselves; a primitive goes
exactly where it is put.

| line | meaning |
| --- | --- |
| `path <col>,<row> > <col>,<row> > ...` | a polyline through any number of points |
| `line <col>,<row> > <col>,<row>` | the same thing, reads better for two points |
| `curve <col>,<row> > ...` | a smooth spline through the same kind of point list |
| `circle <col>,<row> r <cols>` | radius in columns, so it is round, not oval |
| `dot <col>,<row>` | a small filled mark |
| `text <col>,<row> : <content>` | a bare label, no box |
| `text <col>,<row> meta : <content>` | the same, dimmed; `body` for the middle tier |

Modifiers go on the end of a shape: `dashed`, `dotted`, `accent`, `arrow` for a head at
the last point, `closed` to join the last point back to the first, `filled` to fill it,
and `mask` to fill it with the page background so it hides whatever it covers. `filled`
and `mask` both imply `closed`.

## curves

A `curve` is a Catmull-Rom spline through the points, so the line passes through every
point given rather than being pulled toward a control handle. There is no control point
syntax and there will not be one; the point list is the drawing.

```sketch signal
curve 0,6 > 8,1 > 16,6 > 24,1 > 32,6 > 40,1 > 48,6 accent
line 0,6 > 48,6 dashed
dot 8,1
dot 24,1
dot 40,1
curve 56,2 > 60,1 > 63,4 > 60,6 > 56,5 filled
text 0,8 : three cycles and a blob
```

This is the half the engine was built for. A diagram is boxes and links; artwork is a
point list, a curve through it, and a fill.

## colour

Nothing in the generated svg carries a colour. Every shape gets a class and the
stylesheet resolves it:

```css src/styles/global.css
.sketch-box {
  fill: var(--color-surface);
  stroke: var(--color-border);
  stroke-width: 1;
}

.sketch-head {
  fill: var(--color-accent);
}
```

So a diagram is theme tokens the same way the rest of the page is. Change a token,
every diagram on the site follows.

## failure

A fence that does not parse fails the build with a line number:

```console
$ npm run build
SketchError: sketch line 3: cannot parse "box worker at 4 size 20x3"
```

The same happens for anything the engine can prove is wrong rather than merely ugly: a
link to a box that was never declared, a group member that does not exist, a duplicate
box name, a box linked to itself, a box whose text does not fit inside it, and a gap too
narrow to hold a label at all.

Each one is a case where the picture would still render and quietly lie about something.
A silently wrong diagram is worse than no diagram, so they are errors rather than
warnings.

One caveat worth knowing: astro catches errors thrown while rendering a content entry,
logs them, and still exits zero. So a broken diagram does not stop a build, it produces
that page with an empty body. Read the log, not the exit code.

## limits

- placement is manual, so a large graph is a lot of typing
- groups do not nest
- nothing detects two wires crossing
- a curve is measured by its points, so a hard overshoot can run past the canvas edge

