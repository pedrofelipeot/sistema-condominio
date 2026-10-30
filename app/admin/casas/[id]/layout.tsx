import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casa",
};

export default function CasaDetalheLayout({ children }: LayoutProps<"/admin/casas/[id]">) {
  return children;
}
