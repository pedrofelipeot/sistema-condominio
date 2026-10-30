import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastrar morador",
};

export default function CadastroMoradorLayout({ children }: LayoutProps<"/admin/casas/[id]/cadastro-morador">) {
  return children;
}
