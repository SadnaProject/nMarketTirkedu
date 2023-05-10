import { twMerge } from "tailwind-merge";

type Props = {
  className?: string;
};

export default function Spinner({ className }: Props) {
  return (
    <div
      className={twMerge(
        "inline-block h-4 w-4 animate-spin rounded-full border-[3px] border-current border-t-transparent text-white",
        className
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
