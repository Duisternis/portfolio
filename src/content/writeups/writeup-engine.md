---
title: what this writeup engine can do
date: 2026-09-13
summary: the markdown features these writeups are built on, and what renders how
draft: false
---

Every writeup here is a markdown file in a content collection. Astro renders it at
build time; nothing ships to the browser except the html. This post is the test page
for that pipeline.

## text

Body copy is `text-2`, headings are `text`, metadata is `text-3`. There is one font
size and one weight, so emphasis is colour only. Inline code like
`getCollection('writeups')` picks up the amber accent.

Lists stay flat:

- markdown in, static html out
- syntax highlighting resolved at build, no client runtime
- headings feed the contents rail on the right

> Quotes sit behind a left border and drop to the dim grey.

## code

Fenced blocks take an optional filename after the language. It renders above the
block and sticks to the left edge while the block scrolls.

```ts src/lib/shiki.ts
export const codeLabel: ShikiTransformer = {
  name: 'code-label',
  pre(node) {
    const file = this.options.meta?.__raw?.trim();
    if (file) node.properties['data-file'] = file;
  },
};
```

The highlighting theme is deliberately narrow: keywords and functions in the body
colour, strings and numbers in amber, punctuation and comments dim. No rainbow.

## diffs

A `diff` fence gives added and removed lines their own muted green and red.

```diff src/pages/writeups/[...slug].astro
 const { post } = Astro.props;
-const { Content } = await render(post);
+const { Content, headings } = await render(post);

-<article>
+<article class="prose">
   <Content />
 </article>
```

Shell sessions work the same way:

```console
$ npm run build
12:04:11 [build] 9 page(s) built in 1.42s
```

## tables

| token | role |
| --- | --- |
| `text` | headings, code body |
| `text-2` | prose |
| `text-3` | metadata, comments, filenames |
| `accent` | links, strings |

## next

Diagrams are written as code too. That one has [its own writeup](/writeups/diagrams-as-code).
