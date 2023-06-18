import Layout from "pages/_layout";
import { Rating } from "components/star";
import Card from "components/card";
import Price from "components/price";
import Collapse from "components/collapse";
import Link from "next/link";
import PATHS from "utils/paths";
import { ItemsIcon, RightIcon, TimeIcon } from "components/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";

export default function Home() {
  const router = useRouter();
  const { receiptId } = router.query;
  const session = useSession();
  const { data: receipt } = api.purchaseHistory.getPurchase.useQuery(
    { purchaseId: receiptId as string },
    {
      ...cachedQueryOptions,
      enabled: !!receiptId,
    }
  );

  return (
    <Layout>
      <div className="flex w-full max-w-xl flex-col gap-4">
        <h1>Receipt Details</h1>
        {receipt && (
          <>
            {Object.values(
              Object.fromEntries(receipt.storeIdToBasketPurchases)
            ).map((basket) => (
              <div key={basket.storeId}>
                <div className="flex justify-between">
                  <Link
                    href={PATHS.store.path(basket.storeId)}
                    className="group flex w-fit items-center text-slate-700"
                  >
                    <h2 className="transition-all group-hover:mr-1">
                      {basket.storeName}
                    </h2>
                    <RightIcon />
                  </Link>
                  {/* <Price price={95451.89} className="text-slate-700" /> */}
                </div>
                {Object.entries(Object.fromEntries(basket.products)).map(
                  ([productPurchaseId, productPurchase]) => {
                    return (
                      <Card key={productPurchaseId}>
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
                        <Collapse id={`desc-${productPurchaseId}`}>
                          {productPurchase.description}
                        </Collapse>
                        <div className="flex flex-col items-center justify-between md:flex-row">
                          <Price price={productPurchase.price} />
                          <div className="flex items-center gap-2">
                            <span className="text-xl">Total</span>
                            <Price
                              price={
                                productPurchase.price * productPurchase.quantity
                              }
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  }
                )}
              </div>
            ))}
            <div className="flex gap-10 self-center">
              <span className="text-2xl font-bold">Total</span>
              <Price price={receipt.totalPrice ?? 0} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
