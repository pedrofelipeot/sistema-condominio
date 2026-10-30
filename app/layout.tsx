import type { Metadata, Viewport } from "next";
import "./globals.css";

const nomeSistema = "Gerenciador Condomínio";
const descricao = "Portal do condomínio para administração e moradores";
const corTema = "#1e3a5f";

function urlBase() {
  const bruta = process.env.APP_URL?.trim();
  if (bruta) {
    try {
      return new URL(bruta);
    } catch {
      // valor inválido: cai no endereço padrão abaixo
    }
  }
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: urlBase(),
  title: {
    default: nomeSistema,
    template: `%s | ${nomeSistema}`,
  },
  description: descricao,
  openGraph: {
    title: nomeSistema,
    description: descricao,
    locale: "pt_BR",
    siteName: nomeSistema,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: corTema,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="min-h-full flex flex-col bg-slate-100">{children}</body>
    </html>
  );
}
