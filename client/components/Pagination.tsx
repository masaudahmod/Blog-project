import Link from "next/link";

type PaginationQuery = Record<string, string | number | undefined>;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  query?: PaginationQuery;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
}

type PageItem = number | "ellipsis";

const buildRange = (start: number, end: number) => {
  const range: number[] = [];
  for (let i = start; i <= end; i += 1) {
    range.push(i);
  }
  return range;
};

const buildPageItems = (
  currentPage: number,
  totalPages: number,
  siblingCount: number
): PageItem[] => {
  if (totalPages <= 1) return [];

  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) {
    return buildRange(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 2);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const pages: PageItem[] = [1];

  if (!showLeftEllipsis) {
    pages.push(...buildRange(2, rightSibling));
  } else {
    pages.push("ellipsis", ...buildRange(leftSibling, rightSibling));
  }

  if (showRightEllipsis) {
    pages.push("ellipsis", totalPages);
  } else {
    pages.push(...buildRange(rightSibling + 1, totalPages));
  }

  return pages;
};

const buildHref = (basePath: string, page: number, query?: PaginationQuery) => {
  const search = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        search.set(key, String(value));
      }
    });
  }
  search.set("page", String(page));
  const queryString = search.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
};

export default function Pagination({
  currentPage,
  totalPages,
  basePath = "/blog",
  query,
  siblingCount = 1,
  showFirstLast = true,
  className = "",
}: PaginationProps) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);
  const pages = buildPageItems(safeCurrentPage, safeTotalPages, siblingCount);

  if (pages.length === 0) return null;

  const previousDisabled = safeCurrentPage <= 1;
  const nextDisabled = safeCurrentPage >= safeTotalPages;

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-2 ${className}`.trim()}
    >
      {showFirstLast && (
        <Link
          href={buildHref(basePath, 1, query)}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
            previousDisabled
              ? "pointer-events-none opacity-50 border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500"
              : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          }`}
          aria-disabled={previousDisabled}
        >
          First
        </Link>
      )}

      <Link
        href={buildHref(basePath, Math.max(1, safeCurrentPage - 1), query)}
        className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
          previousDisabled
            ? "pointer-events-none opacity-50 border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500"
            : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
        }`}
        aria-disabled={previousDisabled}
      >
        Prev
      </Link>

      <div className="flex items-center gap-2">
        {pages.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-slate-400 dark:text-slate-500"
              >
                …
              </span>
            );
          }

          const isActive = item === safeCurrentPage;
          return (
            <Link
              key={item}
              href={buildHref(basePath, item, query)}
              aria-current={isActive ? "page" : undefined}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
              }`}
            >
              {item}
            </Link>
          );
        })}
      </div>

      <Link
        href={buildHref(basePath, Math.min(safeTotalPages, safeCurrentPage + 1), query)}
        className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
          nextDisabled
            ? "pointer-events-none opacity-50 border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500"
            : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
        }`}
        aria-disabled={nextDisabled}
      >
        Next
      </Link>

      {showFirstLast && (
        <Link
          href={buildHref(basePath, safeTotalPages, query)}
          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
            nextDisabled
              ? "pointer-events-none opacity-50 border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500"
              : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          }`}
          aria-disabled={nextDisabled}
        >
          Last
        </Link>
      )}
    </nav>
  );
}
