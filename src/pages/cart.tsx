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
import { useEffect, useState } from "react";
import Spinner from "components/spinner";

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
  deliveryDetails: z.object({
    address: z.string(),
    city: z.string(),
    country: z.string(),
    name: z.string(),
    zip: z.string(),
  }),
  payment: z.object({
    creditCardNumber: z
      .string()
      .min(16, "Credit card number is too short")
      .max(16, "Credit card number is too long")
      .regex(/^\d+$/, "Invalid credit card number"),
    month: z.string(),
    year: z.string(),
    holder: z.string(),
    ccv: z.string(),
    id: z.string(), // todo??
  }),
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
    onSuccess: (ids) =>
      router.push(PATHS.receipt.path(ids.paymentTransactionId.toString())),
  });
  const { data: cartPrice } = api.stores.getCartPrice.useQuery(
    undefined,
    cachedQueryOptions
  );

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
                          {basket.storeId}
                          {/* todo */}
                        </h2>
                        <RightIcon />
                      </Link>
                      {/* <Price price={95451.89} className="text-slate-700" /> */}
                    </div>
                    {basket.products.map((product) => (
                      <Card key={product.storeProductId}>
                        <Link
                          href={PATHS.product.path(product.storeProductId)}
                          className="group flex w-fit items-center text-slate-700"
                        >
                          <h3 className="text-lg font-bold transition-all group-hover:mr-1">
                            {product.storeProductId}
                            {/* todo */}
                          </h3>
                          <RightIcon className="h-5 w-5" />
                        </Link>
                        <span className="flex items-center gap-2 font-bold text-slate-700">
                          <ItemsIcon />
                          {product.quantity} items
                        </span>
                        {/* <Collapse id={`desc-${product.storeProductId}`}>
                          {product.description}
                        </Collapse>
                        <div className="flex flex-col items-center justify-between md:flex-row">
                          <Price price={product.price} /> todo
                          <Rating rating={product.rating} />
                        </div> */}
                      </Card>
                    ))}
                  </>
                )
              )}
              <div className="flex gap-10 self-center">
                <span className="text-2xl font-bold">Total</span>
                <Price price={cartPrice ?? 0} />
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
          <>
            <FormInput
              {...register("payment.creditCardNumber")}
              errors={errors}
              field="payment.creditCardNumber"
              label="Credit Card Number"
            />
            <FormInput
              {...register("payment.month")}
              errors={errors}
              field="payment.month"
              label="Month"
            />
            <FormInput
              {...register("payment.year")}
              errors={errors}
              field="payment.year"
              label="Year"
            />
            <FormInput
              {...register("payment.ccv")}
              errors={errors}
              field="payment.ccv"
              label="CCV"
            />
            <FormInput
              {...register("payment.holder")}
              errors={errors}
              field="payment.holder"
              label="Holder Name"
            />
            <FormInput
              {...register("payment.id")}
              errors={errors}
              field="payment.id"
              label="Holder ID"
            />
            {/*  */}
            <FormInput
              {...register("deliveryDetails.name")}
              errors={errors}
              field="deliveryDetails.name"
              label="Name"
            />
            <FormInput
              {...register("deliveryDetails.country")}
              errors={errors}
              field="deliveryDetails.country"
              label="Country"
            />
            <FormInput
              {...register("deliveryDetails.city")}
              errors={errors}
              field="deliveryDetails.city"
              label="City"
            />
            <FormInput
              {...register("deliveryDetails.address")}
              errors={errors}
              field="deliveryDetails.address"
              label="Address"
            />
            <FormInput
              {...register("deliveryDetails.zip")}
              errors={errors}
              field="deliveryDetails.zip"
              label="Zip"
            />
          </>
        }
        footer={
          <Button
            onClick={() => {
              console.log(errors);
              void handlePurchase();
            }}
          >
            Purchase Cart
          </Button>
        }
      />
    </Layout>
  );
}
