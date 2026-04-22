import { CheckoutClient } from "./checkout-client";

export default function CheckoutPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <CheckoutClient />
    </main>
  );
}
