import Star from "./star";
import Link from "next/link";
import PATHS from "utils/paths";
import Card from "./card";
import { type StoreDTO } from "server/domain/Stores/Store";

type Props = {
  store: StoreDTO;
};

export default function StoreCard({ store }: Props) {
  return (
    <Link href={`${PATHS.store.path}/${store.id}`}>
      <Card>
        <h3 className="text-lg font-bold text-gray-800">{store.name}</h3>
        <div className="flex justify-end">
          <span className="me-1">(5)</span>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} fillAmount={3.25 - i} />
          ))}
        </div>
      </Card>
    </Link>
  );
}
