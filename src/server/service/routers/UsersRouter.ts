import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  validSessionProcedure,
} from "server/service/trpc";
import { facade } from "../_facade";

export const UsersRouter = createTRPCRouter({
  addProductToCart: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
        amount: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { productId, amount } = input;
      return facade.addProductToCart(ctx.session.user.id, productId, amount);
    }),
  removeProductFromCart: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { productId } = input;
      return facade.removeProductFromCart(ctx.session.user.id, productId);
    }),
  editProductQuantityInCart: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
        amount: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { productId, amount } = input;
      return facade.editProductQuantityInCart(
        ctx.session.user.id,
        productId,
        amount
      );
    }),
  getCart: validSessionProcedure.query(({ ctx }) => {
    return facade.getCart(ctx.session.user.id);
  }),
  getNotifications: validSessionProcedure.query(({ ctx }) => {
    return facade.getNotifications(ctx.session.user.id);
  }),
  purchaseCart: validSessionProcedure
    .input(
      z.object({
        number: z.string(), // refers to credit card number ATM
      })
    )
    .mutation(({ input, ctx }) => {
      const { number } = input;
      return facade.purchaseCart(ctx.session.user.id, { number });
    }),

  removeUser: validSessionProcedure.mutation(({ ctx }) => {
    return facade.removeUser(ctx.session.user.id);
  }),
  readNotification: validSessionProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { notificationId } = input;
      return facade.readNotification(ctx.session.user.id, notificationId);
    }),
  addNotification: validSessionProcedure
    .input(
      z.object({
        notificationType: z.string(),
        notification: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { notificationType, notification } = input;
      return facade.addNotification(
        ctx.session.user.id,
        notificationType,
        notification
      );
    }),
  getUnreadNotifications: validSessionProcedure.query(({ ctx }) => {
    return facade.getUnreadNotifications(ctx.session.user.id);
  }),
  registerMember: validSessionProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { email, password } = input;
      return facade.registerMember(ctx.session.user.id, email, password);
    }),
  loginMember: validSessionProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { email, password } = input;
      return facade.loginMember(ctx.session.user.id, email, password);
    }),
  logoutMember: validSessionProcedure.mutation(({ ctx }) => {
    return facade.logoutMember(ctx.session.user.id);
  }),
  disconnectUser: validSessionProcedure.mutation(({ ctx }) => {
    return facade.disconnectUser(ctx.session.user.id);
  }),
  removeMember: validSessionProcedure
    .input(z.object({ memberIdToRemove: z.string() }))
    .mutation(({ input, ctx }) => {
      const { memberIdToRemove } = input;
      return facade.removeMember(ctx.session.user.id, memberIdToRemove);
    }),
});
