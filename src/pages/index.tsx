import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { data: session } = useSession();

  const { data, refetch: refetchSecret } = api.user.getSecretMessage.useQuery();

  const { data: tweetCount, refetch: refetchTweetCount } =
    api.tweet.count.useQuery();

  const { mutateAsync: createTweet } = api.tweet.create.useMutation();

  const onSubmit = async (data: { email: string; password: string }) => {
    const res = await signIn("credentials", { ...data, redirect: false });
    if (!res?.ok)
      alert(res?.error || "Something went wrong, please try again later");
    await refetchSecret();
  };

  const tweet = async () => {
    await createTweet({ content: "hello world" });
    await refetchTweetCount();
  };

  return (
    <main>
      {session ? (
        <>
          <button
            onClick={() => {
              void signOut();
            }}
          >
            sign out
          </button>
          <br />
          <button
            onClick={() => {
              void tweet();
            }}
          >
            Create Tweet
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            void onSubmit({ email: "a@gmail.com", password: "123123" });
          }}
        >
          login
        </button>
      )}

      <div>{JSON.stringify(session)}</div>
      <div>{data}</div>
      <div>{tweetCount} tweets</div>
    </main>
  );
};

export default Home;
