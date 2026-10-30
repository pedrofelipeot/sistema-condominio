import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Casas",
};

export default function CasasLayout({ children }: LayoutProps<"/admin/casas">) {
  return children;
}
