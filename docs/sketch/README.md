# sketch engine

A diagram language that compiles to inline svg at build time. Written for this site, not
a general tool. Start here, then read whichever file answers the question.

| file | holds |
| --- | --- |
| `grammar.md` | the language, every line shape and modifier |
| `internals.md` | how the code works, file by file |
| `decisions.md` | why it is the way it is, including what was rejected |
| `workflow.md` | how to work on it without wasting an hour on a stale cache |

## what it is

A fenced block in a writeup:

```` ```sketch request path ````

is parsed at build time and replaced with inline svg. The fence meta becomes the
`<figcaption>`. No images, no diagram editor, no client javascript in the diagram itself.

Coordinates are character cells, 7px wide and 18px tall, the same cell the prose sits on.
A box edge lines up with a column of text. Nothing carries a colour; every shape gets a
class and `global.css` resolves it to a theme token.

## where it lives

```
src/lib/sketch.ts              the whole engine, ~800 lines, no dependencies
src/styles/global.css          every .sketch-* class
astro.config.mjs               registers sketchPlugin with the markdown processor
src/pages/writeups/[...slug].astro   the click-to-open viewer script
```

## what uses it

- `src/content/writeups/diagrams-as-code.md` documents the language and is the render test
- `src/content/writeups/c4-benchmark.md` reproduces three C4-PlantUML diagrams

Both are published. Editing the engine means rechecking both.
