# Conventions

Applies to code written or modified going forward, in any language.

Do not retrofit existing code to this guide. Leave untouched code untouched, and preserve
the comments already in files you edit. If a change makes a nearby comment wrong, say so
instead of rewriting or deleting it.

## Priority

Correctness and security, then clarity, then maintainability, then brevity. When two pull
against each other, that order settles it.

## Comments

**Write none.** No inline comments, no block comments, no docstrings, no doc comments on
public API, no TODOs, no header banners. The user owns every comment in the repository.

Two consequences, both deliberate:

- Names, types, and function boundaries carry intent. Code that needs prose to be read is
  rewritten, not annotated.
- A non-obvious decision has nowhere to live in the file. State it to the user instead, in
  the commit message, or wherever the project records decisions.

**Not comments.** Pragmas, build directives, linter and type-checker suppressions,
shebangs, license headers, and codegen banners are syntax. Write them whenever they are
required.

## Code

- **Structure carries the explanation.** Types, names, function boundaries, and module
  layout are the only tools available; there are no comments to fall back on.
- **Match the file you are editing** over anything preferred here. A consistent file beats
  a correct-by-this-document file. Absent a local convention, pick one and hold it.
- **Defer to the formatter and linter.** Never hand-format against them, never disable a
  lint to keep a shape you like.
- **No speculative abstraction.** Introduce indirection when a second caller exists, not
  before. One implementation behind an interface is a wrong guess waiting to be found.
- **Delete what a change makes dead.** No unused parameters, exports, or config knobs.
- **Isolate IO and mutable state at the boundary.** Keep the logic between boundaries pure
  and testable without a screen, a disk, or a clock.
- Do not touch code the change does not require. Unrelated cleanup is a separate commit.

## Naming and structure

- Omit context the module, type, or class already carries.
- Local names short, exported names explicit and searchable.
- Guard clauses and early returns over nesting.
- Functions do one thing; a function that needs a section break wants to be two functions.
- Keep implementation private to the smallest useful scope.
- Extract a helper when it simplifies control flow, not to hit a line count.

## Errors

- Fail closed. Never fall back to a less safe path: unverified, unauthenticated,
  unencrypted, unsigned.
- Propagate with context. Never swallow an error, never leave an empty handler.
- Never substitute a default or placeholder for a failed operation.
- Handle expected failures explicitly. A catch-all must not hide unexpected ones.
- Panics, aborts, and process exits belong at the entry point, not in library paths.
- Keep errors typed. No stringly-typed errors across a module boundary.
- Confine unsafe or unchecked escapes to a single boundary layer, and state the invariant
  each one upholds.

## Writing

Every word committed: README, docs, commit messages, issue text, and any
user-facing help output and error strings.

- short; compact, but readable before compact
- no em dashes or en dashes; use a semicolon, a comma, or a new sentence
- no emoji
- lowercase fragment bullets, one change per line, no trailing period
- state the change, and the reason inline when it is not obvious;
  "bumped dnr rule limit, 5000 was dropping rules silently"
- no marketing tone, no hedging
- headings and bullets over paragraphs; a paragraph is for reasoning, not for a list
