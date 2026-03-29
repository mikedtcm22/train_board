import { BOARD_FIELD_WIDTHS, type BoardSnapshot } from "@/lib/board/demo-board-data";
import { BoardRow } from "./board-row";
import { FlapText } from "./flap-text";
import styles from "./board.module.css";

type BoardShellProps = {
  currentDateLabel: string;
  currentTimeLabel: string;
  snapshot: BoardSnapshot;
};

const HEADER_FIELDS = [
  { label: "DATE", width: BOARD_FIELD_WIDTHS.date },
  { label: "DESCRIPTION", width: BOARD_FIELD_WIDTHS.name },
  { label: "START", width: BOARD_FIELD_WIDTHS.start },
  { label: "END", width: BOARD_FIELD_WIDTHS.end },
  { label: "STATUS", width: BOARD_FIELD_WIDTHS.status },
] as const;

export function BoardShell({
  currentDateLabel,
  currentTimeLabel,
  snapshot,
}: BoardShellProps) {
  return (
    <main className={styles.scene}>
      <section className={styles.boardSurface}>
        <div className={styles.boardTopbar}>
          <div className={styles.topbarSpacer} />
          <div className={styles.nowPanel}>
            <div className={styles.nowStack}>
              <FlapText
                animated={false}
                tone="header"
                value={currentDateLabel}
                width={currentDateLabel.length}
              />
            </div>
            <div className={styles.nowStack}>
              <FlapText
                tone="header"
                value={currentTimeLabel}
                width={currentTimeLabel.length}
              />
            </div>
          </div>
        </div>

        <div className={styles.boardGrid}>
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
      </section>
    </main>
  );
}
