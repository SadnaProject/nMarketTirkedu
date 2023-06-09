import Gallery from "components/gallery";
import RateSlider from "components/slider";
import { type StoreDTO } from "server/domain/Stores/Store";
import Layout from "./_layout";
import Input from "components/input";
import Link from "next/link";
import Card from "components/card";
import { Rating } from "components/star";
import PATHS from "utils/paths";
import Button from "components/button";
import Spinner from "components/spinner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "server/communication/api";
import { toast } from "react-hot-toast";
import { cachedQueryOptions } from "utils/query";

const formSchema = z.object({
  name: z.string(),
  // minStoreRating: z.number().optional(),
  // maxStoreRating: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });
  const { data: stores, refetch } = api.stores.searchStores.useQuery(
    getValues(),
    cachedQueryOptions
  );

  const handleSearch = handleSubmit(
    (data) => {
      void refetch();
    },
    (e) => {
      toast.error(Object.values(e)[0]?.message || "Something went wrong");
    }
  );

  return (
    <Layout>
      <h1>Search Stores</h1>
      <Input
        placeholder="Store name"
        className="w-auto"
        {...register("name")}
      />
      {/* <div className="mb-6 flex items-center gap-4">
        <span>Store Rating</span>
        <RateSlider />
      </div> */}
      <Button onClick={() => void handleSearch()}>
        {isSubmitting && <Spinner />} Search
      </Button>

      {stores &&
        (stores.length > 0 ? (
          <Gallery
            list={stores}
            getId={(store) => store.id}
            getItem={(store) => <StoreCard store={store} />}
            className="grid-cols-1 lg:grid-cols-4"
          />
        ) : (
          <Card className="mt-0 flex h-full w-full max-w-md items-center justify-center">
            No stores found
          </Card>
        ))}
    </Layout>
  );
}

type StoreCardProps = {
  store: StoreDTO;
};

function StoreCard({ store }: StoreCardProps) {
  return (
    <Link href={PATHS.store.path(store.id)}>
      <Card>
        <h3 className="text-lg font-bold text-slate-800">{store.name}</h3>
        <Rating rating={3.25} votes={5} />
      </Card>
    </Link>
  );
}
