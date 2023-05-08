import { lorelei } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { forwardRef, useMemo } from "react";
import Button from "./button";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

type Props = {
  id: string;
} & React.ComponentProps<"button">;

export default forwardRef(function Profile(
  { id, ...props }: Props,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const avatar = useMemo(() => {
    return createAvatar(lorelei, {
      seed: id,
      size: 32,
      flip: true,
    }).toDataUriSync();
  }, [id]);

  return (
    <Button
      {...props}
      ref={ref}
      className={twMerge(
        "relative h-[2.375rem] w-[2.375rem] overflow-hidden rounded-full p-0 text-lg",
        props.className
      )}
    >
      <Image fill src={avatar} alt="Avatar" />
    </Button>
  );
});
