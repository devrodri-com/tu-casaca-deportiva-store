"use client";

import { useActionState } from "react";
import type { AdminFormState } from "../actions";
import { deleteProductPermanentlyAction } from "../product-lifecycle-actions";

type AdminDeleteProductButtonProps = {
  productId: string;
  productTitle: string;
};

export function AdminDeleteProductButton({
  productId,
  productTitle,
}: AdminDeleteProductButtonProps) {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    deleteProductPermanentlyAction,
    null
  );
  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-red-300 bg-red-50 px-2 py-1 text-xs font-medium text-red-900 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/50"
        onClick={(e) => {
          if (
            !window.confirm(
              `¿Seguro que quieres eliminar ${productTitle} de manera permanente?`
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        {pending ? "…" : "Eliminar"}
      </button>
      {state?.error ? (
        <span className="max-w-[10rem] text-right text-[10px] leading-tight text-red-600 dark:text-red-400">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
