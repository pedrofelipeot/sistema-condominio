import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function CabecalhoPagina({ children, className = "" }: Props) {
  return (
    <header
      className={`rounded-lg bg-primary px-5 py-5 text-white shadow-sm sm:px-6 ${className}`}
    >
      {children}
    </header>
  );
}
