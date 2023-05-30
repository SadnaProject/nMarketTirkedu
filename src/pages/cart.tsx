import Layout from "pages/_layout";
import { Rating } from "components/star";
import Card from "components/card";
import Price from "components/price";
import Collapse from "components/collapse";
import Link from "next/link";
import PATHS from "utils/paths";
import Button from "components/button";
import { ItemsIcon, RightIcon } from "components/icons";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";
import { FormInput } from "components/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "components/modal";
import { useRouter } from "next/router";

// const product = {
//   id: "6e259065-7899-4667-bbd0-b9366443896d",
//   name: "Recycled Frozen Pizza",
//   quantity: 5,
//   price: 77987,
//   category: "Electronics",
//   description:
//     "New range of formal shirts are designed keeping you in mind. With fits and styling that will make you stand apart",
// };

const formSchema = z.object({
  creditCardNumber: z
    .string()
    .min(16, "Credit card number is too short")
    .max(16, "Credit card number is too long")
    .regex(/^\d+$/, "Invalid credit card number"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const { data: cart } = api.users.getCart.useQuery(
    undefined,
    cachedQueryOptions
  );
  const router = useRouter();
  const { mutate: purchaseCart } = api.users.purchaseCart.useMutation({
    ...cachedQueryOptions,
    onSuccess: (receiptId) => router.push(PATHS.receipt.path(receiptId)),
  });

  const handlePurchase = handleSubmit((data) => {
    purchaseCart(data);
  });

  return (
    <Layout>
      <div className="flex w-full max-w-xl flex-col gap-4">
        <h1>Your Cart</h1>
        {cart &&
          (cart.storeIdToBasket.size === 0 ? (
            <div className="flex justify-center">
              <Card className="mt-0 flex h-full w-full max-w-md items-center justify-center">
                <span>Cart is empty</span>
                <br />
                <Link href={PATHS.products.path}>
                  <Button>Go Shopping!</Button>
                </Link>
              </Card>
            </div>
          ) : (
            <>
              {Object.values(Object.fromEntries(cart.storeIdToBasket)).map(
                (basket) => (
                  <>
                    <div key={basket.storeId} className="flex justify-between">
                      <Link
                        href={PATHS.store.path(basket.storeId)}
                        className="group flex w-fit items-center text-slate-700"
                      >
                        <h2 className="transition-all group-hover:mr-1">
                          {basket.store.name}
                        </h2>
                        <RightIcon />
                      </Link>
                      <Price price={95451.89} className="text-slate-700" />
                    </div>
                    {basket.products.map((product) => (
                      <Card key={product.storeProductId}>
                        <Link
                          href={PATHS.product.path(product.storeProductId)}
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
                        <Collapse id={`desc-${product.storeProductId}`}>
                          {product.description}
                        </Collapse>
                        <div className="flex flex-col items-center justify-between md:flex-row">
                          <Price price={product.price} />
                          <Rating rating={product.rating} />
                        </div>
                      </Card>
                    ))}
                  </>
                )
              )}
              <div className="flex gap-10 self-center">
                <span className="text-2xl font-bold">Total</span>
                <Price price={product.price * 3.2} />
              </div>
              <div className="self-center">
                <Button
                  data-hs-overlay={"#hs-modal-purchase"}
                  className="text-xl"
                >
                  Purchase Cart
                </Button>
              </div>
            </>
          ))}
      </div>
      <Modal
        id={"hs-modal-purchase"}
        title="Confirm purchase"
        content={
          <FormInput
            {...register("creditCardNumber")}
            errors={errors}
            field="creditCardNumber"
            label="Credit Card Number"
          />
        }
        footer={
          <Button onClick={() => void handlePurchase()}>Purchase Cart</Button>
        }
      />
    </Layout>
  );
}
