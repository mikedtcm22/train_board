import type { BoardRowData } from "@/lib/board/board-data";
import { BOARD_FIELD_WIDTHS } from "@/lib/board/board-data";
import { FlapText } from "./flap-text";
import styles from "./board.module.css";

type BoardRowProps = {
  row: BoardRowData;
  rowIndex: number;
};

function getStatusTone(status: string) {
  if (status === "ALMOST OVER") {
    return "red";
  }

  if (status === "IN PROGRESS") {
    return "green";
  }

  if (status === "STARTING SOON") {
    return "yellow";
  }

  return "white";
}

export function BoardRow({ row, rowIndex }: BoardRowProps) {
  return (
    <article className={styles.boardRowShell}>
      <div className={styles.boardRow}>
        <span
          aria-hidden="true"
          className={`${styles.rowMarker} ${styles[`tone${capitalize(row.tone)}`]}`}
        />
        <div className={styles.field}>
          <FlapText
            delayOffset={rowIndex * 34}
            tone="white"
            value={row.date}
            width={BOARD_FIELD_WIDTHS.date}
          />
        </div>
        <div className={styles.field}>
          <FlapText
            delayOffset={rowIndex * 34}
            tone={row.tone}
            value={row.name}
            width={BOARD_FIELD_WIDTHS.name}
          />
        </div>
        <div className={styles.field}>
          <FlapText
            delayOffset={rowIndex * 34}
            tone="white"
            value={row.start}
            width={BOARD_FIELD_WIDTHS.start}
          />
        </div>
        <div className={styles.field}>
          <FlapText
            delayOffset={rowIndex * 34}
            tone="white"
            value={row.end}
            width={BOARD_FIELD_WIDTHS.end}
          />
        </div>
        <div className={styles.field}>
          <FlapText
            delayOffset={rowIndex * 34}
            tone={row.statusTone ?? getStatusTone(row.status)}
            value={row.status}
            width={BOARD_FIELD_WIDTHS.status}
          />
        </div>
      </div>
    </article>
  );
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
