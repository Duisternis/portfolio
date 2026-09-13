# decisions

Why the engine is shaped this way. Most of these came from a diagram that refused to draw,
not from planning.

## placement is explicit, there is no layout pass

Every box carries its own coordinates. The engine never moves anything.

A layout pass would remove the tedious part, and it is the single biggest gap. It was
skipped because a diagram that reshuffles when you add a node is worse than one you place
by hand, and because the work is a real graph layout problem, not an afternoon.

This is also what stands between the engine and a C4 compiler. The vocabulary maps
cleanly; the placement does not map at all.

## nothing relocates itself

An early version moved a label that did not fit clear of its boxes. It looked fine on a
three box diagram and got worse as density rose, which is exactly backwards.

Now a label wraps to the room it has, and if there is no room at all that is an error. The
author widens the gap or says `above` or `below`. Predictable beats clever.

## colour is a role, not a value

`fill=#438DD5` existed for about an hour while reproducing C4, then was removed for
`tone=muted` and `tone=focus`.

The reason: every other colour on this site is a theme token, and a diagram carrying
literal hex is a foreign object that stops following the theme. A tone says what something
is, the stylesheet decides what that looks like. Reproducing a foreign notation is not a
good enough reason to break that.

The one place this rule is still broken is `src/lib/shiki.ts`, where syntax highlighting
hardcodes the palette, because shiki writes inline styles and cannot read a custom
property. Known, flagged, not worth a post-processing pass yet.

## one type size

The site has one size everywhere. A 28px diagram title was built and then removed: a
diagram title has no business outranking a document heading, and the font is a bitmap that
only renders at whole multiples.

Hierarchy inside a diagram is colour instead, three tiers, and the figure caption is the
title.

## errors over warnings

The engine errors only where the picture would still render and quietly lie: a duplicate
name silently rebinds every link pointing at it, a long box label draws straight through
its border, a self link makes a degenerate path.

It does not police the merely ugly. Overlapping boxes are sometimes deliberate, crossing
wires are unavoidable past a certain density, and nothing aesthetic is checked at all.

## verify with a script, not by looking

Every congestion fix in these diagrams was checked by a throwaway node script that renders
the source and compares every label against every box and every other label, then against
every line segment, accounting for paint order.

Eyeballing missed things repeatedly. Write the checker, it takes five minutes.

## rejected

- **control points on curves.** The point list is the drawing. Handles turn artwork into a
  fight with the parser.
- **nested groups.** One level covers the diagrams that exist. Nesting needs padding rules
  and a draw order that would be guesswork.
- **a grid overlay.** Useful while authoring, but it only pays off once placement is
  costing real time, and a proper editor would obsolete it.
- **a hover magnifier.** Built, then replaced by click to open. A lens that follows the
  cursor reads a small area at a time; the full screen viewer just shows the diagram.
- **arrow length as a property.** Length is the distance between the boxes. A separate
  knob would let the arrow disagree with the geometry it connects.
