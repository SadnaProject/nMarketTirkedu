import { useRouter } from "next/router";
import Layout from "pages/_layout";
import { Rating } from "components/star";
import { useState } from "react";
import Button from "components/button";
import Card from "components/card";
import Price from "components/price";
import Profile from "components/profile";
import Gallery from "components/gallery";
import Collapse from "components/collapse";
import Link from "next/link";
import PATHS from "utils/paths";
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
  const [quantity, setQuantity] = useState(0);
  const router = useRouter();
  const { productId } = router.query;

  return (
    <Layout>
      <div className="flex max-w-xl flex-col gap-4">
        <Link
          href={PATHS.store.path(product.id)}
          className="group flex w-fit items-center text-slate-700"
        >
          <h2 className="transition-all group-hover:mr-1">H&M</h2>
          <RightIcon />
        </Link>
        <Card className="mt-0">
          <h1>{product.name}</h1>
          <span className="font-bold text-slate-700">{product.category}</span>
          <Collapse id={`desc`}>{product.description}</Collapse>
          <div className="flex flex-col items-center justify-between md:flex-row">
            <Price price={product.price} />
            <Rating rating={3.24} votes={5} />
          </div>
        </Card>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity === 0}
          >
            <MinusIcon />
          </Button>
          <span className="text-2xl font-bold text-slate-800">{quantity}</span>
          <Button
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity === product.quantity}
          >
            <PlusIcon />
          </Button>
        </div>
        <Gallery
          className="sm:grid-cols-1 lg:grid-cols-1"
          list={[1, 2, 3, 4, 5]}
          getId={(item) => item.toString()}
          getItem={(item) => (
            <Card key={item} className="mt-0">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center">
                  <Profile id={`todo${item}`} className="h-11 w-11" />
                  <div className="ms-2 flex flex-col">
                    <span className="font-bold text-slate-800">John Doe</span>
                    <span className="text-slate-700">5 days ago</span>
                  </div>
                </div>
                <Rating rating={3.24} />
              </div>
              I had a great experience with this product. I would recommend this
              to my friends and family.
            </Card>
          )}
        />
      </div>
    </Layout>
  );
}

function PlusIcon() {
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
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
    </svg>
  );
}
