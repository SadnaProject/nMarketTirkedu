import { type ForwardedRef, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
} & React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export default forwardRef(function Card(
  { children, ...props }: Props,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      {...props}
      ref={ref}
      className={twMerge(
        "mt-7 flex flex-col rounded-xl bg-white p-4 shadow-2xl md:p-7",
        props.className
      )}
    >
      {children}
    </div>
  );
});
