import {
  createTRPCRouter,
  validSessionProcedure,
} from "server/communication/trpc";
import { service } from "../helpers/_service";
import { z } from "zod";

export const JobsRouter = createTRPCRouter({
  isSystemAdmin: validSessionProcedure.query(({ ctx }) => {
    return service.isSystemAdmin(ctx.session.user.id);
  }),
  getPermissionsOfUser: validSessionProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { userId, storeId } = input;
      return service.getPermissionsOfUser(userId, storeId);
    }),
});
