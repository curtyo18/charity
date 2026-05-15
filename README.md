# charity

A personal toolkit and record of my charity fundraising. This repository will eventually be made public, so the rules in [Public-readiness](#public-readiness) apply to every commit from day one.

## What's here today

- **`tool/`** — a static HTML / JS bake-sale match calculator. Open `tool/index.html` in any modern browser. State persists per-browser via `localStorage`; nothing leaves your machine.

## What's planned

- A records page (built with GitHub Pages from the same repo) showing past events and totals raised.
- Generalisation of the calculator to other event types as the need arises.

## Using the calculator

1. Open `tool/index.html` in a browser. Most browsers block ES modules from `file://`, so run a tiny server from the `tool/` folder — e.g. `python -m http.server 8000` — and visit `http://localhost:8000/`.
2. Enter the totals donated by others, any Gift Aid claimed on those donations, and the number of participating bakers.
3. The breakdown updates live and lists every contribution that adds to the grand total. The "Top up to employer cap" button populates your personal-match override with the amount needed to unlock the full employer match (or the default 50% if the cap is already met) and shows a tick when active. A status line below the grand total tells you whether the employer cap is met or how much more would unlock it.

## Running the math tests

The math layer in `tool/math.mjs` is covered by unit tests in `tool/math.test.mjs`. To run them you need Node.js ≥ 18 (no install of any test framework needed):

```bash
node --test tool/math.test.mjs
```

There are no UI tests — verify the form behaviour manually in a browser.

## Public-readiness

This repo will be flipped from private to public at some point. To make that switch a non-event rather than a scramble, every commit follows these rules:

- **No employer name** anywhere in code, comments, README, or commit messages. Use "employer" or "company matching scheme" in any user-facing string.
- **No baker, donor, or other personal names** anywhere — code, comments, sample data, screenshots.
- **No real donation totals committed.** The calculator's real numbers live only in your browser's `localStorage`. Any example numbers in code or docs are fictional (e.g. the worked example uses £1,700, £200, etc.).
- **The records page (future)** is permitted to include real aggregate totals from past fundraisers — fundraising totals are typically public anyway via JustGiving and similar — but still no PII.
- **Commit messages** also follow these rules; they end up public when the repo flips.

If you spot a violation in an existing commit, rewrite history with `git filter-repo` before pushing the fix. A cleanup commit does not actually remove a leak from history.

## Project layout

```
charity/
├── README.md              # this file
├── .gitignore             # OS/editor noise + node_modules reservation
└── tool/                  # the bake-sale calculator
    ├── index.html         # form + breakdown layout
    ├── style.css          # plain CSS, system fonts, dark theme
    ├── app.js             # DOM wiring, localStorage, debounced render
    ├── math.mjs           # pure math, importable in browser AND node --test
    └── math.test.mjs      # node --test compatible unit tests
```

## License

No licence file yet — to be decided before the repo is flipped public. Until then, the default "all rights reserved" applies.
