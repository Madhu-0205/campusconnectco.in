import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbsUI({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-medium">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-violet-400 transition-colors"
          >
            <Home size={13} />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const href = item.url.replace(/^https?:\/\/[^\/]+/, "");

          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight size={12} className="text-slate-600 shrink-0" />
              {isLast ? (
                <span className="text-slate-200 font-semibold truncate max-w-50 sm:max-w-[300px]" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={href || "/"}
                  className="hover:text-violet-400 transition-colors truncate max-w-[150px] sm:max-w-50"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
