import { createTRPCRouter, validSessionProcedure } from "server/service/trpc";
import { service } from "../_service";

export const JobsRouter = createTRPCRouter({
  isSystemAdmin: validSessionProcedure.query(({ ctx }) => {
    return service.isSystemAdmin(ctx.session.user.id);
  }),
});
