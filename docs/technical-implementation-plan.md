# Train Board Technical Implementation Plan

## Current Project State

Milestones 1, 2, and 3 are complete.

Implemented in the current prototype:

- hosted Next.js app structure with `/display` and `/admin`
- analog-inspired split-flap board styling
- static header row with non-flap labels
- seven visible board rows
- fullscreen toggle for kiosk-style preview
- rotating mock event data
- ordered forward-only character cycling for changed tiles
- in-place animation for tone-changing fields such as event name and status
- live Google Calendar polling through `/api/display`
- server-side normalization of shared calendar events into board rows
- real-calendar validation against one shared family calendar
- configurable app-level time zone support for the displayed times
- separate admin settings UI for account color mapping
- persisted status settings for timing, labels, and colors
- expanded 10-color palette for description and status text
- local persisted admin settings store feeding the live board

Milestone 4 should begin from the current prototype rather than reworking the display design, live data path, or admin feature set. The board layout, animation model, Google Calendar integration, and separate admin route should now be treated as the baseline unless device validation exposes a concrete issue.

## 1. Objective

Build a hosted web application that reads a single shared Google Calendar and renders a fixed-layout split-flap board display suitable for a wall-mounted 24" monitor, with a separate web admin interface for configuration.

## 2. Recommended Architecture

### Stack

- Framework: Next.js with the App Router
- Language: TypeScript
- Styling: Custom CSS with design tokens and CSS variables
- Animation: Custom split-flap animation engine using CSS transforms plus the Web Animations API where needed
- Server runtime: Next.js server routes for calendar fetch and admin actions
- Persistence: Supabase Postgres or a similar lightweight hosted Postgres service
- Authentication:
  - Google OAuth for calendar access
  - Simple admin session gate for the admin route
- Hosting: Vercel

### Why This Stack

- Next.js keeps display, admin, server routes, and deployment in one project.
- Custom CSS is a better fit than utility-first styling for a highly bespoke split-flap aesthetic.
- Server-side calendar access protects tokens and keeps the display client simple.
- Managed hosting reduces operational overhead for a single-household deployment.

## 3. System Design

### Top-Level Surfaces

- `/display`
  - Full-screen read-only board intended for kiosk/browser display on the monitor or Fire Stick.
- `/admin`
  - Household settings UI for calendar connection, user colors, themes, and display behavior.
- `/api/*`
  - Server endpoints for event retrieval, settings management, OAuth callbacks, and health checks.

### Logical Layers

- Presentation layer
  - Split-flap board, tiles, headers, row rendering, theme application.
- Application layer
  - Event eligibility rules, display row mapping, status calculation, truncation rules.
- Integration layer
  - Google Calendar client, token management, calendar sync, user mapping.
- Persistence layer
  - Settings, selected calendar, theme data, user-to-color mapping, cached event snapshots if needed.

## 4. Core Technical Decisions

### 4.1 Rendering Model

- Render the board as a fixed grid of reusable split-flap character cells.
- Each field in a row maps to a known number of cells.
- The display client receives already-normalized event rows and only performs presentation logic plus time-aware transitions.

This is preferable to rendering plain text and animating whole strings because:

- character-level transitions look more authentic
- row changes can animate selectively
- truncation and alignment become deterministic

### 4.2 Data Flow

1. Admin connects the household Google account and selects the shared calendar.
2. Server stores OAuth credentials securely.
3. Display client polls a server endpoint on a fixed interval.
4. Server fetches or refreshes calendar events, normalizes them into board rows, and returns a display payload.
5. Client compares the latest payload to the currently rendered state.
6. Only changed cells animate.

### 4.3 Refresh Strategy

- Default polling target: every 30 to 60 seconds.
- Local timer on the client updates purely time-derived statuses between polls when possible.
- Server response includes a payload hash or version so the client can skip redundant animation when nothing changed.

This balances fidelity and simplicity. It avoids over-fetching while still keeping the board trustworthy.

### 4.4 Event Eligibility Logic

An event is displayable if:

