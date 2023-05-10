import { forwardRef, type ForwardedRef } from "react";

type Props = {
  children: React.ReactNode;
};

export default forwardRef(function Layout(
  { children }: Props,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className="container mx-auto flex max-w-6xl flex-col items-center gap-4 p-4 pb-12 sm:p-12"
    >
      {children}
    </div>
  );
});
