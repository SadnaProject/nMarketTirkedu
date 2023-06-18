import Layout from "pages/_layout";
import Card from "components/card";
import Price from "components/price";
import Link from "next/link";
import PATHS, { useGuestRedirect } from "utils/paths";
import { ItemsIcon } from "components/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";
import Gallery from "components/gallery";

export default function Home() {
  useGuestRedirect();
  const router = useRouter();
  const { uid } = router.query;
  const { data: receipts } = api.purchaseHistory.getPurchasesByUser.useQuery(
    { userId: uid as string },
    {
      ...cachedQueryOptions,
      enabled: !!uid,
    }
  );

  return (
    <Layout>
      <Gallery
        list={receipts?.slice().reverse() || []}
        getId={(receipt) => receipt.purchaseId}
        getItem={(receipt) => (
          <Link href={PATHS.receipt.path(receipt.purchaseId)}>
            <Card className="flex items-center">
              <Price price={receipt.totalPrice} />
              <span className="flex items-end gap-1 text-sm text-slate-700">
                <ItemsIcon className="h-5 w-5" />
                {Object.values(
                  Object.fromEntries(receipt.storeIdToBasketPurchases)
                ).reduce((acc, basket) => acc + basket.products.size, 0)}{" "}
                items from {receipt.storeIdToBasketPurchases.size} stores
              </span>
            </Card>
          </Link>
        )}
        noItemsCard={
          <Card className="mt-0 flex h-full w-full max-w-md items-center justify-center">
            <span>No receipts yet</span>
          </Card>
        }
        className="grid-cols-1 lg:grid-cols-4"
      />
    </Layout>
  );
}
