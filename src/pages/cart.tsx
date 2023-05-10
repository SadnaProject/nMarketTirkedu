import Layout from "pages/_layout";
import { Rating } from "components/star";
import Card from "components/card";
import Price from "components/price";
import Collapse from "components/collapse";
import Link from "next/link";
import PATHS from "utils/paths";
import Button from "components/button";
import { ItemsIcon, RightIcon } from "components/icons";

const product = {
  id: "6e259065-7899-4667-bbd0-b9366443896d",
  name: "Recycled Frozen Pizza",
  quantity: 5,
  price: 77987,
  category: "Electronics",
  description:
    "New range of formal shirts are designed keeping you in mind. With fits and styling that will make you stand apart",
};

export default function Home() {
  return (
    <Layout>
      <div className="flex w-full max-w-xl flex-col gap-4">
        <h1>Your Cart</h1>
        <div>
          <div className="flex justify-between">
            <Link
              href={PATHS.store.path(product.id)}
              className="group flex w-fit items-center text-slate-700"
            >
              <h2 className="transition-all group-hover:mr-1">H&M</h2>
              <RightIcon />
            </Link>
            <Price price={95451.89} className="text-slate-700" />
          </div>

          {[1, 2, 3].map((item) => (
            <Card key={item}>
              <Link
                href={PATHS.product.path(item.toString())}
                className="group flex w-fit items-center text-slate-700"
              >
                <h3 className="text-lg font-bold transition-all group-hover:mr-1">
                  {product.name}
                </h3>
                <RightIcon className="h-5 w-5" />
              </Link>
              <span className="flex items-center gap-2 font-bold text-slate-700">
                <ItemsIcon />
                {product.quantity} items
              </span>
              <Collapse id={`desc-${item}`}>{product.description}</Collapse>
              <div className="flex flex-col items-center justify-between md:flex-row">
                <Price price={product.price} />
                <Rating rating={3.24} votes={5} />
              </div>
            </Card>
          ))}
        </div>
        <div className="flex gap-10 self-center">
          <span className="text-2xl font-bold">Total</span>
          <Price price={product.price * 3.2} />
        </div>
        <div className="self-center">
          <Button className="text-xl">Purchase Cart</Button>
        </div>
      </div>
    </Layout>
  );
}
