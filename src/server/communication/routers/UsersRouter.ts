import { z } from "zod";
import {
  createTRPCRouter,
  loggedInProcedure,
  publicProcedure,
  validSessionProcedure,
} from "server/communication/trpc";
import { service } from "../helpers/_service";
import { observable } from "@trpc/server/observable";
import { eventEmitter } from "server/domain/helpers/_EventEmitter";
import { type Event } from "server/domain/helpers/_Events";
import { BidArgs } from "server/domain/Users/Bid";
import { TRPCError } from "@trpc/server";

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
    return service.getCartUI(ctx.session.user.id);
  }),
  getNotifications: validSessionProcedure.query(({ ctx }) => {
    return service.getNotifications(ctx.session.user.id);
  }),
  purchaseCart: validSessionProcedure
    .input(
      z.object({
        payment: z.object({
          creditCardNumber: z.string(),
          ccv: z.string(),
          holder: z.string(),
          id: z.string(),
          month: z.string(),
          year: z.string(),
        }),
        deliveryDetails: z.object({
          address: z.string(),
          city: z.string(),
          country: z.string(),
          name: z.string(),
          zip: z.string(),
        }),
        // refers to credit card number ATM
      })
    )
    .mutation(({ input, ctx }) => {
      return service.purchaseCart(
        ctx.session.user.id,
        {
          number: input.payment.creditCardNumber,
          ccv: input.payment.ccv,
          holder: input.payment.holder,
          id: input.payment.id,
          month: input.payment.month,
          year: input.payment.year,
        },
        {
          address: input.deliveryDetails.address,
          city: input.deliveryDetails.city,
          country: input.deliveryDetails.country,
          name: input.deliveryDetails.name,
          zip: input.deliveryDetails.zip,
        }
      );
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
        isOnline: z.boolean(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { notificationType, notification, isOnline } = input;
      return service.addNotification(
        ctx.session.user.id,
        notificationType,
        notification,
        isOnline
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
    return observable<Event>((emit) => {
      eventEmitter.subscribeUser(ctx.session.user.id, (event) => {
        emit.next(event);
      });
      void service.subscribeToStoreEvents(ctx.session.user.id);
      return () => {
        eventEmitter.unsubscribeUser(ctx.session.user.id);
      };
    });
  }),
  addBid: validSessionProcedure
    .input(
      z.object({
        price: z.number().nonnegative(),
        productId: z.string().uuid(),
        type: z.literal("Store"),
      })
    )
    .mutation(({ input, ctx }) => {
      const { productId, price, type } = input;
      return service.addBid({
        userId: ctx.session.user.id,
        productId,
        price,
        type,
      });
    }),
  getBidsToMe: validSessionProcedure.query(({ ctx }) => {
    return service.getBidsToMe(ctx.session.user.id);
  }),
  getBidsFromMe: validSessionProcedure.query(({ ctx }) => {
    return service.getBidsFromMe(ctx.session.user.id);
  }),
  approveBid: validSessionProcedure

    .input(
      z.object({
        bidId: z.string().uuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { bidId } = input;
      return service.approveBid(ctx.session.user.id, bidId);
    }),
  rejectBid: validSessionProcedure
    .input(
      z.object({
        bidId: z.string().uuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { bidId } = input;
      return service.rejectBid(ctx.session.user.id, bidId);
    }),
  counterBid: validSessionProcedure
    .input(
      z.object({
        bidId: z.string().uuid(),
        price: z.number().nonnegative(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { bidId, price } = input;
      return service.counterBid(ctx.session.user.id, bidId, price);
    }),
  getMakeOwnerRequests: validSessionProcedure.query(({ ctx }) => {
    return service.getMakeOwnerRequests(ctx.session.user.id);
  }),
  approveMakeOwnerRequest: validSessionProcedure
    .input(
      z.object({
        makeOwnerRequestId: z.string().uuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { makeOwnerRequestId } = input;
      return service.approveStoreOwner(makeOwnerRequestId, ctx.session.user.id);
    }),
  rejectMakeOwnerRequest: validSessionProcedure
    .input(
      z.object({
        makeOwnerRequestId: z.string().uuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { makeOwnerRequestId } = input;
      return service.rejectStoreOwner(makeOwnerRequestId, ctx.session.user.id);
    }),
});
