import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
} & React.ComponentProps<"button">;

export default forwardRef(function ButtonLight(
  { children, ...props }: Props,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className={twMerge(
        "hs-dropdown-toggle inline-flex items-center justify-center gap-2 rounded-md border bg-white px-4 py-3 align-middle text-sm font-medium text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white hover:bg-slate-50",
        props.className
      )}
    >
      {children}
    </button>
  );
});
