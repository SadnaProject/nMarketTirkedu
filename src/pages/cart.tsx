import Layout from "pages/_layout";
import { Rating } from "components/star";
import Card from "components/card";
import Price from "components/price";
import Collapse from "components/collapse";
import Link from "next/link";
import PATHS from "utils/paths";
import Button from "components/button";
import { twMerge } from "tailwind-merge";

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
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <div>
          <Link
            href={`${PATHS.store.path}/${product.id}`}
            className="group flex w-fit items-center text-slate-700"
          >
            <h2 className="text-xl font-bold transition-all group-hover:mr-1">
              H&M
            </h2>
            <RightIcon />
          </Link>

          {[1, 2, 3].map((item) => (
            <Card key={item}>
              <Link
                href={`${PATHS.product.path}/${item}`}
                className="group flex w-fit items-center text-slate-700"
              >
                <h3 className="text-lg font-bold transition-all group-hover:mr-1">
                  {product.name}
                </h3>
                <RightIcon className="h-5 w-5" />
              </Link>
              <span className="font-bold text-slate-700">
                {product.category}
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
          <h1 className="text-2xl font-bold">Total</h1>
          <Price price={product.price * 3.2} />
        </div>
        <div className="self-center">
          <Button className="text-xl">Purchase Cart</Button>
        </div>
      </div>
    </Layout>
  );
}

type RightIconProps = {
  className?: string;
};

function RightIcon({ className }: RightIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={twMerge("h-6 w-6", className)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </svg>
  );
}
