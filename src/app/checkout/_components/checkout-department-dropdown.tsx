"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type CheckoutDepartmentDropdownProps = {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

export function CheckoutDepartmentDropdown({
  value,
  options,
  onChange,
}: CheckoutDepartmentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  const selectedLabel = value.trim().length > 0 ? value : "Seleccioná un departamento";
  const selectedIndex = useMemo(() => options.findIndex((item) => item === value), [options, value]);
  const initialHighlight = selectedIndex >= 0 ? selectedIndex : 0;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (!containerRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            return;
          }
          setHighlightedIndex(initialHighlight);
          setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!isOpen) {
              setHighlightedIndex(initialHighlight);
              setIsOpen(true);
              return;
            }
            setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
            return;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!isOpen) {
              setHighlightedIndex(initialHighlight);
              setIsOpen(true);
              return;
            }
            setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            return;
          }
          if (event.key === "Escape") {
            setIsOpen(false);
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (isOpen) {
              const option = options[highlightedIndex];
              if (option) {
                onChange(option);
              }
              setIsOpen(false);
              return;
            }
            setHighlightedIndex(initialHighlight);
            setIsOpen(true);
          }
        }}
        className="inline-flex min-h-10 w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 text-left text-sm text-zinc-900 outline-none transition focus-visible:border-sky-500/70 focus-visible:ring-2 focus-visible:ring-sky-500/35 dark:border-white/15 dark:bg-neutral-950 dark:text-white"
      >
        <span className={value ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-neutral-500"}>
          {selectedLabel}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          className={`h-4 w-4 text-zinc-500 transition dark:text-neutral-400 ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Departamento"
          className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-md border border-zinc-200 bg-white p-1 shadow-xl shadow-zinc-400/25 dark:border-white/15 dark:bg-neutral-950 dark:shadow-black/40"
        >
          {options.map((option, index) => {
            const isSelected = value === option;
            const isHighlighted = highlightedIndex === index;
            return (
              <li key={option} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`inline-flex min-h-9 w-full items-center rounded-md px-2.5 text-sm transition ${
                    isSelected
                      ? "bg-sky-500/15 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100"
                      : isHighlighted
                        ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-white"
                        : "text-zinc-800 hover:bg-zinc-50 dark:text-neutral-200 dark:hover:bg-white/5"
                  }`}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
