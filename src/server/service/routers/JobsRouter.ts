import { z } from "zod";
import { createTRPCRouter, validSessionProcedure } from "server/service/trpc";

import { MarketFacade } from "server/domain/MarketFacade";

const facade = new MarketFacade();
export const JobsRouter = createTRPCRouter({
  isSystemAdmin: validSessionProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      const { userId } = input;
      return facade.isSystemAdmin(userId);
    }),
});
