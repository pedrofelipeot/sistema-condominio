import "./globals.css";


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
    >
      <body className="min-h-full flex flex-col bg-slate-100">{children}</body>
    </html>
  );
}
