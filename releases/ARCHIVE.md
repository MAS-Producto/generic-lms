# Prototype releases (archive)

Frozen snapshots of PRD + HTML live under `releases/vN/`. The **working copy** is always at the repo root (`prd.md`, root `*.html`).

## How release works

1. Finish a client-approved generation at the repo root.
2. In Cursor chat, say **"Release prototype"** or run **`/release-prototype`** (no version numbers).
3. The Agent archives the current generation to `releases/vN/`, then bumps the root PRD **Version** automatically.

Do not edit files inside `releases/` — they are read-only history. To view an old prototype locally, run `npx serve .` from the repo root and open paths under `/releases/`.

`releases/` is **not** served on the public client URL (GitHub Pages deploy filter). What is public vs team-only is described in [`GUIDE.html`](../GUIDE.html).

## Release index

This file is **`ARCHIVE.md`** (not `README.md`) so it is not affected by root `.gitignore`, which ignores only the starter readme at `/README.md`.

| Version | PRD ID | Frozen on | Summary | Path |
| :---- | :---- | :---- | :---- | :---- |
| 1 | `0a8d4c6e-c949-49d8-88de-71f0dde4be0c` | 2026-06-08 | Mi formación prototype complete (§10, Mis favoritos, masconsultores) | `releases/v1/` |

*The Agent appends a row on each release.*
