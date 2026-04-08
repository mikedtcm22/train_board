"use client";

import { startTransition, useEffect, useState } from "react";
import {
  DEFAULT_USER_TONE,
  USER_TONE_LABELS,
  USER_TONE_OPTIONS,
  type UserTone,
} from "@/lib/board/board-data";
import styles from "./page.module.css";

type AdminAccountTone = {
  email: string;
  source: "acl" | "event" | "owner" | "saved";
  tone: UserTone;
};

type AdminColorMappingsResponse = {
  accounts: AdminAccountTone[];
  issue?: string;
  sourceLabel?: string;
};

export function AdminColorMappings() {
  const [accounts, setAccounts] = useState<AdminAccountTone[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);

  useEffect(() => {
    const loadMappings = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetch("/api/admin/color-mappings", {
          cache: "no-store",
        });
        const payload = (await response.json()) as AdminColorMappingsResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load color mappings.");
        }

        setAccounts(payload.accounts);
        setNotice(payload.issue ?? null);
        setSourceLabel(payload.sourceLabel ?? null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load color mappings.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadMappings();
  }, []);

  const handleToneChange = (email: string, tone: UserTone) => {
    setAccounts((currentAccounts) =>
      currentAccounts.map((account) =>
        account.email === email ? { ...account, tone } : account,
      ),
    );
  };

  const handleSave = () => {
    startTransition(() => {
      void (async () => {
        try {
          setIsSaving(true);
          setErrorMessage(null);

          const response = await fetch("/api/admin/color-mappings", {
            body: JSON.stringify({
              mappings: accounts.map(({ email, tone }) => ({
                identity: email,
                tone,
              })),
            }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          });

          const payload = (await response.json()) as AdminColorMappingsResponse & {
            error?: string;
          };

          if (!response.ok) {
            throw new Error(payload.error ?? "Unable to save color mappings.");
          }

          setAccounts(payload.accounts);
          setNotice("Color mappings saved.");
          setSourceLabel(payload.sourceLabel ?? sourceLabel);
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to save color mappings.",
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
        <h2 className={styles.sectionTitle}>Account Color Mapping</h2>
        <p className={styles.copySmall}>Loading shared calendar accounts…</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className={styles.subpanel}>
        <h2 className={styles.sectionTitle}>Account Color Mapping</h2>
        <p className={styles.warning}>{errorMessage}</p>
      </section>
    );
  }

  return (
    <section className={styles.subpanel}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>Account Color Mapping</h2>
          <p className={styles.copySmall}>
            Set the description text color by the Google account associated with each
            calendar event. New identities default to {USER_TONE_LABELS[DEFAULT_USER_TONE]}.
          </p>
        </div>
        {sourceLabel ? <span className={styles.badge}>{sourceLabel}</span> : null}
      </div>

      {notice ? (
        <p className={notice === "Color mappings saved." ? styles.success : styles.warning}>
          {notice}
        </p>
      ) : null}

      {accounts.length > 0 ? (
        <div className={styles.mappingList}>
          {accounts.map((account) => (
            <div className={styles.mappingRow} key={account.email}>
              <div className={styles.accountMeta}>
                <span className={styles.accountEmail}>{account.email}</span>
                <span className={styles.accountSource}>{formatSource(account.source)}</span>
              </div>
              <div className={styles.mappingControls}>
                <span
                  className={`${styles.toneSwatch} ${styles[`toneSwatch${capitalize(account.tone)}`]}`}
                  aria-hidden="true"
                />
                <label className={styles.selectLabel}>
                  <span className={styles.visuallyHidden}>Color for {account.email}</span>
                  <select
                    className={styles.select}
                    onChange={(event) =>
                      handleToneChange(account.email, event.target.value as UserTone)
                    }
                    value={account.tone}
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
      ) : (
        <p className={styles.copySmall}>
          No calendar identities were found yet. Add events or verify the calendar sharing list.
        </p>
      )}

      <div className={styles.actions}>
        <button
          className={styles.link}
          disabled={isSaving || accounts.length === 0}
          onClick={handleSave}
          type="button"
        >
          {isSaving ? "Saving…" : "Save Colors"}
        </button>
      </div>
    </section>
  );
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatSource(source: AdminAccountTone["source"]) {
  if (source === "acl") {
    return "Shared Account";
  }

  if (source === "owner") {
    return "Calendar Owner";
  }

  if (source === "event") {
    return "Recent Creator";
  }

  return "Saved Mapping";
}
