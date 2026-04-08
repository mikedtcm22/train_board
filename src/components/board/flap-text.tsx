import type { UserTone } from "@/lib/board/board-data";
import { formatBoardText } from "@/lib/board/format-board";
import { FlapCell } from "./flap-cell";
import styles from "./board.module.css";

export type BoardTone = "header" | UserTone;

type FlapTextProps = {
  animated?: boolean;
  delayOffset?: number;
  tone: BoardTone;
  value: string;
  width: number;
};

export function FlapText({
  animated = true,
  delayOffset = 0,
  tone,
  value,
  width,
}: FlapTextProps) {
  const chars = [...formatBoardText(value, width)];

  return (
    <span className={styles.fieldCells}>
      {chars.map((char, index) => (
        <FlapCell
          animated={animated}
          char={char}
          delayMs={delayOffset}
          key={`${width}-${index}`}
          tone={tone}
        />
      ))}
    </span>
  );
}
