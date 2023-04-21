import { api } from "@/utils/api";
import Link from "next/link";
import { useState } from "react";

export default function AboutPage() {
  const [num, setNumber] = useState<number>();
  api.example.randomNumber.useSubscription(undefined, {
    onData(n) {
      setNumber(n);
    },
  });

  return (
    <div>
      Here&apos;s a random number from a sub: {num} <br />
      <Link href="/">Index</Link>
    </div>
  );
}
