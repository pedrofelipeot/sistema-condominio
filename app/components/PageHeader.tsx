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
    <header className="rounded-lg bg-primary p-4 text-white shadow-sm md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{title}</h1>
          {description && (
            <p className="mt-2 text-white/90">{description}</p>
          )}
        </div>

        {(badge || action) && (
          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            {badge && (
              <span className="self-start rounded-md border border-white/20 bg-white/15 px-3 py-1 text-sm font-semibold sm:self-auto">
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
