import { useRouter } from "next/router";
import Layout from "pages/_layout";
import Button from "components/button";
import Card from "components/card";
import Collapse from "components/collapse";
import Link from "next/link";
import PATHS from "utils/paths";
import { RemoveIcon, RightIcon } from "components/icons";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import { FormInput } from "components/form";
import { onCartChangeEvent } from "utils/events";
import { Modal } from "components/modal";

const formSchema = z.object({
  quantity: z.number(),
  price: z.number(),
});
type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    getValues,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  const router = useRouter();
  const { productId } = router.query;
  const { data: storeId } = api.stores.getStoreIdByProductId.useQuery(
    { productId: productId as string },
    { ...cachedQueryOptions, enabled: !!productId }
  );
  const { data: product } = api.stores.getProductById.useQuery(
    { productId: productId as string },
    { ...cachedQueryOptions, enabled: !!productId }
  );
  const { mutate: setProductPrice } = api.stores.setProductPrice.useMutation({
    ...cachedQueryOptions,
    onSuccess: () => {
      setProductQuantity({
        productId: productId as string,
        quantity: getValues("quantity"),
      });
    },
  });
  const { mutate: setProductQuantity } =
    api.stores.setProductQuantity.useMutation({
      ...cachedQueryOptions,
      onSuccess: () => {
        document.dispatchEvent(new Event(onCartChangeEvent));
        void router.push(PATHS.product.path(productId as string));
      },
    });

  useEffect(() => {
    if (product) {
      setValue("quantity", product.quantity);
      setValue("price", product.price);
    }
  }, [product, setValue]);

  const handleEdit = handleSubmit(
    (data) => {
      setProductPrice({ productId: productId as string, price: data.price });
    },
    (e) => {
      toast.error(Object.values(e)[0]?.message || "Something went wrong");
    }
  );

  return !product ? (
    <></>
  ) : (
    <Layout>
      <div className="flex w-full max-w-xl flex-col gap-4">
        {storeId && (
          <Link
            href={PATHS.store.path(storeId)}
            className="group flex w-fit items-center text-slate-700"
          >
            <h2 className="transition-all group-hover:mr-1">H&M</h2>
            <RightIcon />
          </Link>
        )}
        <Card className="relative mt-0">
          <div className="flex justify-between">
            <h1>{product.name}</h1>
          </div>
          <span className="font-bold text-slate-700">{product.category}</span>
          <Collapse id={`desc`}>{product.description}</Collapse>
          <FormInput
            // className="max-w-[5rem] text-center"
            {...register("quantity", {
              setValueAs: (v: string) => (v ? parseInt(v) : 0),
            })}
            field="quantity"
            errors={errors}
            label="Quantity"
          />
          <FormInput
            // className="max-w-[5rem] text-center"
            {...register("price", {
              setValueAs: (v: string) => (v ? parseInt(v) : 0),
            })}
            field="price"
            errors={errors}
            label="Price"
          />
          <br />
          <div className="flex justify-center">
            <Button onClick={() => void handleEdit()} disabled={isSubmitting}>
              Edit Product
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
