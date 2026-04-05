import Link from "next/link";
import { getCalendarIntegrationSummary } from "@/lib/calendar/google-calendar";
import styles from "./page.module.css";

export default function AdminPage() {
  const integration = getCalendarIntegrationSummary();

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Milestone 2 Setup</p>
        <h1 className={styles.title}>Google Calendar Wiring Is In Place</h1>
        <p className={styles.copy}>
          The display route now supports live Google Calendar polling through
          server-side credentials. Until the required environment variables are
          present, the board stays in demo mode so the split-flap display
          remains usable during setup.
        </p>
        <div className={styles.grid}>
          <section className={styles.subpanel}>
            <h2 className={styles.sectionTitle}>Connection Status</h2>
            <dl className={styles.metaList}>
              <div className={styles.metaItem}>
                <dt>Mode</dt>
                <dd>{integration.configured ? "Live Google Calendar" : "Demo Fallback"}</dd>
              </div>
              <div className={styles.metaItem}>
                <dt>Calendar ID</dt>
                <dd>{integration.calendarId || "Not set"}</dd>
              </div>
              <div className={styles.metaItem}>
                <dt>Time Zone</dt>
                <dd>{integration.timeZone || "Calendar default"}</dd>
              </div>
              <div className={styles.metaItem}>
                <dt>Rows</dt>
                <dd>{integration.rowCount}</dd>
              </div>
              <div className={styles.metaItem}>
                <dt>Starting Soon</dt>
                <dd>{integration.startingSoonMinutes} minutes</dd>
              </div>
              <div className={styles.metaItem}>
                <dt>Almost Over</dt>
                <dd>{integration.almostOverMinutes} minutes</dd>
              </div>
            </dl>
          </section>

          <section className={styles.subpanel}>
            <h2 className={styles.sectionTitle}>Environment Setup</h2>
            <ul className={styles.list}>
              <li>`GOOGLE_CALENDAR_ID`</li>
              <li>`GOOGLE_CLIENT_ID`</li>
              <li>`GOOGLE_CLIENT_SECRET`</li>
              <li>`GOOGLE_REFRESH_TOKEN`</li>
              <li>`GOOGLE_CALENDAR_TIME_ZONE` (optional)</li>
              <li>`BOARD_USER_TONES` (optional)</li>
            </ul>
            {integration.missing.length > 0 ? (
              <p className={styles.warning}>
                Missing now: {integration.missing.join(", ")}
              </p>
            ) : (
              <p className={styles.success}>
                Required live-calendar variables are present.
              </p>
            )}
          </section>
        </div>

        <section className={styles.subpanel}>
          <h2 className={styles.sectionTitle}>Color Mapping Format</h2>
          <p className={styles.copySmall}>
            Use `BOARD_USER_TONES` to pin specific Google identities to board
            colors. Format example:
          </p>
          <code className={styles.codeSample}>
            parent1@example.com=sky,parent2@example.com=amber,parent3@example.com=coral
          </code>
          <p className={styles.copySmall}>
            When no explicit mapping exists, the board assigns a stable fallback
            color from the creator email so repeat events stay visually
            consistent.
          </p>
        </section>

        <div className={styles.actions}>
          <Link className={styles.link} href="/display">
            Open Display
          </Link>
          <Link className={`${styles.link} ${styles.linkSecondary}`} href="/">
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
