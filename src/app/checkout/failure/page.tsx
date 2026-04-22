type CheckoutFailurePageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutFailurePage({
  searchParams,
}: CheckoutFailurePageProps) {
  const params = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">Pago no completado</h1>
      <p className="text-sm text-foreground/80">
        El pago no se completó. Podés reintentar desde checkout.
      </p>
      <p className="text-sm">orderId: {params.orderId ?? "N/A"}</p>
    </main>
  );
}
