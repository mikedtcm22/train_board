# train_board

Digital household calendar display styled like a split-flap train station board.

## Documents

- [Product Requirements Document](./docs/product-requirements.md)
- [Technical Implementation Plan](./docs/technical-implementation-plan.md)

## Status

Milestone 1 is complete. The repository now includes a polished static Phase 1 prototype with:

- a full-screen `/display` route
- a split-flap board UI with analog-inspired styling
- ordered multi-step split-flap character cycling
- static signboard headers and row separators
- seven visible event rows tuned for distance readability
- rotating mock family calendar states to exercise the animation system
- fullscreen mode for kiosk-style display testing
- a placeholder `/admin` route reserved for future settings work

## Next Milestone

Milestone 2 is Google Calendar integration:

- connect one shared Google Calendar
- normalize live events into board rows
- replace demo snapshots with server-driven display payloads
- preserve the current board styling and animation model while wiring live data

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/display`.

For local development, the default `dev` script uses webpack mode instead of Turbopack. This avoids a Turbopack client-manifest bug that intermittently broke `/display` during live development. If you want to test Turbopack anyway, use `npm run dev:turbo`.
