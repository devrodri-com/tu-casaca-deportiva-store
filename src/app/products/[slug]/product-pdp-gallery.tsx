"use client";

import { useMemo, useState } from "react";

export type ProductPdpGalleryImage = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
};

type ProductPdpGalleryProps = {
  images: ProductPdpGalleryImage[];
  title: string;
};

export function ProductPdpGallery({ images, title }: ProductPdpGalleryProps) {
  const initialIndex = useMemo(() => {
    const primaryIndex = images.findIndex((img) => img.isPrimary);
    return primaryIndex >= 0 ? primaryIndex : 0;
  }, [images]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const safeIndex = Math.min(activeIndex, Math.max(0, images.length - 1));
  const main = images[safeIndex];

  if (images.length === 0) {
    return (
      <div
        className="flex aspect-[4/3] w-full max-w-xl items-center justify-center rounded-lg border border-dashed border-border bg-surface/60 text-sm text-muted-foreground"
        aria-label="Sin imagen de producto"
      >
        Sin imagen por ahora
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={main.url}
        alt={main.alt ?? title}
        className="aspect-[4/3] w-full rounded-lg border border-border object-contain bg-surface/40"
        width={800}
        height={600}
      />
      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Miniaturas">
          {images.map((img, idx) => {
            const selected = idx === safeIndex;
            return (
              <li key={img.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-md border p-0.5 transition-shadow ${
                    selected
                      ? "border-sky-500 ring-2 ring-sky-400 ring-offset-2 ring-offset-white"
                      : "border-border hover:border-foreground/30"
                  }`}
                  aria-current={selected ? "true" : undefined}
                  aria-label={`Ver imagen ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="h-14 w-14 rounded object-cover"
                    width={56}
                    height={56}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
