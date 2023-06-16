import { useRouter } from "next/router";
import Layout from "pages/_layout";
import { Rating } from "components/star";
import { useEffect } from "react";
import Button from "components/button";
import Card from "components/card";
import Price from "components/price";
import Profile from "components/profile";
import Gallery from "components/gallery";
import Collapse from "components/collapse";
import Link from "next/link";
import PATHS from "utils/paths";
import {
  CartIcon,
  CourtHammerIcon,
  EditIcon,
  RightIcon,
} from "components/icons";
import { api } from "server/communication/api";
import { cachedQueryOptions } from "utils/query";
import { onCartChangeEvent } from "utils/events";
import Input from "components/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

const quantitySchema = z.object({
  quantity: z.number().int().nonnegative(),
});
type quantityFormValues = z.infer<typeof quantitySchema>;

const bidSchema = z.object({
  price: z.number().nonnegative(),
});
type bidFormValues = z.infer<typeof bidSchema>;

export default function Home() {
  const { data: session } = useSession();
  const quantityForm = useForm<quantityFormValues>({
    resolver: zodResolver(quantitySchema),
    defaultValues: { quantity: 0 },
  });
  const bidForm = useForm<bidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: { price: 0 },
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
  const { mutate: addToCart } = api.users.addProductToCart.useMutation({
    ...cachedQueryOptions,
    onSuccess: () => {
      document.dispatchEvent(new Event(onCartChangeEvent));
      void refetchCart();
    },
  });
  const { mutate: addBid } = api.users.addBid.useMutation({
    ...cachedQueryOptions,
    onSuccess: () => {
      toast.success("Bid created");
    },
  });
  const { data: cart, refetch: refetchCart } = api.users.getCart.useQuery(
    undefined,
    cachedQueryOptions
  );
  const { data: canEditProductInStore } =
    api.stores.canEditProductInStore.useQuery(
      { storeId: storeId as string },
      { ...cachedQueryOptions, enabled: !!storeId }
    );

  useEffect(() => {
    if (cart) {
      const product = cart.storeIdToBasket
        .get(storeId as string)
        ?.products.find((product) => product.storeProductId === productId);
      if (product) {
        quantityForm.setValue("quantity", product.quantity);
      }
    }
  }, [cart, productId, storeId, quantityForm.setValue]);

  const handleChangeCartQuantity = quantityForm.handleSubmit(
    (data) => {
      addToCart({
        productId: productId as string,
        amount: data.quantity,
      });
    },
    (e) => {
      toast.error(Object.values(e)[0]?.message || "Something went wrong");
    }
  );

  const handleCreateBid = bidForm.handleSubmit(
    (data) => {
      addBid({
        type: "Store",
        productId: productId as string,
        price: data.price,
      });
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
            {storeId && canEditProductInStore && (
              <Link href={PATHS.editProduct.path(productId as string)}>
                <EditIcon />
              </Link>
            )}
          </div>
          <span className="font-bold text-slate-700">{product.category}</span>
          <Collapse id={`desc`}>{product.description}</Collapse>
          <div className="flex flex-col items-center justify-between md:flex-row">
            <Price price={product.price} />
            <Rating rating={product.rating} />
          </div>
        </Card>
        <div className="flex items-center justify-center gap-3">
          <Input
            className="max-w-[5rem] text-center"
            {...quantityForm.register("quantity", {
              setValueAs: (v: string) => (v ? parseInt(v) : 0),
            })}
          />
          <Button
            onClick={() => void handleChangeCartQuantity()}
            disabled={quantityForm.formState.isSubmitting}
          >
            <CartIcon className="h-4 w-4" />
            Change Cart Quantity
          </Button>
        </div>
        {session?.user.type === "member" && (
          <div className="flex items-center justify-center gap-3">
            <Input
              className="max-w-[5rem] text-center"
              {...bidForm.register("price", {
                setValueAs: (v: string) => (v ? parseInt(v) : 0),
              })}
            />
            <Button
              onClick={() => void handleCreateBid()}
              disabled={bidForm.formState.isSubmitting}
            >
              <CourtHammerIcon />
              Create bid
            </Button>
          </div>
        )}
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