- its end time is greater than the current time

Display order:

- sort by start time ascending
- keep only eligible events
- take the first N events where N equals the number of visible event rows

### 4.5 Status Computation

Recommended v1 defaults:

- `STARTING SOON`: within 30 minutes before start
- `IN PROGRESS`: from start until 15 minutes before end
- `ALMOST OVER`: final 15 minutes before end

These should live in settings so they can move later without architectural churn.

## 5. Display Design Plan

### 5.1 Board Structure

Recommended initial board:

- 1 static header row
- 6 to 8 visible event rows
- landscape-first composition

Per row fields:

- date
- event name
- location
- start
- end
- status

Recommended rule:

- reserve fixed widths for date, start, end, and status
- allocate remaining space between name and location
- prioritize name over location

### 5.2 Character Model

Define a supported display character set for v1:

- uppercase A-Z
- digits 0-9
- space
- colon
- dash
- slash
- period
- ampersand

Normalize all event strings into the supported character set before display. Unknown characters should degrade gracefully to a space or nearest safe alternative.

### 5.3 Theme System

Store themes as token sets:

- board background
- tile face
- tile seam
- default text
- per-user accent colors
- header color
- warning/status colors

The admin panel should switch themes by selecting one named theme object rather than editing raw CSS values in v1.

### 5.4 Animation Plan

Each character cell should support:

- idle state
- queued next character
- flipping state
- settled state

Animation sequence:

1. old top half rotates down
2. seam shadow deepens
3. new lower half appears
4. full tile settles with slight bounce/shadow easing

Design constraints:

- duration must feel physical, not digital
- stagger updates within a row by a few milliseconds
- cap animation duration so the board remains readable during bursts of changes

## 6. Admin Experience Plan

### Initial Admin Features

- Google sign-in and calendar authorization
- Select the shared calendar to display
- Map up to 4 user identities to display colors
- Choose among preset themes
- Configure status thresholds
- Preview the board theme against mock row data

### Admin Authentication

Recommended v1 approach:

- a single admin passcode or password-protected session gate
- separate from the display route

This is enough for a household deployment without introducing full account management.

## 7. Data Model

### Tables

#### `app_settings`

- `id`
- `selected_calendar_id`
- `theme_id`
- `visible_row_count`
- `starting_soon_minutes`
- `almost_over_minutes`
- `admin_passcode_hash`
- `updated_at`

#### `user_color_mappings`

- `id`
- `google_identity_key`
- `display_name`
- `color_token`
- `sort_order`
- `updated_at`

#### `oauth_connections`

- `id`
- `provider`
- `access_token_encrypted`
- `refresh_token_encrypted`
- `token_expiry`
- `scope`
- `updated_at`

#### `calendar_cache` (optional for v1)

- `id`
- `calendar_id`
- `payload_json`
- `payload_hash`
- `fetched_at`

### In-Memory Display Payload Shape

```ts
type DisplayPayload = {
  generatedAt: string;
  boardVersion: string;
  theme: ThemeConfig;
  headers: string[];
  rows: DisplayRow[];
};

type DisplayRow = {
  eventId: string;
  dateLabel: string;
  nameLabel: string;
  locationLabel: string;
  startLabel: string;
  endLabel: string;
  statusLabel: "STARTING SOON" | "IN PROGRESS" | "ALMOST OVER" | "";
  userColorKey: string | null;
};
```

## 8. API Plan

### Public Display Endpoints

- `GET /api/display`
  - returns normalized payload for the board
- `GET /api/health`
  - basic health status for hosting/debugging

### Admin Endpoints

- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `GET /api/admin/calendars`
- `POST /api/admin/theme`
- `POST /api/admin/user-colors`

### OAuth Endpoints

- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`
- `POST /api/auth/logout`

## 9. File And Module Plan

Recommended initial repo structure:

```text
src/
  app/
    display/
      page.tsx
    admin/
      page.tsx
    api/
      display/route.ts
      health/route.ts
      admin/settings/route.ts
      auth/google/start/route.ts
      auth/google/callback/route.ts
  components/
    board/
      board-shell.tsx
      board-header.tsx
      board-row.tsx
      flap-cell.tsx
      flap-cell.css
    admin/
      settings-form.tsx
      theme-picker.tsx
      user-color-map.tsx
  lib/
    calendar/
      google-calendar.ts
      normalize-event.ts
      select-display-events.ts
    display/
      build-display-payload.ts
      format-board-string.ts
      status-rules.ts
      supported-charset.ts
    db/
      settings-repo.ts
      oauth-repo.ts
    auth/
      admin-session.ts
```

## 10. Delivery Plan

### Milestone 1: Design Prototype

- Build a static board shell with mock data.
- Implement a convincing flap cell animation.
- Finalize tile geometry, spacing, color language, and typography.
- Test readability on a large display.

Exit criteria:

- the board looks good enough to validate the overall concept
- motion is believable and not janky

Status:

- completed
- current prototype uses seven visible rows, static signboard headers, and analog-styled split-flap tiles
- local development defaults to webpack mode because Turbopack showed intermittent client-manifest issues during dev

### Milestone 2: Live Calendar Data

- Implement Google OAuth flow.
- Fetch shared calendar events.
- Normalize events into board rows.
- Wire polling from `/display` to `/api/display`.

Exit criteria:

- live calendar events show on the board in correct order
- statuses update correctly over time

Status:

- completed
- board is connected to a real shared Google Calendar
- event descriptions now use title only, without appending location
- app-level time zone formatting is in place for live start/end times
- live board spacing has been tuned against real household data

### Milestone 3: Admin Configuration

- Build settings UI.
- Persist theme and user color mappings.
- Add a preview mode in admin.

Exit criteria:

- household config can be changed without touching code

Status:

- completed
- `/admin` is now a separate settings surface rather than a placeholder
- shared calendar accounts can be assigned text colors from the admin page
- status timing, status labels, and status colors are configurable from the admin page
- admin settings persist locally and immediately feed the live display
- palette expanded from muted prototype colors to a 10-color selectable set

### Milestone 4: Device Tuning

- Validate on Fire Stick browser and desktop browser.
- Tune performance, font size, and animation cadence.
- Verify kiosk-style operation.

Exit criteria:

- display is readable across the room
- animations remain smooth on target hardware

## 11. Testing Strategy

### Automated

- Unit tests for event sorting, filtering, truncation, and status logic
- Snapshot or DOM tests for board row formatting
- Integration tests for admin settings save/load flows

### Manual

- Visual inspection of animations on desktop and TV-sized display
- Browser compatibility check on Fire Stick browser
- Time-boundary testing around event transitions
- Long-string testing for name/location truncation
- Empty-state testing

## 12. Risks And Mitigations

### Risk: Split-flap animation looks fake or cheap

Mitigation:

- prototype the tile animation before building the full app
- favor custom motion and lighting treatment over generic CSS transitions

### Risk: Google Calendar ownership fields are inconsistent

Mitigation:

- support an admin-managed identity-to-color mapping
- allow fallback color when identity resolution is ambiguous

### Risk: Fire Stick browser performance is weaker than desktop

Mitigation:

- animate only changed cells
- keep the visible row count fixed and moderate
- provide a reduced-motion theme toggle in admin if needed later

### Risk: Long event text degrades the board layout

Mitigation:

- define strict truncation rules early
- test with realistic family calendar data

## 13. Open Technical Decisions

- Final row count and exact field widths
- Whether location is always visible or conditionally hidden
- Whether cached event snapshots are necessary in v1
- Whether to add a display-specific secret token to protect the public display payload
- Whether Fire Stick browser behavior requires a simplified animation mode

## 14. Recommended Immediate Next Steps

1. Scaffold the Next.js app in this repository.
2. Build the static split-flap board prototype before touching Google Calendar integration.
3. Lock the board dimensions and tile design based on that prototype.
4. Implement the server-side calendar integration and normalized display payload.
5. Build the admin panel after the display experience is visually convincing.
