import Gallery from "components/gallery";
import RateSlider from "components/slider";
import Input from "components/input";
import Layout from "./_layout";
import PATHS from "utils/paths";
import Link from "next/link";
import { ProductCard } from "components/productCard";
import { api } from "utils/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormRegister, useForm } from "react-hook-form";
import Button from "components/button";
import { cachedQueryOptions } from "utils/query";
import { toast } from "react-hot-toast";
import Spinner from "components/spinner";
import Card from "components/card";
import { useCallback } from "react";

const formSchema = z.object({
  name: z.string().optional(),
  keywords: z.string().array().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minProductRating: z.number().optional(),
  maxProductRating: z.number().optional(),
  minStoreRating: z.number().optional(),
  maxStoreRating: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const { data: products, refetch: refetchProducts } =
    api.stores.searchProducts.useQuery(getValues(), cachedQueryOptions);

  const handleSearch = handleSubmit(
    (data) => {
      void refetchProducts();
    },
    (e) => {
      toast.error(Object.values(e)[0]?.message || "Something went wrong");
    }
  );

  return (
    <Layout>
      <h1>Search Products</h1>
      <div className="rounded-md shadow-sm sm:flex">
        {/* <CategoryDropdown /> */}
        <Input
          {...register("category")}
          placeholder="Category"
          className="rounded-b-none sm:rounded-r-none sm:rounded-bl-lg"
        />
        <Input
          {...register("name")}
          placeholder="Product name"
          className="rounded-none"
        />
        <Input
          {...register("keywords", {
            setValueAs: (v: string) => (v ? v.split(" ") : undefined),
          })}
          placeholder="Keywords"
          className="rounded-t-none sm:rounded-l-none sm:rounded-tr-lg"
        />
      </div>
      <div className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-6">
        <div className="flex items-center gap-4">
          <span className="text-slate-800">Product Rating</span>
          <RateSlider
            onChange={(values) => {
              setValue("minProductRating", values[0]);
              setValue("maxProductRating", values[1]);
            }}
          />
        </div>
        <div className="flex items-center justify-end gap-4">
          <span className="text-slate-800">Store Rating</span>
          <RateSlider
            onChange={(values) => {
              setValue("minStoreRating", values[0]);
              setValue("maxStoreRating", values[1]);
            }}
          />
        </div>
      </div>
      <MinMaxPrice register={register} />
      <Button onClick={() => void handleSearch()}>
        {isSubmitting && <Spinner />} Search
      </Button>
      <Gallery
        list={products ?? []}
        getId={(product) => product.id}
        getItem={(product) => (
          <Link href={PATHS.product.path(product.id)}>
            <ProductCard product={product} />
          </Link>
        )}
        noItemsCard={
          <Card className="mt-0 flex h-full w-full max-w-md items-center justify-center">
            No products found
          </Card>
        }
      />
    </Layout>
  );
}

type MinMaxPriceProps = {
  register: UseFormRegister<FormValues>;
};

function MinMaxPrice({ register }: MinMaxPriceProps) {
  return (
    <div className="flex shadow-sm">
      <div className="inline-flex min-w-fit items-center rounded-l-md border border-r-0 border-gray-300 bg-slate-50 px-2">
        <span className="text-sm text-slate-600">$</span>
      </div>
      <Input
        placeholder="0.00"
        className="w-24 rounded-none"
        {...register("minPrice", {
          setValueAs: (v: string) => (v ? parseInt(v) : undefined),
        })}
      />
      <div className="inline-flex min-w-fit items-center border-y border-gray-300 bg-slate-50 px-2">
        <span className="text-sm font-bold text-slate-600">-</span>
      </div>
      <Input
        placeholder="∞"
        className="w-24 rounded-l-none"
        {...register("maxPrice", {
          setValueAs: (v: string) => (v ? parseInt(v) : undefined),
        })}
      />
    </div>
  );
}
