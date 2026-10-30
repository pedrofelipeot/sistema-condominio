import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Definir senha",
};

export default function DefinirSenhaLayout({ children }: LayoutProps<"/definir-senha">) {
  return children;
}
