import Layout from "../../_layout";
import Gallery from "components/gallery";
import Link from "next/link";
import PATHS from "utils/paths";
import { ProductCard } from "components/productCard";
import { useRouter } from "next/router";
import { z } from "zod";
import StoreNavbar from "components/storeNavbar";
import { api } from "utils/api";
import { type StoreProductDTO } from "server/domain/Stores/StoreProduct";
import Card from "components/card";
import { CreateIcon } from "components/icons";

// const products = [
// {
//   id: "f0f30ce3-b604-41d7-a3ec-89ed4f92cfb6",
//   name: "Bespoke Fresh Car",
//   quantity: 89812,
//   price: 85401,
//   category: "Tools",
//   description:
//     "Andy shoes are designed to keeping in mind durability as well as trends, the most stylish range of shoes & sandals",
// },
// {
//   id: "a53b5aab-2bc2-4053-bb13-00ab0beeb7e9",
//   name: "Handcrafted Steel Chips",
//   quantity: 28082,
//   price: 16453,
//   category: "Garden",
//   description:
//     "New ABC 13 9370, 13.3, 5th Gen CoreA5-8250U, 8GB RAM, 256GB SSD, power UHD Graphics, OS 10 Home, OS Office A & J 2016",
// },
// {
//   id: "a9f72f7e-8dfe-4ea5-915e-84c570846cff",
//   name: "Recycled Metal Shirt",
//   quantity: 70663,
//   price: 4041,
//   category: "Health",
//   description:
//     "The automobile layout consists of a front-engine design, with transaxle-type transmissions mounted at the rear of the engine and four wheel drive",
// },
// {
//   id: "dc96a9bd-dd22-4f59-bd17-3096cdbc6073",
//   name: "Handmade Fresh Gloves",
//   quantity: 4422,
//   price: 74320,
//   category: "Industrial",
//   description:
//     "Ergonomic executive chair upholstered in bonded black leather and PVC padded seat and back for all-day comfort and support",
// },
// {
//   id: "e3df71cc-597d-40df-ade6-0e196f68b856",
//   name: "Refined Wooden Chicken",
//   quantity: 90053,
//   price: 83781,
//   category: "Kids",
//   description:
//     "The Nagasaki Lander is the trademarked name of several series of Nagasaki sport bikes, that started with the 1984 ABC800J",
// },
// {
//   id: "7a07347f-2fd4-4052-a402-c8acaf213711",
//   name: "Elegant Bronze Bike",
//   quantity: 63047,
//   price: 6796,
//   category: "Jewelry",
//   description:
//     "Andy shoes are designed to keeping in mind durability as well as trends, the most stylish range of shoes & sandals",
// },
// {
//   id: "fa9d1e51-07fa-4004-aba7-f51d8cf3a526",
//   name: "Electronic Rubber Pizza",
//   quantity: 78445,
//   price: 97053,
//   category: "Grocery",
//   description: "The Football Is Good For Training And Recreational Purposes",
// },
// {
//   id: "119942b9-4848-4c9d-bae0-626a28245bc9",
//   name: "Unbranded Metal Sausages",
//   quantity: 72542,
//   price: 99543,
//   category: "Sports",
//   description:
//     "The beautiful range of Apple Naturalé that has an exciting mix of natural ingredients. With the Goodness of 100% Natural Ingredients",
// },
// {
//   id: "99dd10bc-b2e3-4412-887a-f4c94ebbfcbf",
//   name: "Electronic Bronze Cheese",
//   quantity: 7895,
//   price: 55589,
//   category: "Kids",
//   description: "The Football Is Good For Training And Recreational Purposes",
// },
// {
//   id: "0abe7042-379f-411e-a83f-7685f7fe1240",
//   name: "Elegant Wooden Keyboard",
//   quantity: 68413,
//   price: 8056,
//   category: "Shoes",
//   description:
//     "New ABC 13 9370, 13.3, 5th Gen CoreA5-8250U, 8GB RAM, 256GB SSD, power UHD Graphics, OS 10 Home, OS Office A & J 2016",
// },
// {
//   id: "6e259065-7899-4667-bbd0-b9366443896d",
//   name: "Recycled Frozen Pizza",
//   quantity: 29082,
//   price: 77987,
//   category: "Electronics",
//   description:
//     "New range of formal shirts are designed keeping you in mind. With fits and styling that will make you stand apart",
// },
// ];

export default function Home() {
  const router = useRouter();
  const storeId = z.undefined().or(z.string()).parse(router.query.storeId);
  const { data: products } = api.stores.getStoreProducts.useQuery({
    storeId: storeId as string,
  });

  return (
    <Layout>
      <h1>The Happy Place</h1>
      {storeId && <StoreNavbar storeId={storeId} />}
      {storeId && (
        <Gallery
          list={products ? [{ id: "first" }, ...products] : [{ id: "first" }]}
          getId={(product) => product.id}
          getItem={(product, index) =>
            index === 0 ? (
              <Link href={PATHS.createProduct.path(storeId)}>
                <Card className="mt-0 flex h-full min-h-[9rem] min-w-[14rem] items-center justify-center">
                  <CreateIcon className="h-9 w-9" />
                </Card>
              </Link>
            ) : (
              <Link href={PATHS.product.path(product.id)}>
                <ProductCard product={product as StoreProductDTO} />
              </Link>
            )
          }
        />
      )}
    </Layout>
  );
}
