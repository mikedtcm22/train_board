# train_board

Digital household calendar display styled like a split-flap train station board.

## Documents

- [Product Requirements Document](./docs/product-requirements.md)
- [Technical Implementation Plan](./docs/technical-implementation-plan.md)

## Status

Milestones 1, 2, and 3 are complete.

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

Milestone 3 delivered admin configuration:

- `/admin` is now a real settings page rather than a setup placeholder
- account email addresses can be mapped to description text colors without editing code
- the palette now offers 10 stronger color choices for names and statuses
- status timing, visible status text, and status text colors are persisted from the admin page
- admin settings are stored locally and immediately drive the live display board

## Next Milestone

Milestone 4 is device tuning:

- validate the display on the target Fire Stick/browser setup
- tune animation cadence, font sizing, and long-running stability
- tighten kiosk behavior for always-on monitor use

## Environment Setup

Copy `.env.example` to `.env.local` and fill in:

```bash
GOOGLE_CALENDAR_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_TIME_ZONE=America/Chicago
BOARD_USER_TONES=parent1@example.com=blue,parent2@example.com=yellow
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
