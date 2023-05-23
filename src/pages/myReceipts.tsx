import Gallery from "components/gallery";
import { type StoreDTO } from "server/domain/Stores/Store";
import Layout from "./_layout";
import Link from "next/link";
import Card from "components/card";
import { Rating } from "components/star";
import PATHS, { useGuestRedirect } from "utils/paths";
import Price from "components/price";
import { TimeIcon } from "components/icons";
import { api } from "utils/api";
import { cachedQueryOptions } from "utils/query";

const receipts = [
  {
    id: "1",
    username: "John Doe",
    price: 95451.89,
    date: new Date("2021-09-01"),
  },
  {
    id: "2",
    username: "John Doe",
    price: 95451.89,
    date: new Date("2021-09-01"),
  },
  {
    id: "3",
    username: "John Doe",
    price: 95451.89,
    date: new Date("2021-09-01"),
  },
];

export default function Home() {
  const { data: purchases } = api.purchaseHistory.getMyPurchases.useQuery(
    undefined,
    cachedQueryOptions
  );

  return (
    <Layout>
      <h1>My Receipts</h1>
      <Gallery
        list={receipts}
        getId={(receipt) => receipt.id}
        getItem={(receipt) => (
          <Link href={PATHS.receipt.path(receipt.id)}>
            <Card>
              <Price price={receipt.price} />
              <span className="flex items-end gap-1 text-sm text-slate-700">
                <TimeIcon className="h-5 w-5" />
                {receipt.date.toLocaleString()}
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
