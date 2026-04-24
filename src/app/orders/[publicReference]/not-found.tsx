import Link from "next/link";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";

export default function PublicOrderNotFound() {
  return (
    <div className="storefront-shell">
      <StorePublicHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="tcds-title-page">No encontramos ese pedido</h1>
        <p className="tcds-prose max-w-xl">
          Revisá el enlace o la referencia. Si el pedido es reciente, puede tardar unos
          minutos en aparecer; si abriste un link compartido, asegurate de que esté
          completo.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link className="tcds-btn-primary inline-flex w-fit" href="/">
            Ir al inicio
          </Link>
          <Link className="tcds-link text-sm" href="/products">
            Ver productos
          </Link>
        </div>
      </main>
      <StorePublicFooter />
    </div>
  );
}
