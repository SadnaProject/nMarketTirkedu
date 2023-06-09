import Gallery from "components/gallery";
import { type StoreDTO } from "server/domain/Stores/Store";
import Layout from "./_layout";
import Link from "next/link";
import Card from "components/card";
import { Rating } from "components/star";
import PATHS, { useGuestRedirect } from "utils/paths";
import Price from "components/price";
import { ItemsIcon, TimeIcon } from "components/icons";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";

export default function Home() {
  const { data: receipts } = api.purchaseHistory.getMyPurchases.useQuery(
    undefined,
    cachedQueryOptions
  );

  return (
    <Layout>
      <h1>My Receipts</h1>
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
        className="grid-cols-1 lg:grid-cols-4"
      />
    </Layout>
  );
}

type StoreCardProps = {
  store: StoreDTO;
  role: string;
};

function StoreCard({ store, role }: StoreCardProps) {
  return (
    <Link href={PATHS.store.path(store.id)}>
      <Card>
        <h3 className="text-lg font-bold text-slate-800">{store.name}</h3>
        <span className="mb-2 font-bold text-slate-700">{role}</span>
        <Rating rating={3.25} votes={5} />
      </Card>
    </Link>
  );
}
