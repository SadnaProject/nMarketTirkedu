import dayjs from "dayjs";
import { db } from "../db";
import { appRouter } from "server/service/root";
import { type User } from "next-auth";

function createTestContext(user: User) {
  return {
    db: db,
    prisma: db,
    session: {
      expires: dayjs().toISOString(),
      user,
    },
  };
}

/**
 * A convenience method to call tRPC queries.
 * @param user - The user to use for the context (can be partial).
 * @returns A tRPC caller.
 */
export const trpcRequest = (user?: Partial<User>) => {
  return appRouter.createCaller(createTestContext(user as User));
};
