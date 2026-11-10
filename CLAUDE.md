# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is pnpm (`pnpm-lock.yaml`).

- `pnpm dev`: webpack-dev-server in development mode
- `pnpm build`: production build to `dist/` (gitignored)

There are no tests, linter, or typecheck script. `ts-loader` reports type errors during the build; `npx tsc --noEmit` checks types on their own. Formatting follows `.prettierrc` (no semicolons, single quotes, 90-column width, es5 trailing commas). Older files mix in double quotes and semicolons.

## What this is

A single-page generative audio toy, the "Windmill falling ball chime". Balls drop into a Matter.js physics world whose walls oscillate and whose center bar rotates. Collisions trigger Tone.js synths. There's no framework: `index.pug` is the HTML template (built by html-webpack-plugin with pug-loader), `src/index.ts` is the webpack entry, and everything in `assets/` (favicon, robots.txt, og image) is copied into the build root as-is.

## Architecture

- **`src/index.ts`**: wires the `#add-body` button and the spacebar to one click handler. The first interaction must call `initializeApp()`, which runs `Tone.start()`, because browsers need a user gesture to start audio. After that, each interaction calls `addCircle()`.
- **`src/lib/compositions/`**: a composition is a factory function (`compositionOne()`). It creates the Matter engine and renderer (a canvas appended to `document.body`), builds the bodies, instantiates the synths, registers engine event handlers, and returns `{ initializeApp, addCircle, isInitialized }`. Mutable state goes out through getter functions, because destructuring copies plain values once. New pieces belong here as further `compositionN` modules, re-exported from `index.ts`.
- **`src/lib/synths/`**: each file exports a factory that builds a Tone instrument with its own effect chain (reverb, delay, vibrato) and returns the synth. Compositions call these factories and route the output through a shared `Tone.Volume`.

### How sound is mapped in `compositionOne`

- Bodies are identified by their `label` string ('Ball', 'Ground', 'CenterWall', 'LeftWall', and so on; the ceiling is spelled 'Cieling'). The `collisionStart` handler checks `pair.bodyA`/`pair.bodyB` labels to pick which synth plays: a ball hit plays a random note from `highNotes`, the center wall plays bass and metal on `lowNotes`, and the ground plays the wall synth.
- `beforeUpdate` moves the static walls along sine paths driven by `engine.timing.timestamp` and rotates the center wall.
- `afterUpdate` triggers an "explosion" every 5s that pushes up non-static bodies below y=500 and plays a low wall-synth note.
- Levels are set relative to `MASTER_VOLUME`, and each trigger reassigns them.

## Gotchas

- Wall sizes depend on `w`/`h`, so the walls are built in `createWalls()`. The debounced resize handler resizes the renderer, removes the old walls, builds new ones, and carries over the center wall's angle. Any new body whose size depends on the viewport needs to go through the same rebuild.
- `popmotion` and `xstate` are dependencies that nothing in the code uses yet.
