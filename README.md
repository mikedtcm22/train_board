# train_board

Digital household calendar display styled like a split-flap train station board.

## Documents

- [Product Requirements Document](./docs/product-requirements.md)
- [Technical Implementation Plan](./docs/technical-implementation-plan.md)

## Status

Milestones 1 and 2 are complete.

Milestone 1 delivered the board prototype:

- a full-screen `/display` route
- a split-flap board UI with analog-inspired styling
- ordered multi-step split-flap character cycling
- static signboard headers and row separators
- seven visible event rows tuned for distance readability
- rotating mock family calendar states to exercise the animation system
- fullscreen mode for kiosk-style display testing
- a placeholder `/admin` route reserved for future settings work

Milestone 2 delivered live calendar integration:

- `/display` renders from a server-generated board payload
- `/api/display` returns normalized rows for the board client to poll
- Google Calendar fetching is wired server-side through OAuth refresh tokens
- recurring events are expanded through Google Calendar `singleEvents=true`
- the display is now validated against a real shared Google Calendar
- event title-only descriptions, Central time formatting, and tuned column spacing are in place
- missing calendar credentials still fall back to demo mode instead of breaking the display
- `/admin` shows the current integration status and required environment variables

## Next Milestone

Milestone 3 is admin configuration:

- build a real settings UI instead of a setup/status placeholder
- persist theme selection, user color mappings, and board thresholds
- add an admin preview workflow so display changes can be reviewed before saving

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
