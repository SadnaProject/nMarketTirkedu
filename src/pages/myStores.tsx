import Gallery from "components/gallery";
import { type StoreDTO } from "server/domain/Stores/Store";
import Layout from "./_layout";
import Link from "next/link";
import Card from "components/card";
import { Rating } from "components/star";
import PATHS, { useGuestRedirect } from "utils/paths";
import { CreateIcon } from "components/icons";
import { api } from "utils/api";

const stores: StoreDTO[] = [
  {
    id: "f0f30ce3-b604-41d7-a3ec-89ed4f92cfb6",
    name: "The Happy Place",
    isActive: true,
  },
  {
    id: "a53b5aab-2bc2-4053-bb13-00ab0beeb7e9",
    name: "The Green Room",
    isActive: true,
  },
  {
    id: "a9f72f7e-8dfe-4ea5-915e-84c570846cff",
    name: "The Blue Door",
    isActive: true,
  },
  {
    id: "dc96a9bd-dd22-4f59-bd17-3096cdbc6073",
    name: "The Red Barn",
    isActive: true,
  },
  {
    id: "e3df71cc-597d-40df-ade6-0e196f68b856",
    name: "The Yellow House",
    isActive: true,
  },
  {
    id: "7a07347f-2fd4-4052-a402-c8acaf213711",
    name: "The Purple Palace",
    isActive: true,
  },
  {
    id: "7a07347f-2fd4-4052-a402-c8acaf213712",
    name: "The Purple Palace",
    isActive: true,
  },
  {
    id: "7a07347f-2fd4-4052-a402-c8acaf213713",
    name: "The Orange Tree",
    isActive: true,
  },
  {
    id: "7a07347f-2fd4-4052-a402-c8acaf213714",
    name: "The Pink Cloud",
    isActive: true,
  },
  {
    id: "7a07347f-2fd4-4052-a402-c8acaf213715",
    name: "The Black Cat",
    isActive: true,
  },
  {
    id: "7a07347f-2fd4-4052-a402-c8acaf213716",
    name: "The White Rabbit",
    isActive: true,
  },
  {
    id: "7a07347f-2fd4-4052-a402-c8acaf213717",
    name: "The Silver Fox",
    isActive: true,
  },
];

export default function Home() {
  useGuestRedirect();

  // const { data: stores, refetch } = api.stores.getstoreby.useQuery(
  //   getValues(),
  //   {
  //     retry: false,
  //     onError,
  //   }
  // );

  return (
    <Layout>
      <h1>My Stores</h1>
      <Gallery
        list={stores ? [{ id: "first" }, ...stores] : [{ id: "first" }]}
        getId={(store) => store.id}
        getItem={(store, index) =>
          index === 0 ? (
            <Link href={PATHS.createStore.path}>
              <Card className="mt-0 flex h-full items-center justify-center">
                <CreateIcon className="h-9 w-9" />
              </Card>
            </Link>
          ) : (
            <StoreCard store={store as StoreDTO} role="Founder" />
          )
        }
        className="grid-cols-1 lg:grid-cols-4"
      />
    </Layout>
  );
}

type StoreCardProps = {
  store: StoreDTO;
  role: string;
};

function StoreCard({ store, role }: StoreCardProps) {
  return (
    <Link href={PATHS.store.path(store.id)}>
      <Card className="mt-0 h-full">
        <h3 className="text-lg font-bold text-slate-800">{store.name}</h3>
        <span className="mb-2 font-bold text-slate-700">{role}</span>
        <Rating rating={3.25} votes={5} />
      </Card>
    </Link>
  );
}
