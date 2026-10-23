import type { CSSProperties, ReactNode } from "react";
import NavegacaoArea from "@/app/components/NavegacaoArea";

type MoradorTheme = CSSProperties & Record<`--morador-${string}`, string>;

const theme: MoradorTheme = {
  "--morador-background": "#F1F5F9",
  "--morador-surface": "#FFFFFF",
  "--morador-text-primary": "#1F2937",
  "--morador-text-secondary": "#475569",
  "--morador-border": "#E2E8F0",
  "--morador-success": "#15803D",
  "--morador-warning": "#B45309",
  "--morador-danger": "#B91C1C",
};

export default function MoradorLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[var(--morador-background)] text-[var(--morador-text-primary)]"
      style={theme}
    >
      <NavegacaoArea area="morador" />
      {children}
    </div>
  );
}
