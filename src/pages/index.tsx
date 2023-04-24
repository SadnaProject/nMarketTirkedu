import Glow from "components/glow";
import Image from "next/image";
import { api } from "utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC", price: 45 });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="text-center text-4xl font-bold text-white">
        N Market. Tirkedu.
      </h1>
      <Glow className="animate-pulse blur-2xl">
        <Glow className="animate-pulse blur-lg">
          <Image
            alt="be calm and keep dancing"
            src="/dance.gif"
            width={400}
            height={100}
            className="rounded-full"
          />
        </Glow>
      </Glow>
      <p className="text-2xl text-white">
        {hello.data ? hello.data.greeting : "Loading tRPC query..."}
      </p>
    </div>
  );
}
