import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  validSessionProcedure,
} from "server/service/trpc";
import { facade } from "../_facade";

export const AuthRouter = createTRPCRouter({
  startSession: publicProcedure.mutation(() => {
    return facade.startSession();
  }),
  changeEmail: validSessionProcedure
    .input(z.object({ newEmail: z.string() }))
    .mutation(({ input, ctx }) => {
      const { newEmail } = input;
      return facade.changeEmail(ctx.session.user.id, newEmail);
    }),
  changePassword: validSessionProcedure
    .input(
      z.object({
        oldPassword: z.string(),
        newPassword: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { oldPassword, newPassword } = input;
      return facade.changePassword(
        ctx.session.user.id,
        oldPassword,
        newPassword
      );
    }),
  isGuest: validSessionProcedure.query(({ ctx }) => {
    return facade.isGuest(ctx.session.user.id);
  }),
  isMember: validSessionProcedure.query(({ ctx }) => {
    return facade.isMember(ctx.session.user.id);
  }),
  isConnected: validSessionProcedure.query(({ ctx }) => {
    return facade.isConnected(ctx.session.user.id);
  }),
  getAllLoggedInMembersIds: validSessionProcedure.query(({ ctx }) => {
    return facade.getAllLoggedInMembersIds(ctx.session.user.id);
  }),
  getAllLoggedOutMembersIds: validSessionProcedure.query(({ ctx }) => {
    return facade.getAllLoggedOutMembersIds(ctx.session.user.id);
  }),
});
