"use client";

type Props = {
  id?: string;
  value: string;
  categories: string[];
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  onChange: (category: string) => void;
};

export function CategorySelect({
  id,
  value,
  categories,
  disabled,
  allowEmpty = true,
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
      {allowEmpty ? <option value="">{emptyLabel}</option> : null}
      {categories.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
