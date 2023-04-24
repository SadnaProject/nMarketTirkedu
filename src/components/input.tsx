import { twMerge } from "tailwind-merge";

type Props = {
  placeholder: string;
  className?: string;
};

export default function Input({ placeholder, className }: Props) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={twMerge(
        "relative -ml-px block w-full border-gray-200 px-4 py-3 text-sm shadow-sm first:rounded-t-lg last:rounded-b-lg focus:z-10 focus:border-blue-500 focus:ring-blue-500 sm:mt-0 sm:first:ml-0 sm:first:rounded-l-lg sm:first:rounded-tr-none sm:last:rounded-r-lg sm:last:rounded-bl-none",
        className
      )}
    />
  );
}
