import Glow from "components/glow";
import Image from "next/image";
import Layout from "./_layout";
import Button from "components/button";
import Link from "next/link";
import PATHS from "utils/paths";

export default function Home() {
  return (
    <Layout>
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h1 className="text-center text-4xl text-primary">
          N Market. Tirkedu.
        </h1>
        <p className="text-center text-2xl text-slate-900">
          We&apos;re not just an online store, we&apos;re your new addiction
        </p>
        <Link href={PATHS.products.path}>
          <Button>Go Shopping!</Button>
        </Link>
        <br />
        <Glow className="animate-pulse blur-2xl">
          <Glow className="animate-pulse blur-lg">
            <Image
              alt="be calm and keep dancing"
              src="/dance.gif"
              width={400}
              height={0}
              className="rounded-full"
              priority
            />
          </Glow>
        </Glow>
      </div>
    </Layout>
  );
}
