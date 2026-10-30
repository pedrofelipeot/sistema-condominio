import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avisos",
};

export default function AvisosLayout({ children }: LayoutProps<"/morador/avisos">) {
  return children;
}
