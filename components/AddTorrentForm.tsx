"use client";

import { FormEvent, useState } from "react";
import { CategorySelect } from "@/components/CategorySelect";

type Props = {
  categories: string[];
  onSubmit: (urls: string, category: string) => Promise<void>;
};

export function AddTorrentForm({ categories, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <label className="add-form__label" htmlFor="torrent-url">
        新增種子
      </label>
      <textarea
        id="torrent-url"
        className="add-form__input"
        rows={3}
        placeholder="magnet:?xt=... 或 https://.../*.torrent"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitting}
      />
      <label className="add-form__label" htmlFor="torrent-category">
        下載分類
      </label>
      <CategorySelect
        id="torrent-category"
        value={category}
        categories={categories}
        disabled={submitting}
        emptyLabel={categories.length ? "無分類" : "尚未建立分類"}
        onChange={setCategory}
      />
      {error ? <p className="error">{error}</p> : null}
      <button
        type="submit"
        className="btn btn--primary btn--block"
        disabled={submitting || !value.trim()}
      >
        {submitting ? "新增中…" : "新增"}
      </button>
    </form>
  );
}
