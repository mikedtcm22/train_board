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

## Milestone 2 Progress

The board now has a live data path:

- `/display` renders from a server-generated board payload
- `/api/display` returns normalized rows for the board client to poll
- Google Calendar fetching is wired server-side through OAuth refresh tokens
- recurring events are expanded through Google Calendar `singleEvents=true`
- missing calendar credentials fall back to demo mode instead of breaking the display
- `/admin` shows the current integration status and required environment variables

Remaining Milestone 2 work is primarily real-calendar setup and validation against your actual household calendar data.

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:

```bash
GOOGLE_CALENDAR_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_TIME_ZONE=America/Chicago
BOARD_USER_TONES=parent1@example.com=sky,parent2@example.com=amber
```

Optional knobs:

- `BOARD_STARTING_SOON_MINUTES`
- `BOARD_ALMOST_OVER_MINUTES`
- `GOOGLE_CALENDAR_MAX_RESULTS`

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/display`.

For local development, the default `dev` script uses webpack mode instead of Turbopack. This avoids a Turbopack client-manifest bug that intermittently broke `/display` during live development. If you want to test Turbopack anyway, use `npm run dev:turbo`.
