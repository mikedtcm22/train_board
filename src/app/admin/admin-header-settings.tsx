"use client";

import { startTransition, useEffect, useState } from "react";
import {
  BOARD_HEADER_TEXT_MAX_LENGTH,
  DEFAULT_BOARD_HEADER_MESSAGE,
} from "@/lib/board/board-data";
import styles from "./page.module.css";

type HeaderMessagePayload = {
  headerMessage: string;
};

export function AdminHeaderSettings() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [headerMessage, setHeaderMessage] = useState(DEFAULT_BOARD_HEADER_MESSAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const loadHeaderMessage = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch("/api/admin/header-message", {
          cache: "no-store",
        });
        const payload = (await response.json()) as HeaderMessagePayload & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load header message.");
        }

        setHeaderMessage(payload.headerMessage);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load header message.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadHeaderMessage();
  }, []);

  const handleSave = () => {
    startTransition(() => {
      void (async () => {
        try {
          setIsSaving(true);
          setErrorMessage(null);

          const response = await fetch("/api/admin/header-message", {
            body: JSON.stringify({ headerMessage }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          });
          const payload = (await response.json()) as HeaderMessagePayload & {
            error?: string;
          };

          if (!response.ok) {
            throw new Error(payload.error ?? "Unable to save header message.");
          }

          setHeaderMessage(payload.headerMessage);
          setNotice("Header message saved.");
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to save header message.",
          );
        } finally {
          setIsSaving(false);
        }
      })();
    });
  };

  if (isLoading) {
    return (
      <section className={styles.subpanel}>
        <h2 className={styles.sectionTitle}>Display Header</h2>
        <p className={styles.copySmall}>Loading header settings…</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className={styles.subpanel}>
        <h2 className={styles.sectionTitle}>Display Header</h2>
        <p className={styles.warning}>{errorMessage}</p>
      </section>
    );
  }

  return (
    <section className={styles.subpanel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Display Header</h2>
          <p className={styles.copySmall}>
            Set the large split-flap header shown in the top-left of the display.
            The board supports up to {BOARD_HEADER_TEXT_MAX_LENGTH} characters.
          </p>
        </div>
      </div>

      {notice ? <p className={styles.success}>{notice}</p> : null}

      <div className={styles.settingsGrid}>
        <label className={styles.inputGroup}>
          <span className={styles.inputLabel}>Header Message</span>
          <input
            className={styles.textInput}
            maxLength={BOARD_HEADER_TEXT_MAX_LENGTH}
            onChange={(event) => {
              setHeaderMessage(
                event.target.value.toUpperCase().slice(0, BOARD_HEADER_TEXT_MAX_LENGTH),
              );
            }}
            type="text"
            value={headerMessage}
          />
          <span className={styles.inputHint}>
            {headerMessage.trim().length || 0} / {BOARD_HEADER_TEXT_MAX_LENGTH} characters
          </span>
        </label>
      </div>

      <div className={styles.actions}>
        <button className={styles.link} disabled={isSaving} onClick={handleSave} type="button">
          {isSaving ? "Saving…" : "Save Header"}
        </button>
      </div>
    </section>
  );
}
