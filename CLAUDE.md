# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server at http://localhost:5173/regex-builder/
npm run build     # production build → dist/
npm run preview   # serve the built dist/ locally
```

## Architecture

The app is a static Vite + React SPA deployed to GitHub Pages.

**State flows in one direction**: `App` owns the single `config` object (shape defined by `DEFAULT_CONFIG` in `regexEngine.js`) and passes slices down to each form section. Every section calls `onChange(changes)` which merges into the relevant config slice via `updateSection`.

**`src/regexEngine.js`** is a pure JS module (no React). `buildRegex(config)` is the only function consumers need — it takes the full config and returns a regex string. All regex assembly logic lives here. `DEFAULT_CONFIG` is the canonical state shape.

**`src/components/BuilderForm.jsx`** assembles five section components, each receiving only its own config slice and a pre-bound `onChange`. The shared `Section.jsx` wrapper handles the enable/disable toggle pattern.

**`src/components/TestPanel.jsx`** runs `new RegExp(regex, 'g')` in the browser and splits the input text into match/non-match segments for highlight rendering. It guards against infinite loops on zero-length matches (e.g. `\b`).

## GitHub Pages deployment

The workflow at `.github/workflows/deploy.yml` triggers on every push to `main`, builds with Vite, and deploys `dist/` via the official `actions/deploy-pages` action.

**One-time setup required**: In repo Settings → Pages → set Source to **"GitHub Actions"**.

`vite.config.js` sets `base: '/regex-builder/'` — this must match the GitHub repo name exactly for asset paths to resolve correctly on Pages.
