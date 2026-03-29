import { BOARD_FIELD_WIDTHS, type BoardSnapshot } from "@/lib/board/demo-board-data";
import { BoardRow } from "./board-row";
import { FlapText } from "./flap-text";
import styles from "./board.module.css";

type BoardShellProps = {
  snapshot: BoardSnapshot;
  cycleLabel: string;
};

const HEADER_FIELDS = [
  { label: "DATE", width: BOARD_FIELD_WIDTHS.date },
  { label: "EVENT", width: BOARD_FIELD_WIDTHS.name },
  { label: "PLACE", width: BOARD_FIELD_WIDTHS.location },
  { label: "START", width: BOARD_FIELD_WIDTHS.start },
  { label: "END", width: BOARD_FIELD_WIDTHS.end },
  { label: "STATUS", width: BOARD_FIELD_WIDTHS.status },
] as const;

export function BoardShell({ snapshot, cycleLabel }: BoardShellProps) {
  return (
    <main className={styles.scene}>
      <div className={styles.backdropGlow} aria-hidden="true" />
      <section className={styles.boardFrame}>
        <div className={styles.boardChrome}>
          <div className={styles.metaBar}>
            <div className={styles.stationBlock}>
              <p className={styles.stationEyebrow}>{snapshot.stationLabel}</p>
              <h1 className={styles.stationTitle}>{snapshot.stationTitle}</h1>
              <p className={styles.stationSubcopy}>
                Full-screen split-flap prototype for the family calendar.
              </p>
            </div>
            <div className={styles.clockBlock}>
              <span className={styles.clockLabel}>Local Time</span>
              <strong className={styles.clockValue}>{snapshot.clockLabel}</strong>
              <span className={styles.clockMeta}>{cycleLabel}</span>
            </div>
          </div>

          <div className={styles.boardBody}>
            <div className={styles.headerRow}>
              <span className={styles.headerMarker} aria-hidden="true" />
              {HEADER_FIELDS.map((field) => (
                <div className={styles.field} key={field.label}>
                  <FlapText
                    animated={false}
                    tone="header"
                    value={field.label}
                    width={field.width}
                  />
                </div>
              ))}
            </div>

            <div className={styles.rowList}>
              {snapshot.rows.map((row, rowIndex) => (
                <BoardRow key={`${row.id}-${rowIndex}`} row={row} rowIndex={rowIndex} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
