import { twMerge } from "tailwind-merge";

type Props = {
  price: number;
  className?: string;
  dollarClassName?: string;
  integerClassName?: string;
  decimalClassName?: string;
};

export default function Price({
  price,
  className,
  dollarClassName,
  integerClassName,
  decimalClassName,
}: Props) {
  const priceDecimal = afterDecimal(price);

  return (
    <div className={twMerge("text-slate-800", className)}>
      <span className={twMerge("align-text-bottom text-xl", dollarClassName)}>
        $
      </span>{" "}
      <span className={twMerge("text-2xl font-bold", integerClassName)}>
        {Math.floor(price)}
      </span>{" "}
      <span
        className={twMerge("align-super text-sm font-bold", decimalClassName)}
      >
        {priceDecimal === "00" ? "" : priceDecimal}
      </span>
    </div>
  );
}

export function afterDecimal(num: number) {
  return (Math.round(num * 100) / 100).toFixed(2).split(".")[1];
}
