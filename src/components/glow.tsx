import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Glow({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const elements = ref.current.getElementsByTagName("*");
      for (let i = 0; i < elements.length; i++) {
        elements[i]?.setAttribute("tabindex", "-1");
      }
    }
  });

  return (
    <div className="flex">
      <div className="peer relative z-10">{children}</div>
      <div ref={ref} className={twMerge("absolute transition-all", className)}>
        {children}
      </div>
    </div>
  );
}
