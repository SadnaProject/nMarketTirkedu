import Link from "next/link";
import { type LinkHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  href: string;
} & LinkHTMLAttributes<HTMLAnchorElement>;

export default function Href({ href, ...props }: Props) {
  return (
    <Link
      {...props}
      href={href}
      className={twMerge(
        "text-blue-600 decoration-2 hover:underline",
        props.className
      )}
    >
      {props.children}
    </Link>
  );
}
