import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  children: React.ReactNode;
  containerClassName?: string;

  className?: string;
};

export default function Glow({
  children,
  containerClassName,
  className,
}: Props) {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (glowRef.current) {
      const elements = glowRef.current.getElementsByTagName("*");
      for (let i = 0; i < elements.length; i++) {
        elements[i]?.setAttribute("tabindex", "-1");
      }
    }
  });

  return (
    <div className={twMerge("relative z-0 flex", containerClassName)}>
      <div className={twMerge("peer relative", containerClassName)}>
        {children}
      </div>
      <div
        ref={glowRef}
        className={twMerge("absolute -z-10 transition-all", className)}
      >
        {children}
      </div>
    </div>
  );
}

export function GlowOnHover({ children, className, ...props }: Props) {
  return (
    <Glow
      {...props}
      className={twMerge(
        "invisible peer-hover:visible peer-hover:blur-sm",
        className
      )}
    >
      {children}
    </Glow>
  );
}
