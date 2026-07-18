"use client";

import { FormEvent, useState } from "react";
import { CategorySelect } from "@/components/CategorySelect";

type Props = {
  categories: string[];
  onSubmit: (urls: string, category: string) => Promise<void>;
};

async function readClipboardText(): Promise<string> {
  try {
    const { default: WebApp } = await import("@twa-dev/sdk");
    if (typeof WebApp.readTextFromClipboard === "function") {
      const text = await new Promise<string | null>((resolve) => {
        WebApp.readTextFromClipboard((value) => resolve(value ?? null));
      });
      if (text?.trim()) return text.trim();
    }
  } catch {
    // Fall through to browser clipboard API.
  }

  if (navigator.clipboard?.readText) {
    return (await navigator.clipboard.readText()).trim();
  }

  throw new Error("無法讀取剪貼簿");
}

export function AddTorrentForm({ categories, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePaste() {
    setPasting(true);
    setError(null);
    try {
      const text = await readClipboardText();
      if (!text) {
        setError("剪貼簿是空的");
        return;
      }
      setValue(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "貼上失敗");
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
      setError(err instanceof Error ? err.message : "新增失敗");
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || pasting;

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form__header">
        <label className="add-form__label" htmlFor="torrent-url">
          新增種子
        </label>
        <button
          type="button"
          className="btn btn--sm"
          disabled={busy}
          onClick={() => void handlePaste()}
        >
          {pasting ? "貼上中…" : "貼上"}
        </button>
      </div>
      <textarea
        id="torrent-url"
        className="add-form__input"
        rows={3}
        placeholder="magnet:?xt=... 或 https://.../*.torrent"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={busy}
      />
      <label className="add-form__label" htmlFor="torrent-category">
        下載分類
      </label>
      <CategorySelect
        id="torrent-category"
        value={category}
        categories={categories}
        disabled={busy}
        emptyLabel={categories.length ? "無分類" : "尚未建立分類"}
        onChange={setCategory}
      />
      {error ? <p className="error">{error}</p> : null}
      <button
        type="submit"
        className="btn btn--primary btn--block"
        disabled={busy || !value.trim()}
      >
        {submitting ? "新增中…" : "新增"}
      </button>
    </form>
  );
}
