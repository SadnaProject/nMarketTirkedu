import { forwardRef, type ForwardedRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default forwardRef(function Layout(
  { children, className }: Props,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={twMerge(
        "container mx-auto flex max-w-6xl flex-col items-center gap-4 p-4 pb-12 sm:p-12",
        className
      )}
    >
      {children}
    </div>
  );
});
