import { type StoreProductDTO } from "server/domain/Stores/StoreProduct";
import Price from "./price";
import { Rating } from "./star";
import Card from "./card";

type ProductCardProps = {
  product: StoreProductDTO;
  nameClassName?: string;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="mt-0">
      <h3 className="text-lg font-bold">{product.name}</h3>
      <span className="font-bold text-slate-700">{product.category}</span>
      <p
        className="mt-2 h-[4.9rem] overflow-hidden"
        style={{
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          display: "-webkit-box",
        }}
      >
        {product.description}
      </p>
      <div className="flex flex-col items-center justify-between md:flex-row">
        <Price price={product.price} />
        <Rating rating={3.24} votes={5} />
      </div>
    </Card>
  );
}
