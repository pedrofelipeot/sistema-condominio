import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: string;
  action?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  action,
}: PageHeaderProps) {
  return (
    <header className="rounded-lg bg-primary p-6 text-white shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-1 text-3xl font-semibold">{title}</h1>
          {description && (
            <p className="mt-2 text-white/90">{description}</p>
          )}
        </div>

        {(badge || action) && (
          <div className="flex items-center gap-3">
            {badge && (
              <span className="rounded-md border border-white/20 bg-white/15 px-3 py-1 text-sm font-semibold">
                {badge}
              </span>
            )}
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
