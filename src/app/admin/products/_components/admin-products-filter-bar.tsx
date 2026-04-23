"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type {
  AdminProductListCustomization,
  AdminProductListQuery,
  AdminProductListStatus,
} from "@/modules/catalog/admin/admin-product-list-query";
import type { ProductType } from "@/modules/catalog";

type AdminProductsFilterBarProps = {
  query: AdminProductListQuery;
};

function appendIfPresent(
  params: URLSearchParams,
  key: string,
  value: string,
  omitValues: readonly string[] = [""]
): void {
  if (omitValues.includes(value)) {
    return;
  }
  params.set(key, value);
}

export function AdminProductsFilterBar({ query }: AdminProductsFilterBarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const params = new URLSearchParams();
    appendIfPresent(params, "q", String(fd.get("q") ?? "").trim());
    const status = String(fd.get("status") ?? "all") as AdminProductListStatus;
    if (status !== "all") {
      params.set("status", status);
    }
    const type = String(fd.get("type") ?? "all") as "all" | ProductType;
    if (type !== "all") {
      params.set("type", type);
    }
    const audience = String(fd.get("audience") ?? "all");
    if (audience === "adult" || audience === "kids") {
      params.set("audience", audience);
    }
    const custom = String(fd.get("custom") ?? "all") as AdminProductListCustomization;
    if (custom !== "all") {
      params.set("custom", custom);
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/admin/products?${qs}` : "/admin/products", { scroll: false });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="tcds-card flex flex-col gap-3 p-4"
      aria-busy={pending}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs font-medium text-foreground">
          Buscar
          <input
            type="search"
            name="q"
            defaultValue={query.search}
            placeholder="Título, slug o entidad"
            className="rounded border border-border px-2 py-1.5 text-sm"
            autoComplete="off"
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
          Estado
          <select
            name="status"
            defaultValue={query.status}
            className="rounded border border-border px-2 py-1.5 text-sm"
            disabled={pending}
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
          Tipo
          <select
            name="type"
            defaultValue={query.productType}
            className="rounded border border-border px-2 py-1.5 text-sm"
            disabled={pending}
          >
            <option value="all">Todos</option>
            <option value="football_jersey">Futbol</option>
            <option value="nba_jersey">NBA</option>
            <option value="jacket">Campera</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
          Publico
          <select
            name="audience"
            defaultValue={query.audience}
            className="rounded border border-border px-2 py-1.5 text-sm"
            disabled={pending}
          >
            <option value="all">Todos</option>
            <option value="adult">Adulto</option>
            <option value="kids">Niños</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
          Personalizacion
          <select
            name="custom"
            defaultValue={query.customization}
            className="rounded border border-border px-2 py-1.5 text-sm"
            disabled={pending}
          >
            <option value="all">Todos</option>
            <option value="yes">Si</option>
            <option value="no">No</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="tcds-btn-primary text-sm" disabled={pending}>
            {pending ? "Aplicando…" : "Aplicar"}
          </button>
          <Link href="/admin/products" className="tcds-btn-secondary inline-flex items-center text-sm">
            Limpiar
          </Link>
        </div>
      </div>
    </form>
  );
}
