import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  validSessionProcedure,
} from "server/communication/trpc";
import { service } from "../helpers/_service";
import { observable } from "@trpc/server/observable";
import { eventEmitter } from "server/domain/helpers/_EventEmitter";

export const AuthRouter = createTRPCRouter({
  startSession: publicProcedure.mutation(() => {
    return service.startSession();
  }),
  changeEmail: validSessionProcedure
    .input(z.object({ newEmail: z.string() }))
    .mutation(({ input, ctx }) => {
      const { newEmail } = input;
      return service.changeEmail(ctx.session.user.id, newEmail);
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
      return service.changePassword(
        ctx.session.user.id,
        oldPassword,
        newPassword
      );
    }),
  isGuest: validSessionProcedure.query(({ ctx }) => {
    return service.isGuest(ctx.session.user.id);
  }),
  isMember: validSessionProcedure.query(({ ctx }) => {
    return service.isMember(ctx.session.user.id);
  }),
  isConnected: validSessionProcedure.query(({ ctx }) => {
    return service.isConnected(ctx.session.user.id);
  }),
  getAllLoggedInMembersIds: validSessionProcedure.query(({ ctx }) => {
    return service.getAllLoggedInMembersIds(ctx.session.user.id);
  }),
  getAllLoggedOutMembersIds: validSessionProcedure.query(({ ctx }) => {
    return service.getAllLoggedOutMembersIds(ctx.session.user.id);
  }),
  getMemberIdByEmail: validSessionProcedure
    .input(z.object({ email: z.string() }))
    .query(({ input, ctx }) => {
      const { email } = input;
      return service.getMemberIdByEmail(email);
    }),
});
