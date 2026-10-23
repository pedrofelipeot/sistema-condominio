import type { ReactNode } from "react";

type StatusBadgeProps = {
  children: ReactNode;
  tone: "success" | "warning" | "danger" | "neutral";
};

const tones = {
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  neutral: "bg-slate-100 text-slate-700",
};

export default function StatusBadge({ children, tone }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
