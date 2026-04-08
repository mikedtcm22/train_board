import Link from "next/link";
import { AdminColorMappings } from "./admin-color-mappings";
import { AdminStatusSettings } from "./admin-status-settings";
import { getCalendarIntegrationSummary } from "@/lib/calendar/google-calendar";
import styles from "./page.module.css";

export default function AdminPage() {
  const integration = getCalendarIntegrationSummary();

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Milestone 3 Admin</p>
        <h1 className={styles.title}>Account Color Mapping</h1>
        <p className={styles.copy}>
          The display remains read-only. Manage shared-calendar account colors here
          from a separate admin page, then let the monitor continue running only the
          full-screen board.
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
              This admin route is intentionally separate from the display route. The
              only live configuration here is which color each shared Google account
              uses for description text on the board.
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
