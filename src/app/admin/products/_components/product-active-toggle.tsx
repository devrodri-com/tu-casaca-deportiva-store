"use client";

import { useActionState } from "react";
import type { AdminFormState } from "../actions";
import { setProductActiveAction } from "../product-lifecycle-actions";

type ProductActiveToggleProps = {
  productId: string;
  isActive: boolean;
};

export function ProductActiveToggle({ productId, isActive }: ProductActiveToggleProps) {
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    setProductActiveAction,
    null
  );
  return (
    <div className="flex flex-col items-start gap-1">
      <form action={action}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="targetActive" value={isActive ? "false" : "true"} />
        <button type="submit" className="tcds-btn-secondary text-xs" disabled={pending}>
          {pending ? "…" : isActive ? "Desactivar" : "Activar"}
        </button>
      </form>
      {state?.error ? (
        <p className="max-w-[12rem] text-xs text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="max-w-[12rem] text-xs text-emerald-800 dark:text-emerald-300">{state.success}</p>
      ) : null}
    </div>
  );
}
