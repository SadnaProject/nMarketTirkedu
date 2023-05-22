import Layout from "../../_layout";
import Gallery from "components/gallery";
import Link from "next/link";
import PATHS from "utils/paths";
import { ProductCard } from "components/productCard";
import { useRouter } from "next/router";
import { z } from "zod";
import StoreNavbar from "components/storeNavbar";
import { api } from "utils/api";
import Card from "components/card";
import { CreateIcon } from "components/icons";
import { cachedQueryOptions } from "utils/query";

export default function Home() {
  const router = useRouter();
  const storeId = z.undefined().or(z.string()).parse(router.query.storeId);
  const { data: products } = api.stores.getStoreProducts.useQuery(
    {
      storeId: storeId as string,
    },
    { ...cachedQueryOptions, enabled: !!storeId }
  );
  const { data: canCreateProductInStore } =
    api.stores.canCreateProductInStore.useQuery(
      { storeId: storeId as string },
      { ...cachedQueryOptions, enabled: !!storeId }
    );

  return (
    <Layout>
      <StoreNavbar storeId={storeId} />
      {storeId && (
        <Gallery
          list={products ?? []}
          getId={(product) => product.id}
          getItem={(product) => (
            <Link href={PATHS.product.path(product.id)}>
              <ProductCard product={product} />
            </Link>
          )}
          addItemCard={
            canCreateProductInStore && (
              <Link href={PATHS.createProduct.path(storeId)}>
                <Card className="mt-0 flex h-full min-h-[9rem] min-w-[14rem] items-center justify-center">
                  <CreateIcon className="h-9 w-9" />
                </Card>
              </Link>
            )
          }
          noItemsCard={
            <Card className="mt-0 flex w-full max-w-md items-center justify-center">
              No products found
            </Card>
          }
        />
      )}
    </Layout>
  );
}
