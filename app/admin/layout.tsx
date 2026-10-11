export default function CasaLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
