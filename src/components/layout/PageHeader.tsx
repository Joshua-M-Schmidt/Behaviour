"use client";

import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function PageHeader({ title, showBack, rightAction }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex items-center h-14 px-4 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="mr-2 p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <h1 className="flex-1 text-lg font-semibold truncate">{title}</h1>
      {rightAction && <div className="ml-2">{rightAction}</div>}
    </header>
  );
}
