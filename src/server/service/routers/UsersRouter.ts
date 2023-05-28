import { z } from "zod";
import {
  createTRPCRouter,
  loggedInProcedure,
  publicProcedure,
  validSessionProcedure,
} from "server/service/trpc";
import { service } from "../_service";
import { observable } from "@trpc/server/observable";
import { eventEmitter } from "server/EventEmitter";

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
      return service.addProductToCart(ctx.session.user.id, productId, amount);
    }),
  removeProductFromCart: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { productId } = input;
      return service.removeProductFromCart(ctx.session.user.id, productId);
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
      return service.editProductQuantityInCart(
        ctx.session.user.id,
        productId,
        amount
      );
    }),
  getCart: validSessionProcedure.query(({ ctx }) => {
    return service.getCart(ctx.session.user.id);
  }),
  getNotifications: validSessionProcedure.query(({ ctx }) => {
    return service.getNotifications(ctx.session.user.id);
  }),
  purchaseCart: validSessionProcedure
    .input(
      z.object({
        creditCardNumber: z.string(), // refers to credit card number ATM
      })
    )
    .mutation(({ input, ctx }) => {
      return service.purchaseCart(ctx.session.user.id, {
        number: input.creditCardNumber,
      });
    }),

  removeUser: validSessionProcedure.mutation(({ ctx }) => {
    return service.removeUser(ctx.session.user.id);
  }),
  readNotification: validSessionProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { notificationId } = input;
      return service.readNotification(ctx.session.user.id, notificationId);
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
      return service.addNotification(
        ctx.session.user.id,
        notificationType,
        notification
      );
    }),
  getUnreadNotifications: validSessionProcedure.query(({ ctx }) => {
    return service.getUnreadNotifications(ctx.session.user.id);
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
      return service.registerMember(ctx.session.user.id, email, password);
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
      return service.loginMember(ctx.session.user.id, email, password);
    }),
  logoutMember: validSessionProcedure.mutation(({ ctx }) => {
    return service.logoutMember(ctx.session.user.id);
  }),
  onLoginEvent: loggedInProcedure.subscription(({ ctx }) => {
    return observable<void>((emit) => {
      console.log("login of user", ctx.session.user.id);
      service.reConnectMember(ctx.session.user.id).catch((err) => {
        console.log("reconnect failed", err);
      });

      return () => {
        console.log("logout of user", ctx.session.user.id);
        service.logoutMember(ctx.session.user.id).catch((err) => {
          console.log("logout failed", err);
        });
      };
    });
  }),

  // onAddNotificationEvent: publicProcedure.subscription(() => {
  //   return observable<string>((emit) => {
  //     const onAddNotificationEvent = (message: string) => {
  //       emit.next(message);
  //     };
  //     eventEmitter.on(`addNotificationEvent`, onAddNotificationEvent);
  //     return () => {
  //       eventEmitter.off(`addNotificationEvent`, onAddNotificationEvent);
  //     };
  //   });
  // }),
  disconnectUser: validSessionProcedure.mutation(({ ctx }) => {
    return service.disconnectUser(ctx.session.user.id);
  }),
  removeMember: validSessionProcedure
    .input(z.object({ memberIdToRemove: z.string() }))
    .mutation(({ input, ctx }) => {
      const { memberIdToRemove } = input;
      return service.removeMember(ctx.session.user.id, memberIdToRemove);
    }),

  subscribeToEvents: loggedInProcedure.subscription(({ ctx }) => {
    return observable<unknown>((emit) => {
      eventEmitter.subscribeToEmitter(ctx.session.user.id, (msg) => {
        emit.next(msg);
      });
      return () => {
        eventEmitter.unsubscribeFromEmitter(ctx.session.user.id);
      };
    });
  }),
});
