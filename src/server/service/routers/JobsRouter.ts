import { z } from "zod";
import { createTRPCRouter, validSessionProcedure } from "server/service/trpc";

import { MarketFacade } from "server/domain/MarketFacade";

const facade = new MarketFacade();
export const JobsRouter = createTRPCRouter({
  isSystemAdmin: validSessionProcedure.query(({ ctx }) => {
    return facade.isSystemAdmin(ctx.session.user.id);
  }),
});
