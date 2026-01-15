type Option = {
  id: number;
  name: string;
};

type Props = {
  label: string;
  value: number | "";
  options: Option[];
  onChange: (id: number) => void;
};

export function SelectRow({ label, value, options, onChange }: Props) {
  const selected = options.find(o => o.id === value);

  return (
    <div className="relative">
      {/* 見た目用UI */}
      <div className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400">
          {selected?.name ?? "選択してください"}
        </span>
      </div>

      {/* 実体の select */}
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          absolute inset-0
          opacity-0
          w-full h-full
          cursor-pointer
        "
      >
        <option value="">選択してください</option>
        {options.map(o => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}
