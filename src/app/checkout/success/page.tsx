type CheckoutSuccessPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold">Pago en proceso de confirmación</h1>
      <p className="text-sm text-foreground/80">
        Volviste desde Mercado Pago. Esta pantalla no confirma pago por sí sola.
      </p>
      <p className="text-sm">orderId: {params.orderId ?? "N/A"}</p>
    </main>
  );
}
