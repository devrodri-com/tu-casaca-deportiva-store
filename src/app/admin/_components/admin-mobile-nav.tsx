"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AdminNavPanel } from "./admin-nav-panel";
import { AdminThemeToggle } from "./admin-theme-toggle";

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const previousActiveRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKeydown);

    previousActiveRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    requestAnimationFrame(() => {
      drawerRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeydown);
      previousActiveRef.current?.focus();
    };
  }, [open, close]);

  return (
    <>
      <div
        className="sticky top-0 z-30 flex items-center justify-end gap-2 border-b border-border bg-card/95 py-2.5 pl-3 pr-2 backdrop-blur supports-backdrop-filter:bg-card/80 md:hidden"
        role="banner"
      >
        <AdminThemeToggle />
        <button
          type="button"
          onClick={() => {
            setOpen(true);
          }}
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm transition hover:bg-surface dark:hover:bg-white/5"
          aria-label="Abrir menú de administración"
          aria-expanded={open}
          aria-controls="admin-nav-drawer"
        >
          <MenuIcon />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden" role="none">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Cerrar menú de administración"
            onClick={close}
          />
          <div
            ref={drawerRef}
            id="admin-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] min-w-0 max-w-full flex-col border-l border-border bg-card shadow-2xl outline-none"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2.5">
              <h2 id={titleId} className="text-sm font-semibold text-foreground">
                Menú
              </h2>
              <button
                type="button"
                onClick={close}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-foreground transition hover:bg-surface dark:hover:bg-white/5"
                aria-label="Cerrar menú"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AdminNavPanel
                onNavigate={close}
                className="h-full"
                showThemeInPanel={false}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
