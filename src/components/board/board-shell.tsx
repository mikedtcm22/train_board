"use client";

import { useEffect, useRef, useState } from "react";
import {
  BOARD_FIELD_WIDTHS,
  BOARD_HEADER_WIDTH,
  type UserTone,
  type BoardSnapshot,
} from "@/lib/board/board-data";
import { BoardRow } from "./board-row";
import { FlapText } from "./flap-text";
import styles from "./board.module.css";

type BoardShellProps = {
  currentDateLabel: string;
  headerMessage: string;
  headerTone: UserTone;
  currentTimeLabel: string;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  snapshot: BoardSnapshot;
};

const HEADER_FIELDS = [
  { label: "DATE", width: BOARD_FIELD_WIDTHS.date },
  { label: "DESCRIPTION", width: BOARD_FIELD_WIDTHS.name },
  { label: "START", width: BOARD_FIELD_WIDTHS.start },
  { label: "END", width: BOARD_FIELD_WIDTHS.end },
  { label: "STATUS", width: BOARD_FIELD_WIDTHS.status },
] as const;

const BOARD_FIT_SAFE_WIDTH_PX = 32;
const BOARD_FIT_SAFE_HEIGHT_PX = 20;

export function BoardShell({
  currentDateLabel,
  headerMessage,
  headerTone,
  currentTimeLabel,
  isFullscreen,
  onFullscreenToggle,
  snapshot,
}: BoardShellProps) {
  const surfaceRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(1);
  const [scaledSize, setScaledSize] = useState<{ height: number; width: number } | null>(
    null,
  );

  useEffect(() => {
    const surface = surfaceRef.current;
    const viewport = viewportRef.current;
    const content = contentRef.current;

    if (!surface || !viewport || !content) {
      return;
    }

    const measure = () => {
      const naturalWidth = content.scrollWidth;
      const naturalHeight = content.scrollHeight;

      if (!naturalWidth || !naturalHeight) {
        return;
      }

      const viewportStyles = window.getComputedStyle(viewport);
      const viewportPaddingX =
        Number.parseFloat(viewportStyles.paddingLeft) +
        Number.parseFloat(viewportStyles.paddingRight);
      const viewportPaddingY =
        Number.parseFloat(viewportStyles.paddingTop) +
        Number.parseFloat(viewportStyles.paddingBottom);
      const availableWidth = Math.max(
        viewport.clientWidth - viewportPaddingX - BOARD_FIT_SAFE_WIDTH_PX,
        1,
      );
      const availableHeight = Math.max(
        viewport.clientHeight - viewportPaddingY - BOARD_FIT_SAFE_HEIGHT_PX,
        1,
      );
      const nextScale = Math.min(
        1,
        availableWidth / naturalWidth,
        availableHeight / naturalHeight,
      );

      setFitScale(nextScale);
      setScaledSize({
        height: naturalHeight * nextScale,
        width: naturalWidth * nextScale,
      });
    };

    const frameId = window.requestAnimationFrame(measure);
    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(measure);
    });

    resizeObserver.observe(surface);
    resizeObserver.observe(viewport);
    resizeObserver.observe(content);
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <main className={styles.scene}>
      <button className={styles.fullscreenToggle} onClick={onFullscreenToggle} type="button">
        {isFullscreen ? "Exit Full Screen" : "Full Screen"}
      </button>
      <section className={styles.boardSurface} ref={surfaceRef}>
        <div className={styles.boardViewport} ref={viewportRef}>
          <div
            className={styles.boardScaleShell}
            style={
              scaledSize
                ? {
                    height: `${scaledSize.height}px`,
                    width: `${scaledSize.width}px`,
                  }
                : undefined
            }
          >
            <div
              className={styles.boardContent}
              ref={contentRef}
              style={{ transform: `scale(${fitScale})` }}
            >
              <div className={styles.boardTopbar}>
                <div className={styles.bannerPanel}>
                  <FlapText
                    size="banner"
                    tone={headerTone}
                    value={headerMessage}
                    width={BOARD_HEADER_WIDTH}
                  />
                </div>
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
                    <div
                      className={styles.headerTextField}
                      key={field.label}
                      style={{
                        width: `calc(${field.width} * var(--board-cell-width) + ${Math.max(
                          field.width - 1,
                          0,
                        )} * var(--board-cell-gap))`,
                      }}
                    >
                      <span className={styles.headerLabel}>{field.label}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.rowList}>
                  {snapshot.rows.map((row, rowIndex) => (
                    <BoardRow key={rowIndex} row={row} rowIndex={rowIndex} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
