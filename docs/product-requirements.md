# Train Board Calendar Display PRD

## 1. Overview

This project is a web-based household calendar display designed for a wall-mounted monitor in a kitchen or shared living space. The application connects to a single shared Google Calendar and renders upcoming events in a split-flap train station board style inspired by physical departure boards and products like Vestaboard, but implemented as a digital full-screen display for a standard TV or monitor.

The product is intentionally narrow in scope. It is not a general-purpose calendar app. Its purpose is to make a shared family schedule visible, readable from across a room, and visually delightful through high-fidelity split-flap animations and strong display design.

## 2. Product Vision

Create a beautiful, reliable, always-on digital family schedule board that feels like a real train station flip-board and keeps the household aware of what is happening next.

## 3. Goals

- Display upcoming events from a single shared Google Calendar in the correct order.
- Present events in a fixed-layout train board format readable from across a normal-sized room.
- Use high-quality split-flap animations as a core part of the experience, not a decorative extra.
- Differentiate event rows visually based on the invited account/user associated with the event creator, supporting up to 4 users.
- Provide a simple web-based admin/settings interface for managing visual settings and configuration.
- Run full-screen in a browser on a 24" monitor, with Fire Stick browser compatibility as the preferred playback option.

## 4. Non-Goals

- Creating or editing calendar events from the display.
- Building a full-featured calendar product with day/week/month planning workflows.
- Supporting multiple households, multi-tenant accounts, or general public productization in v1.
- Supporting additional data sources such as weather, reminders, chores, sports, or school feeds in v1.
- Designing for automatic recovery from reboot, outage, or browser crash in v1.

## 5. Success Criteria

The product is successful in v1 if:

- The display convincingly looks and feels like a real train split-flap board.
- The board reliably shows the correct upcoming events in the correct order from the shared Google Calendar.
- The display is readable across the room on a 24" monitor.
- The flip animation is visually satisfying and triggers whenever displayed content changes.
- The app is stable enough for everyday household use in kiosk/full-screen mode.

## 6. Users And Context

### Primary User

- One household using one shared Google Calendar.

### Secondary User

- An administrator, likely a household member, who configures the board through a separate web admin page.

### Usage Context

- Full-screen ambient display mounted on a kitchen wall.
- Viewed primarily from across the room.
- Read-only during normal display mode.
- Intended to remain open continuously during normal household use.

## 7. Core Experience Principles

- Design fidelity first: the display should feel special, not utilitarian.
- At-a-glance clarity: users should understand what is next in seconds.
- Motion as product value: split-flap motion is central to the experience.
- Fixed display language: the board should feel like a physical object with a stable structure.
- Household-friendly legibility: typography, spacing, contrast, and animation speed must support distance viewing.

## 8. Functional Requirements

### 8.1 Calendar Integration

- The system shall connect to a single shared Google Calendar.
- The system shall ingest events from that calendar and display them on the board.
- The system shall support recurring events.
- The system shall show all events from the shared calendar, including private events within that calendar context.
- The system shall identify the event creator or mapped user identity and assign a distinct color treatment for up to 4 users.

### 8.2 Event Selection Logic

- The board shall display events ordered by earliest start time among events whose end time has not yet passed.
- An event remains eligible for display until its end time is reached.
- The top row shall always be the earliest eligible event.
- Additional rows shall be filled by the next eligible events in chronological order.
- The board shall display only as many events as fit within the fixed layout.
- There is no explicit time-window filter such as "today" or "next 7 days"; display is governed by event eligibility and available row capacity.

### 8.3 Event Fields

Each displayed event row shall include:

- Event date
- Event name
- Event location
- Event start time
- Event end time
- Status indicator

The status indicator shall support at minimum:

- `STARTING SOON`
- `IN PROGRESS`
- `ALMOST OVER`

### 8.4 Status Rules

The product shall calculate event state from current time relative to the event start and end.

Initial v1 status rules:

- `STARTING SOON`: event begins within a configurable threshold before start time.
- `IN PROGRESS`: current time is between start and end.
- `ALMOST OVER`: current time is within a configurable threshold before end time.

Exact thresholds will be configurable in implementation or set as sensible defaults in v1.

### 8.5 Display Layout

- The board shall use a fixed number of visible event rows.
- The board shall use fixed-width character allocation per field.
- The layout shall reserve only the minimum width needed for predictable fields such as date/time/status.
- Remaining horizontal space shall be allocated to event name and location fields, with event name receiving priority.
- Text longer than field capacity shall be truncated in a visually clean, deterministic way.
- The display shall include static header labels styled like a train schedule board.

### 8.6 Animation Behavior

- Split-flap animation is a required feature for v1.
- The board shall animate when displayed content changes due to calendar updates, time-based status changes, or row reordering.
- The animation style shall be prominent and expressive rather than subtle.
- The animation system shall be visually polished enough to be one of the defining product qualities.

### 8.7 Admin Experience

The application shall include a separate admin page that is not intended for use on the display device.

The admin page shall support at minimum:

- Google Calendar connection/configuration
- Selection or confirmation of the shared calendar to display
- User-to-color mapping for up to 4 users
- Selection of visual theme/color scheme
- Basic display settings such as status thresholds and possibly row count if exposed in v1

The display itself shall remain read-only and non-interactive.

## 9. User Stories

