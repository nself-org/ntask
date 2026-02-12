'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-media-query';
import { Menu, X } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  sidebarWidth?: number;
  collapsible?: boolean;
}

export function AppShell({
  children,
  sidebar,
  header,
  footer,
  sidebarWidth = 260,
  collapsible = true,
}: AppShellProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {header && (
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl">
          {sidebar && (
            <button
              onClick={() => {
                if (isMobile) setMobileMenuOpen(!mobileMenuOpen);
                else setSidebarOpen(!sidebarOpen);
              }}
              className="mr-3 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle sidebar"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          )}
          <div className="flex flex-1 items-center">{header}</div>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {sidebar && (
          <>
            {isMobile && mobileMenuOpen && (
              <div
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
            )}
            <aside
              className={cn(
                'shrink-0 border-r border-border/40 bg-card transition-all duration-200',
                isMobile
                  ? cn(
                      'fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)]',
                      mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                    )
                  : sidebarOpen
                    ? 'relative'
                    : collapsible
                      ? 'w-0 overflow-hidden border-0'
                      : 'relative',
              )}
              style={sidebarOpen || (isMobile && mobileMenuOpen) ? { width: sidebarWidth } : undefined}
            >
              <div className="flex h-full flex-col overflow-y-auto p-4">{sidebar}</div>
            </aside>
          </>
        )}

        <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
          {footer && (
            <footer className="shrink-0 border-t border-border/40 px-4 py-3 sm:px-6">
              {footer}
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}
