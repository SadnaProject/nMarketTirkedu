import { twMerge } from "tailwind-merge";

type Props = {
  fillAmount: number;
} & React.ComponentProps<"svg">;

const starFillColor = "yellow";

function roundNearestHalf(num: number) {
  return Math.round(num * 2) / 2;
}

export default function Star({ fillAmount, className, ...props }: Props) {
  const roundedFillAmount = roundNearestHalf(fillAmount);

  const fill =
    roundedFillAmount >= 1
      ? starFillColor
      : roundedFillAmount >= 0.5
      ? "url(#halfStar)"
      : "none";

  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill={fill}
      viewBox="0 0 24 24"
      strokeWidth={1}
      stroke="black "
      className={twMerge("mx-[-2px] h-6 w-6", className)}
    >
      <defs>
        <linearGradient id="halfStar">
          <stop style={{ stopColor: starFillColor }} offset="0%" />
          <stop style={{ stopColor: starFillColor }} offset="49.9%" />
          <stop style={{ stopColor: "#ff000000" }} offset="50%" />
        </linearGradient>
      </defs>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

type RatingProps = {
  rating: number;
  votes?: number;
  onClick?: (rating: number) => void;
};

export function Rating({ rating, votes, onClick }: RatingProps) {
  return (
    <div className="flex justify-end">
      {votes && <span className="me-1">({votes})</span>}
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          fillAmount={rating - i}
          onClick={() => onClick && onClick(i + 1)}
          className={onClick && "cursor-pointer"}
        />
      ))}
    </div>
  );
}
