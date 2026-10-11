type Props = { label: string; id: string; type?: string; value: string; onChange: (v: string) => void };

export default function Campo({ label, id, type = "text", value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-lg">{label}</label>
      <input id={id} type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-lg" />
    </div>
  );
}