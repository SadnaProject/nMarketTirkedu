import { createTRPCRouter } from "~/server/api/trpc";
import { tweetRouter } from "~/server/api/routers/tweets";
import { userRouter } from "~/server/api/routers/users";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  tweet: tweetRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
