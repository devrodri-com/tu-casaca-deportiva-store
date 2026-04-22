import { CartClient } from "./cart-client";

export default function CartPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <h1 className="tcds-title-page">Carrito</h1>
      <CartClient />
    </main>
  );
}
