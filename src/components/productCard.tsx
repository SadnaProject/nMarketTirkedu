import { type StoreProductDTO } from "server/domain/Stores/StoreProduct";
import Star from "./star";
import { useMemo } from "react";
import Link from "next/link";
import PATHS from "utils/paths";
import Card from "./card";
import Balancer from "react-wrap-balancer";

function AfterDecimal(num: number) {
  return (Math.round(num * 100) / 100).toFixed(2).split(".")[1];
}

type Props = {
  product: StoreProductDTO;
};

export default function ProductCard({ product }: Props) {
  const priceDecimal = useMemo(
    () => AfterDecimal(product.price),
    [product.price]
  );

  return (
    <Link href={`${PATHS.product.path}/${product.id}`}>
      <Card>
        <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
        <span className="font-bold text-gray-700">{product.category}</span>
        <p
          className="mt-2 h-[4.9rem] overflow-hidden text-gray-800"
          style={{
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            display: "-webkit-box",
          }}
        >
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-gray-800">
            <span className="align-text-bottom text-xl">$</span>{" "}
            <span className="text-2xl font-bold">
              {Math.floor(product.price)}
            </span>{" "}
            <span className="align-super text-sm font-bold">
              {priceDecimal === "00" ? "" : priceDecimal}
            </span>
          </div>
          <div className="flex justify-end">
            <span className="me-1">(5)</span>
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} fillAmount={3.24 - i} />
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}
