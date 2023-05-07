import Layout from "pages/_layout";
import { Rating } from "components/star";
import Card from "components/card";
import Price from "components/price";
import Collapse from "components/collapse";
import Link from "next/link";
import PATHS from "utils/paths";
import Button from "components/button";
import { RightIcon } from "components/icons";

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

function ItemsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
      />
    </svg>
  );
}
