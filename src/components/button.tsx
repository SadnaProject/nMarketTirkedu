import { twMerge } from "tailwind-merge";
import { GlowOnHover } from "./glow";
import { forwardRef } from "react";

type Props = {
  children: React.ReactNode;
  glowContainerClassName?: string;
  glowClassName?: string;
} & React.ComponentProps<"button">;

export default forwardRef(function Button(
  { children, glowClassName, glowContainerClassName, ...props }: Props,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <GlowOnHover
      className={glowClassName}
      containerClassName={glowContainerClassName}
    >
      <button
        ref={ref}
        type="button"
        {...props}
        className={twMerge(
          "inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-primary px-4 py-2 text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-500 disabled:opacity-60",
          props.className
        )}
      >
        {children}
      </button>
    </GlowOnHover>
  );
});
