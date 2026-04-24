import type { ReactNode } from "react";

type AdminFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  /** Barra inferior (CTA) dentro de la misma tarjeta */
  footer?: ReactNode;
  className?: string;
};

/**
 * Sección con cabecera y cuerpo para formularios admin (estética tcds-card unificada).
 */
export function AdminFormSection({
  title,
  description,
  children,
  footer,
  className = "",
}: AdminFormSectionProps) {
  return (
    <section className={`tcds-card overflow-hidden ${className}`.trim()}>
      <div className="border-b border-border bg-surface/40 px-4 py-3 md:px-5 dark:border-white/10">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="p-4 md:p-5">{children}</div>
      {footer ? (
        <div className="flex flex-col justify-end gap-2 border-t border-border bg-surface/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-5 dark:border-white/10">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
