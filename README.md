# charity

A personal toolkit and record of my charity fundraising. This repository will eventually be made public, so the rules in [Public-readiness](#public-readiness) apply to every commit from day one.

## What's here today

- **`index.html` + `assets/` + `data/events.json` + `events/`** — a static records site. Home page shows overall totals + a by-year chart + event cards; each event has its own detail page at `/events/<slug>/`. Renders client-side from `data/events.json`. Run `./serve.sh` from the repo root and visit `http://localhost:8000/`. Adding an event = append to `data/events.json` and copy any existing folder under `events/` to a new slug.
- **`tool/`** — a static HTML / JS bake-sale match calculator, now sharing the records site's nav header and footer. Open via the same local server at `http://localhost:8000/tool/`. State persists per-browser via `localStorage`; nothing leaves your machine.

## Running locally

The whole site is static — no build step. From the repo root:

```bash
./serve.sh            # serves http://localhost:8000/
./serve.sh 8080       # custom port
```

`serve.sh` is a thin wrapper around `python3 -m http.server` so paths resolve the same whether you visit `/`, `/tool/`, or `/events/<slug>/`. Opening the files directly via `file://` will not work because the pages fetch `data/events.json` and load ES modules.

## What's planned

- Generalisation of the calculator to other event types as the need arises.

## Using the calculator

1. Start the local server (`./serve.sh` from the repo root) and visit `http://localhost:8000/tool/`. Opening `tool/index.html` directly via `file://` will not work because the calculator loads ES modules.
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
├── serve.sh               # local dev server (python3 -m http.server wrapper)
├── index.html             # records home page shell
├── assets/                # shared stylesheet + renderer for the records pages
│   ├── styles.css
│   └── app.js
├── data/
│   └── events.json        # source of truth for the records pages
├── events/                # one folder per event, named by slug
│   └── <slug>/index.html  # event detail page shell
└── tool/                  # the bake-sale calculator
    ├── index.html         # form + breakdown layout, shares the nav and footer
    ├── style.css          # plain CSS, system fonts, dark theme
    ├── app.js             # DOM wiring, localStorage, debounced render
    ├── math.mjs           # pure math, importable in browser AND node --test
    └── math.test.mjs      # node --test compatible unit tests
```

## License

No licence file yet — to be decided before the repo is flipped public. Until then, the default "all rights reserved" applies.
