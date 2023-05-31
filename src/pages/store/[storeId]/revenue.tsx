import Layout from "../../_layout";
import { useRouter } from "next/router";
import { z } from "zod";
import StoreNavbar from "components/storeNavbar";
import Gallery from "components/gallery";
import Link from "next/link";
import Card from "components/card";
import PATHS, { useGuestRedirect } from "utils/paths";
import Price from "components/price";
import { TimeIcon } from "components/icons";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";

// const receipts = [
//   {
//     id: "1",
//     username: "John Doe",
//     price: 95451.89,
//     date: new Date("2021-09-01"),
//   },
//   {
//     id: "2",
//     username: "John Doe",
//     price: 95451.89,
//     date: new Date("2021-09-01"),
//   },
//   {
//     id: "3",
//     username: "John Doe",
//     price: 95451.89,
//     date: new Date("2021-09-01"),
//   },
// ];

export default function Home() {
  useGuestRedirect();
  const router = useRouter();
  const storeId = z.undefined().or(z.string()).parse(router.query.storeId);
  const { data: purchases } = api.stores.getPurchaseByStore.useQuery(
    { storeId: storeId as string },
    { ...cachedQueryOptions, enabled: !!storeId }
  );

  return (
    <Layout>
      <StoreNavbar storeId={storeId} />
      {purchases && (
        <Gallery
          list={purchases}
          getId={(purchase) => purchase.purchaseId}
          getItem={(purchase) => (
            <Link href={PATHS.receipt.path(purchase.purchaseId)}>
              <Card>
                <h2 className="text-lg font-bold text-slate-800">
                  {/* {purchase.username} todo */}
                </h2>
                <Price
                  price={purchase.price}
                  className="self-end"
                  dollarClassName="text-sm"
                  integerClassName="text-lg"
                  decimalClassName="text-xs"
                />
                <span className="flex items-end gap-1 text-sm text-slate-700">
                  <TimeIcon className="h-5 w-5" />
                  {/* {purchase.date.toLocaleString()} todo */}
                </span>
              </Card>
            </Link>
          )}
          className="grid-cols-1 lg:grid-cols-4"
        />
      )}
    </Layout>
  );
}
