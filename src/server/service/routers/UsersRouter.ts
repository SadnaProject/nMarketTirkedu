import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authedProcedure,
} from "server/service/trpc";

import { MarketFacade } from "server/domain/MarketFacade";
import { censored } from "server/domain/_Loggable";

const facade = new MarketFacade();

export const UsersRouter = createTRPCRouter({
  addProductToCart: authedProcedure
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
  removeProductFromCart: authedProcedure
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
  editProductQuantityInCart: authedProcedure
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
  getCart: authedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ input }) => {
      const { userId } = input;
      return facade.getCart(userId);
    }),
  getNotifications: authedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ input }) => {
      const { userId } = input;
      return facade.getNotifications(userId);
    }),
  purchaseCart: authedProcedure
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
  removeUser: authedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId } = input;
      return facade.removeUser(userId);
    }),
  readNotification: authedProcedure
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
  addNotification: authedProcedure
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
  getUnreadNotifications: authedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ input }) => {
      const { userId } = input;
      return facade.getUnreadNotifications(userId);
    }),
  registerMember: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { name, email, password } = input;
      return facade.registerMember(name, email, password);
    }),
  loginMember: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, email, password } = input;
      return facade.loginMember(userId, email, password);
    }),
  logoutMember: authedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId } = input;
      return facade.logoutMember(userId);
    }),
  disconnectUser: authedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId } = input;
      return facade.disconnectUser(userId);
    }),
});
