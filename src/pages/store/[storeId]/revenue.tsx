import Layout from "../../_layout";
import { useRouter } from "next/router";
import { z } from "zod";
import StoreNavbar from "components/storeNavbar";
import Gallery from "components/gallery";
import Link from "next/link";
import Card from "components/card";
import PATHS, { useGuestRedirect } from "utils/paths";
import Price from "components/price";
import { ItemsIcon, RightIcon } from "components/icons";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";
import Collapse from "components/collapse";

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
      <div className="flex items-center gap-2">
        <span className="text-xl">Total Revenue</span>
        <Price
          price={
            purchases?.reduce((acc, purchase) => acc + purchase.price, 0) || 0
          }
        />
      </div>
      <Gallery
        list={purchases?.slice().reverse() || []}
        getId={(purchase) => purchase.purchaseId}
        className="w-full max-w-2xl grid-cols-1 lg:grid-cols-1"
        getItem={(receipt) => (
          <div>
            <Card className="gap-4">
              {Object.entries(Object.fromEntries(receipt.products)).map(
                ([productPurchaseId, productPurchase]) => {
                  return (
                    <div key={productPurchaseId}>
                      {" "}
                      <Link
                        href={PATHS.product.path(productPurchase.productId)}
                        className="group flex w-fit items-center text-slate-700"
                      >
                        <h3 className="text-lg font-bold transition-all group-hover:mr-1">
                          {productPurchase.name}
                        </h3>
                        <RightIcon className="h-5 w-5" />
                      </Link>
                      <span className="flex items-center gap-2 font-bold text-slate-700">
                        <ItemsIcon />
                        {productPurchase.quantity} items
                      </span>
                      <Collapse
                        id={`receipt-${receipt.purchaseId}-desc-${productPurchaseId}`}
                      >
                        {productPurchase.description}
                      </Collapse>
                      <div className="flex flex-col items-center justify-between md:flex-row">
                        <Price price={productPurchase.price} />
                        <div className="flex items-center gap-2">
                          <span className="text-xl">Before Discounts</span>
                          <Price
                            price={
                              productPurchase.price * productPurchase.quantity
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </Card>
          </div>
        )}
      />
    </Layout>
  );
}
