import { createTRPCRouter, validSessionProcedure } from "server/service/trpc";
import { facade } from "../_facade";

export const JobsRouter = createTRPCRouter({
  isSystemAdmin: validSessionProcedure.query(({ ctx }) => {
    return facade.isSystemAdmin(ctx.session.user.id);
  }),
});
