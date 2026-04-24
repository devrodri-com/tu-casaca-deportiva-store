import { notFound } from "next/navigation";
import { StorePublicFooter } from "@/components/storefront/store-public-footer";
import { StorePublicHeader } from "@/components/storefront/store-public-header";
import { getOrderDetailByPublicReference } from "@/modules/orders/application/get-order-detail";
import { PublicOrderPage } from "./_components/public-order-page";

type OrderDetailPageProps = {
  params: Promise<{ publicReference: string }>;
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { publicReference } = await params;
  const order = await getOrderDetailByPublicReference(publicReference);

  if (!order) {
    notFound();
  }

  return (
    <div className="storefront-shell">
      <StorePublicHeader />
      <PublicOrderPage order={order} />
      <StorePublicFooter />
    </div>
  );
}
