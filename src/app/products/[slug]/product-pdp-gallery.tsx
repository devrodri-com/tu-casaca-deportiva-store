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
        className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-neutral-900/70 text-sm text-neutral-500"
        aria-label="Sin imagen de producto"
      >
        Sin imagen por ahora
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={main.url}
        alt={main.alt ?? title}
        className="aspect-[4/3] w-full rounded-2xl border border-white/10 bg-linear-to-b from-neutral-900 to-neutral-800 object-contain p-3 shadow-lg shadow-black/30"
        width={800}
        height={600}
      />
      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-2.5" aria-label="Miniaturas">
          {images.map((img, idx) => {
            const selected = idx === safeIndex;
            return (
              <li key={img.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-lg border p-0.5 transition ${
                    selected
                      ? "border-sky-500 ring-2 ring-sky-400/70"
                      : "border-white/15 hover:border-sky-500/40"
                  }`}
                  aria-current={selected ? "true" : undefined}
                  aria-label={`Ver imagen ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="h-14 w-14 rounded-md bg-neutral-900 object-contain p-1.5"
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
