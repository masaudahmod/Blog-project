import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({
  items,
  readTime,
  className = "",
}: {
  items: BreadcrumbItem[];
  readTime?: string;
  className?: string;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.href && !isLast ? (
                  <Link href={item.href} className="transition hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                )}
                {!isLast && <span className="text-slate-400">›</span>}
              </li>
            );
          })}
        </ol>
      </nav>

      {readTime && <span className="text-xs text-slate-500">• {readTime}</span>}
    </div>
  );
}
