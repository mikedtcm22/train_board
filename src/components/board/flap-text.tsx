import { formatBoardText } from "@/lib/board/format-board";
import { FlapCell } from "./flap-cell";
import styles from "./board.module.css";

type FlapTextProps = {
  animated?: boolean;
  delayOffset?: number;
  tone: "default" | "header" | "amber" | "sky" | "mint" | "coral";
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
          delayMs={delayOffset + index * 18}
          key={`${tone}-${width}-${index}`}
          tone={tone}
        />
      ))}
    </span>
  );
}
