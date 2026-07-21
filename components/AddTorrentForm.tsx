"use client";

import { FormEvent, useState } from "react";
import { CategorySelect } from "@/components/CategorySelect";
import { useI18n } from "@/components/I18nProvider";
import { AddIcon, PasteIcon } from "@/components/icons";

type Props = {
  categories: string[];
  onSubmit: (urls: string, category: string) => Promise<void>;
};

async function readClipboardText(clipboardFailed: string): Promise<string> {
  if (navigator.clipboard?.readText) {
    return (await navigator.clipboard.readText()).trim();
  }

  throw new Error(clipboardFailed);
}

export function AddTorrentForm({ categories, onSubmit }: Props) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePaste() {
    setPasting(true);
    setError(null);
    try {
      const text = await readClipboardText(t("add.clipboardFailed"));
      if (!text) {
        setError(t("add.clipboardEmpty"));
        return;
      }
      setValue(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("add.pasteFailed"));
    } finally {
      setPasting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const urls = value.trim();
    if (!urls) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(urls, category);
      setValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("add.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || pasting;
  const submitLabel = submitting ? t("add.submitting") : t("add.submit");
  const pasteLabel = pasting ? t("add.pasting") : t("add.paste");

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form__header">
        <label className="add-form__label" htmlFor="torrent-url">
          {t("add.title")}
        </label>
        <button
          type="button"
          className="btn btn--icon btn--sm"
          disabled={busy}
          aria-label={pasteLabel}
          title={pasteLabel}
          onClick={() => void handlePaste()}
        >
          <PasteIcon />
        </button>
      </div>
      <textarea
        id="torrent-url"
        className="add-form__input"
        rows={3}
        placeholder={t("add.placeholder")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={busy}
      />
      <label className="add-form__label" htmlFor="torrent-category">
        {t("add.category")}
      </label>
      <CategorySelect
        id="torrent-category"
        value={category}
        categories={categories}
        disabled={busy}
        emptyLabel={
          categories.length ? t("add.noCategory") : t("add.noCategoriesYet")
        }
        onChange={setCategory}
      />
      {error ? <p className="error">{error}</p> : null}
      <button
        type="submit"
        className="btn btn--icon btn--primary"
        disabled={busy || !value.trim()}
        aria-label={submitLabel}
        title={submitLabel}
      >
        <AddIcon />
      </button>
    </form>
  );
}
