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
        userId: z.string(),
        productId: z.string(),
        amount: z.number(),
      })
    )
    .mutation(({ input }) => {
      const { userId, productId, amount } = input;
      return facade.addProductToCart(userId, productId, amount);
    }),
  removeProductFromCart: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, productId } = input;
      return facade.removeProductFromCart(userId, productId);
    }),
  editProductQuantityInCart: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
        amount: z.number(),
      })
    )
    .mutation(({ input }) => {
      const { userId, productId, amount } = input;
      return facade.editProductQuantityInCart(userId, productId, amount);
    }),
  getCart: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ input }) => {
      const { userId } = input;
      return facade.getCart(userId);
    }),
  getNotifications: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ input }) => {
      const { userId } = input;
      return facade.getNotifications(userId);
    }),
  purchaseCart: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        number: z.string(), // refers to credit card number ATM
      })
    )
    .mutation(({ input }) => {
      const { userId, number } = input;
      return facade.purchaseCart(userId, { number });
    }),

  removeUser: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId } = input;
      return facade.removeUser(userId);
    }),
  readNotification: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        notificationId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, notificationId } = input;
      return facade.readNotification(userId, notificationId);
    }),
  addNotification: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        notificationType: z.string(),
        notification: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, notificationType, notification } = input;
      return facade.addNotification(userId, notificationType, notification);
    }),
  getUnreadNotifications: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ input }) => {
      const { userId } = input;
      return facade.getUnreadNotifications(userId);
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
  logoutMember: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId } = input;
      return facade.logoutMember(userId);
    }),
  disconnectUser: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId } = input;
      return facade.disconnectUser(userId);
    }),
  removeMember: validSessionProcedure
    .input(
      z.object({ userIdOfActor: z.string(), memberIdToRemove: z.string() })
    )
    .mutation(({ input }) => {
      const { userIdOfActor, memberIdToRemove } = input;
      return facade.removeMember(userIdOfActor, memberIdToRemove);
    }),
});
