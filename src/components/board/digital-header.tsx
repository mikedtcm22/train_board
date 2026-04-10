import type { UserTone } from "@/lib/board/board-data";
import styles from "./board.module.css";

type DigitalHeaderProps = {
  tone: UserTone;
  value: string;
};

export function DigitalHeader({ tone, value }: DigitalHeaderProps) {
  const toneClass = styles[`tone${capitalize(tone)}`];

  return (
    <div className={`${styles.digitalHeader} ${toneClass}`}>
      <span className={styles.digitalHeaderGlow} aria-hidden="true">
        {value}
      </span>
      <span className={styles.digitalHeaderText}>{value}</span>
    </div>
  );
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
