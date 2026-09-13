# workflow

## the cache trap, read this first

Astro's content layer stores rendered markdown keyed by a **content digest** in
`.astro/data-store.json`. Editing `src/lib/sketch.ts` does not change any markdown, so
nothing re-renders and the page serves the old svg. This cost an hour once.

To push an engine change into a page:

```
rm -rf node_modules/.astro    # the build store
npm run build
```

For the dev server, restart it and clear the dev store, and do not run a build in between,
because a build rewrites `.astro/data-store.json` and puts the stale record back:

```
npx astro dev stop
rm -f .astro/data-store.json
npx astro dev --background
```

`--background` matters if an agent needs to read the log; `astro dev logs` only works for a
server started that way. `touch` on the markdown does nothing, the digest is unchanged.

## a render error does not fail the build

Astro catches errors thrown while rendering a content entry, logs them, and exits zero. A
diagram that throws publishes that page with an empty `<article>`. If a page goes blank,
look for `[ERROR] [glob-loader]` in the build output.

## before calling a change done

```
npm run build
npx astro check
```

`astro check` currently reports 3 errors, all pre-existing in `src/pages/about.astro`
around lines 121 to 129, an `Entry` props type mismatch unrelated to any of this. If the
count is still 3, nothing new broke.

Also rebuild both diagram writeups and recheck them, they are the real test suite.

## checking a diagram

Render outside Astro to iterate quickly:

```js
import { renderSketch } from './src/lib/sketch.ts';
console.log(renderSketch(source, 'caption'));
```

```
node --experimental-strip-types script.mjs
```

Extend it to compare label boxes against shape boxes when a diagram gets dense. Paint
order matters: a `filled` or `mask` shape declared later covers a line declared earlier.