- As a family member, I want to glance at the board and immediately know what event is next.
- As a family member, I want to see whether an event is about to start, currently happening, or nearly finished.
- As a family member, I want different users' events to have a recognizable visual identity.
- As an admin, I want to connect the display to our Google Calendar without editing source code.
- As an admin, I want to adjust the board's appearance so it fits the room and my preferences.

## 10. UX Requirements

### 10.1 Visual Style

- The display should strongly evoke a real train departure board.
- Visual styling should prioritize authenticity, contrast, and readability over minimalism.
- Split-flap tiles should have depth, texture, and believable motion.
- The design should feel premium and intentional rather than generic dashboard UI.

### 10.2 Readability

- All core information must be legible from across a normal-sized room on a 24" monitor.
- Rows must remain readable when multiple events are present.
- Motion must not reduce readability once the animation completes.

### 10.3 Responsiveness

- v1 is optimized first for a 24" landscape monitor in full-screen mode.
- The layout should remain usable in a browser on Fire Stick and desktop-class browsers.
- Secondary screen sizes may degrade gracefully, but design optimization should target the primary monitor setup.

## 11. Technical Requirements

### 11.1 Platform

- The system shall be a hosted web application reachable over the internet.
- The system shall support a display route intended for kiosk/full-screen usage.
- The system shall support a separate admin route for settings/configuration.

### 11.2 Data Refresh

- The board shall refresh event data on a recurring schedule suitable for near-real-time household display use.
- Refresh behavior shall be frequent enough that event ordering and status remain trustworthy.
- The system does not need push-based instant updates in v1 if polling provides a reliable user experience.

### 11.3 Reliability

- The product should be stable in continuous browser use.
- Automatic reboot/crash recovery is not a v1 requirement.
- If the browser must be reopened after interruption, that is acceptable in v1.

## 12. Recommended V1 Technical Direction

This section is directional and can change during implementation.

- Frontend: React-based web app, preferably Next.js, to support a polished display route and a lightweight admin route in one project.
- Hosting: Simple managed hosting such as Vercel.
- Calendar integration: Google Calendar API with OAuth-based one-time setup.
- Data access pattern: Server-side polling and normalized event payloads delivered to the client for display refreshes.
- Persistence: Lightweight hosted database or config store for admin settings, user color mapping, and selected calendar metadata.

Rationale:

- Next.js provides a clean way to ship one hosted app with both display and admin surfaces.
- Server-mediated calendar access avoids exposing calendar credentials directly to the display client.
- Managed hosting keeps setup simple for a single-household app while preserving Fire Stick accessibility.

## 13. Key Product Decisions

- Single household only.
- Single shared Google Calendar only.
- Read-only display mode.
- Separate admin page.
- Fixed board layout rather than fluid/adaptive event density.
- Strong animation emphasis, with design fidelity prioritized over architectural elegance.

## 14. Assumptions

- The app will use one selected Google Calendar rather than merging multiple calendars in v1.
- "Event creator" color treatment will be implemented using the best available Google Calendar event ownership metadata or an admin-defined mapping when API identity data is inconsistent.
- The display will animate on meaningful displayed-content changes rather than re-flipping identical content on every poll cycle.
- Long event names and locations will truncate rather than scroll in v1 unless visual testing shows scrolling is necessary.
- Empty-state behavior can be a simple branded board state rather than a complex alternate mode.

## 15. Open Questions

- What exact board dimensions should v1 target, including row count and per-row character count?
- What are the default thresholds for `STARTING SOON` and `ALMOST OVER`?
- Should event location always display, or should it be omitted when the event name needs more space?
- What should the board show when there are zero eligible upcoming events?
- Does the admin page need authentication in v1, or is obscurity/basic access control acceptable for a household deployment?
- Should all-day and multi-day events have specialized formatting rules beyond the generic event ordering logic?
- How aggressively should the animation run when status labels change frequently?

## 16. MVP Scope

### In Scope

- Hosted web app
- Full-screen display route
- Separate admin route
- Google Calendar connection
- Single shared calendar selection
- Event ordering and eligibility logic
- Fixed train-board layout
- Split-flap animation system
- User color mapping for up to 4 users
- Theme/color scheme selection

### Out Of Scope

- Event editing or creation
- Multiple households
- Multiple calendar aggregation
- Additional feed types
- Mobile-first optimization
- Automatic crash recovery
- Advanced authentication/account management

## 17. Delivery Phases

### Phase 1: Design And Motion Prototype

- Prove the split-flap tile system and visual language.
- Finalize board grid, typography treatment, animation timing, and row structure.

### Phase 2: Calendar Data Integration

- Connect Google Calendar.
- Build event normalization, ordering, filtering, and status computation.
- Bind live event data into the board.

### Phase 3: Admin And Configuration

- Add admin interface for calendar selection, theme selection, and user color mapping.
- Persist settings for the household deployment.

### Phase 4: Device Validation

- Test full-screen browser behavior on desktop and Fire Stick.
- Tune performance, readability, and animation smoothness for the mounted monitor setup.

## 18. Acceptance Criteria For V1

- When the shared Google Calendar contains eligible events, the board displays them in correct chronological order.
- When the current time crosses status boundaries, the displayed status updates correctly.
- When displayed content changes, the board plays the split-flap transition.
- The board remains readable from across a room on the target monitor.
- An admin can configure the calendar connection and visual settings through the web UI.
- The display can be opened in a browser and left running in full-screen mode for normal household use.
