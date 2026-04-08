"use client";

import { startTransition, useEffect, useState } from "react";
import {
  USER_TONE_LABELS,
  USER_TONE_OPTIONS,
  type UserTone,
} from "@/lib/board/board-data";
import { STATUS_TEXT_MAX_LENGTH } from "@/lib/board/status-rules";
import styles from "./page.module.css";

type StatusSettingsPayload = {
  settings: {
    almostOverMinutes: number;
    labels: {
      almostOver: string;
      inProgress: string;
      startingSoon: string;
    };
    tones: {
      almostOver: UserTone;
      inProgress: UserTone;
      startingSoon: UserTone;
    };
    startingSoonMinutes: number;
  };
};

export function AdminStatusSettings() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [settings, setSettings] = useState<StatusSettingsPayload["settings"] | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch("/api/admin/status-settings", {
          cache: "no-store",
        });
        const payload = (await response.json()) as StatusSettingsPayload & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load status settings.");
        }

        setSettings(payload.settings);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load status settings.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const updateLabel = (
    key: keyof StatusSettingsPayload["settings"]["labels"],
    value: string,
  ) => {
    setSettings((currentSettings) =>
      currentSettings
        ? {
            ...currentSettings,
            labels: {
              ...currentSettings.labels,
              [key]: value.toUpperCase().slice(0, STATUS_TEXT_MAX_LENGTH),
            },
          }
        : currentSettings,
    );
  };

  const updateMinutes = (
    key: "startingSoonMinutes" | "almostOverMinutes",
    value: number,
  ) => {
    setSettings((currentSettings) =>
      currentSettings
        ? {
            ...currentSettings,
            [key]: value,
          }
        : currentSettings,
    );
  };

  const updateTone = (
    key: keyof StatusSettingsPayload["settings"]["tones"],
    value: UserTone,
  ) => {
    setSettings((currentSettings) =>
      currentSettings
        ? {
            ...currentSettings,
            tones: {
              ...currentSettings.tones,
              [key]: value,
            },
          }
        : currentSettings,
    );
  };

  const handleSave = () => {
    if (!settings) {
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          setIsSaving(true);
          setErrorMessage(null);

          const response = await fetch("/api/admin/status-settings", {
            body: JSON.stringify({ settings }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          });
          const payload = (await response.json()) as StatusSettingsPayload & {
            error?: string;
          };

          if (!response.ok) {
            throw new Error(payload.error ?? "Unable to save status settings.");
          }

          setSettings(payload.settings);
          setNotice("Status settings saved.");
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to save status settings.",
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
        <h2 className={styles.sectionTitle}>Status Behavior</h2>
        <p className={styles.copySmall}>Loading status settings…</p>
      </section>
    );
  }

  if (errorMessage || !settings) {
    return (
      <section className={styles.subpanel}>
        <h2 className={styles.sectionTitle}>Status Behavior</h2>
        <p className={styles.warning}>{errorMessage ?? "Unable to load status settings."}</p>
      </section>
    );
  }

  return (
    <section className={styles.subpanel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Status Behavior</h2>
          <p className={styles.copySmall}>
            Control trigger timing, board text, and text color for the three live
            status states. Labels are capped at {STATUS_TEXT_MAX_LENGTH} characters.
          </p>
        </div>
      </div>

      {notice ? <p className={styles.success}>{notice}</p> : null}

      <div className={styles.settingsGrid}>
        <label className={styles.inputGroup}>
          <span className={styles.inputLabel}>Starting Soon Trigger (Minutes)</span>
          <input
            className={styles.textInput}
            max={180}
            min={1}
            onChange={(event) =>
              updateMinutes("startingSoonMinutes", Number(event.target.value))
            }
            type="number"
            value={settings.startingSoonMinutes}
          />
        </label>

        <label className={styles.inputGroup}>
          <span className={styles.inputLabel}>Almost Over Trigger (Minutes)</span>
          <input
            className={styles.textInput}
            max={180}
            min={1}
            onChange={(event) =>
              updateMinutes("almostOverMinutes", Number(event.target.value))
            }
            type="number"
            value={settings.almostOverMinutes}
          />
        </label>
      </div>

      <div className={styles.statusList}>
        {[
          {
            labelKey: "startingSoon" as const,
            title: "Starting Soon",
            toneKey: "startingSoon" as const,
          },
          {
            labelKey: "inProgress" as const,
            title: "In Progress",
            toneKey: "inProgress" as const,
          },
          {
            labelKey: "almostOver" as const,
            title: "Almost Over",
            toneKey: "almostOver" as const,
          },
        ].map((item) => (
          <div className={styles.statusCard} key={item.labelKey}>
            <h3 className={styles.statusCardTitle}>{item.title}</h3>
            <div className={styles.statusCardGrid}>
              <label className={styles.inputGroup}>
                <span className={styles.inputLabel}>Board Text</span>
                <input
                  className={styles.textInput}
                  maxLength={STATUS_TEXT_MAX_LENGTH}
                  onChange={(event) => updateLabel(item.labelKey, event.target.value)}
                  type="text"
                  value={settings.labels[item.labelKey]}
                />
              </label>

              <label className={styles.inputGroup}>
                <span className={styles.inputLabel}>Text Color</span>
                <select
                  className={styles.select}
                  onChange={(event) =>
                    updateTone(item.toneKey, event.target.value as UserTone)
                  }
                  value={settings.tones[item.toneKey]}
                >
                  {USER_TONE_OPTIONS.map((tone) => (
                    <option key={tone} value={tone}>
                      {USER_TONE_LABELS[tone]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.link} disabled={isSaving} onClick={handleSave} type="button">
          {isSaving ? "Saving…" : "Save Status Settings"}
        </button>
      </div>
    </section>
  );
}
