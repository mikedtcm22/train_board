import Link from "next/link";
import styles from "./page.module.css";

export default function AdminPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>Phase 1 Prototype</p>
        <h1 className={styles.title}>Admin Tools Land In Phase 3</h1>
        <p className={styles.copy}>
          This route is in place so the app structure matches the implementation
          plan, but the current milestone is focused on board design, tile
          motion, and readability. Next phases will wire in Google Calendar,
          themes, and household settings.
        </p>
        <ul className={styles.list}>
          <li>Google Calendar connection and account authorization</li>
          <li>Color mapping for up to four family members</li>
          <li>Preset theme selection and board preview</li>
          <li>Status timing controls for starting soon and almost over</li>
        </ul>
        <div className={styles.actions}>
          <Link className={styles.link} href="/display">
            Open Display Prototype
          </Link>
          <Link className={`${styles.link} ${styles.linkSecondary}`} href="/">
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
