# portfolio

personal portfolio site. astro, static build. no css framework.

## Instructions

@docs/coding.md
@docs/theme.md

`coding.md` governs every file. `theme.md` governs anything that renders.
Where either conflicts with a rule below, the rule below wins.

## Commands

- dev: `npm run dev`
- build: `npm run build`
- preview: `npm run preview`
- check: `npx astro check`

Run the build and `astro check` before calling a change done.

## Tokens

Theme tokens are defined once as custom properties in `src/styles/global.css` and
consumed from scoped `<style>` blocks. Read that file before writing any markup.

- never hardcode a color, spacing value, radius, or duration; use `var(--token)`
- vertical spacing is `calc(var(--spacing) * n)`, horizontal is `ch`
- a value that does not exist yet is a missing token; say so instead of inlining one
- styles live in the component's own `<style>` block, not in global.css

## Astro

- ship zero javascript by default; a client directive needs a reason
- prefer `.astro` components; reach for a framework component only where state demands it
- content lives in content collections, not hardcoded in templates
- no dependency for something the platform or astro already does

## Content

Site copy is mine. Do not rewrite, expand, or "improve" prose in pages, project
descriptions, or the bio unless asked for that specific edit.

Any copy you do write follows the Writing rules in `coding.md`: short, factual, no
marketing tone. Applies to alt text, link labels, and metadata too.

## Out of scope

Do not add dependencies, change build config, or restructure directories without asking.
