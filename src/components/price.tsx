type Props = {
  price: number;
};

export default function Price({ price }: Props) {
  const priceDecimal = afterDecimal(price);

  return (
    <div className="text-slate-800">
      <span className="align-text-bottom text-xl">$</span>{" "}
      <span className="text-2xl font-bold">{Math.floor(price)}</span>{" "}
      <span className="align-super text-sm font-bold">
        {priceDecimal === "00" ? "" : priceDecimal}
      </span>
    </div>
  );
}

export function afterDecimal(num: number) {
  return (Math.round(num * 100) / 100).toFixed(2).split(".")[1];
}
