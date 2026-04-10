import Link from "next/link";
import { AdminColorMappings } from "./admin-color-mappings";
import { AdminHeaderSettings } from "./admin-header-settings";
import { AdminStatusSettings } from "./admin-status-settings";
import { getCalendarIntegrationSummary } from "@/lib/calendar/google-calendar";
import styles from "./page.module.css";

export default function AdminPage() {
  const integration = getCalendarIntegrationSummary();

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Milestone 3 Admin</p>
        <h1 className={styles.title}>Display Settings</h1>
        <p className={styles.copy}>
          The display remains read-only. Manage the board header, shared-calendar
          account colors, and status behavior here from a separate admin page, then
          let the monitor continue running only the full-screen board.
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
            <h2 className={styles.sectionTitle}>Admin Scope</h2>
            <p className={styles.copySmall}>
              This admin route is intentionally separate from the display route. Use
              it to manage the large board header, account color mapping, and status
              behavior while the monitor stays on the read-only display.
            </p>
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

        <AdminHeaderSettings />
        <AdminColorMappings />
        <AdminStatusSettings />

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
