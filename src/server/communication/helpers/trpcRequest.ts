import dayjs from "dayjs";
import { appRouter } from "server/communication/root";
import { type User } from "next-auth";
import { dbGlobal } from "server/data/helpers/db";

function createTestContext(user: User) {
  return {
    db: dbGlobal,
    prisma: dbGlobal,
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
