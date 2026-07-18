"use client";

type Props = {
  id?: string;
  value: string;
  categories: string[];
  disabled?: boolean;
  emptyLabel?: string;
  onChange: (category: string) => void;
};

export function CategorySelect({
  id,
  value,
  categories,
  disabled,
  emptyLabel = "無分類",
  onChange,
}: Props) {
  return (
    <select
      id={id}
      className="select"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{emptyLabel}</option>
      {categories.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
