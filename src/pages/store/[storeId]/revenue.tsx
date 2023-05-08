import Layout from "../../_layout";
import { useRouter } from "next/router";
import { z } from "zod";
import StoreNavbar from "components/storeNavbar";
import Gallery from "components/gallery";
import Link from "next/link";
import Card from "components/card";
import PATHS from "utils/paths";
import Price from "components/price";
import { TimeIcon } from "components/icons";

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
  const router = useRouter();
  const storeId = z.undefined().or(z.string()).parse(router.query.storeId);

  return (
    <Layout>
      <h1>The Happy Place</h1>
      {storeId && <StoreNavbar storeId={storeId} />}

      <Gallery
        list={receipts}
        getId={(receipt) => receipt.id}
        getItem={(receipt) => (
          <Link href={PATHS.receipt.path(receipt.id)}>
            <Card>
              <h2 className="text-lg font-bold text-slate-800">
                {receipt.username}
              </h2>
              <Price
                price={receipt.price}
                className="self-end"
                dollarClassName="text-sm"
                integerClassName="text-lg"
                decimalClassName="text-xs"
              />
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
