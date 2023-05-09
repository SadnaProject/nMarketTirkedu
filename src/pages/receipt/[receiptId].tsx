import Layout from "pages/_layout";
import { Rating } from "components/star";
import Card from "components/card";
import Price from "components/price";
import Collapse from "components/collapse";
import Link from "next/link";
import PATHS from "utils/paths";
import { RightIcon, TimeIcon } from "components/icons";
import Button from "components/button";
import Spinner from "components/spinner";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

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
  const router = useRouter();
  const { receiptId } = router.query;
  const session = useSession();
  const receipt = { id: "todo", date: new Date("2021-09-01"), userId: "123" };
  // todo - if buyer show all, if seller show only his

  return (
    <Layout>
      <div className="flex w-full max-w-xl flex-col gap-4">
        <h1>Receipt #{receiptId}</h1>
        <span className="flex items-end gap-1 text-sm text-slate-700">
          <TimeIcon className="h-5 w-5" />
          {receipt.date.toLocaleString()}
        </span>
        <div className="flex gap-10 self-center">
          <span className="text-2xl font-bold">Total</span>
          <Price price={product.price * 3.2} />
        </div>
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
              <span className="font-bold text-slate-700">
                {product.category}
              </span>
              <Collapse id={`desc-${item}`}>{product.description}</Collapse>
              <div className="flex flex-col items-center justify-between md:flex-row">
                <Price price={product.price} />
                <Rating rating={3.24} votes={5} />
              </div>
              {session.data?.user.id === receipt.userId && (
                <>
                  <br />
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-700">
                      Your Review
                    </span>
                    <Rating
                      rating={0}
                      onClick={(rating) => toast.success(rating.toString())}
                    />
                  </div>
                  <textarea
                    className="block w-full rounded-md border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className=" ml-auto mt-2">
                    <Button
                      onClick={() => {
                        toast.success("Review submitted");
                        // toast.error("Something went wrong");
                      }}
                    >
                      {false && <Spinner />} Submit
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
