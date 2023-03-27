import { type User } from "@prisma/client";
import dayjs from "dayjs";
import { appRouter } from "../api/root";

import { prisma } from "../db";

function createTestContext(user: User) {
  return {
    db: prisma,
    prisma,
    session: {
      expires: dayjs().toISOString(),
      user,
    },
  };
}

/** A convenience method to call tRPC queries */
export const trpcRequest = (user?: Partial<User>) => {
  return appRouter.createCaller(createTestContext(user as User));
};
