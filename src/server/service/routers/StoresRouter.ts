import { z } from "zod";
import {
  createTRPCRouter,
  validSessionProcedure,
  publicProcedure,
} from "server/service/trpc";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { facade } from "../_facade";

const eventEmitter = new EventEmitter();
export const StoresRouter = createTRPCRouter({
  makeStoreOwner: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        storeId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, storeId, targetUserId } = input;
      return facade.makeStoreOwner(userId, storeId, targetUserId);
    }),
  makeStoreManager: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        storeId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, storeId, targetUserId } = input;
      return facade.makeStoreManager(userId, storeId, targetUserId);
    }),
  removeStoreOwner: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        storeId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, storeId, targetUserId } = input;
      return facade.removeStoreOwner(userId, storeId, targetUserId);
    }),
  removeStoreManager: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        storeId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, storeId, targetUserId } = input;
      return facade.removeStoreManager(userId, storeId, targetUserId);
    }),
  setAddingProductPermission: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        storeId: z.string(),
        targetUserId: z.string(),
        permission: z.boolean(),
      })
    )
    .mutation(({ input }) => {
      const { userId, storeId, targetUserId, permission } = input;
      return facade.setAddingProductToStorePermission(
        userId,
        storeId,
        targetUserId,
        permission
      );
    }),
  canCreateProductInStore: validSessionProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.canCreateProductInStore(userId, storeId);
    }),
  isStoreOwner: validSessionProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.isStoreOwner(userId, storeId);
    }),
  isStoreManager: validSessionProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.isStoreManager(userId, storeId);
    }),
  isStoreFounder: validSessionProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.isStoreFounder(userId, storeId);
    }),
  getStoreFounder: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return facade.getStoreFounder(storeId);
    }),
  getStoreOwners: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return facade.getStoreOwners(storeId);
    }),
  getStoreManagers: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return facade.getStoreManagers(storeId);
    }),
  createProduct: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        storeId: z.string(),
        name: z.string(),
        category: z.string(),
        quantity: z.number(),
        price: z.number(),
        description: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, storeId, name, category, quantity, price, description } =
        input;
      return facade.createProduct(userId, storeId, {
        name,
        category,
        price,
        quantity,
        description,
      });
    }),
  isStoreActive: validSessionProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.isStoreActive(userId, storeId);
    }),
  getStoreProducts: validSessionProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.getStoreProducts(userId, storeId);
    }),
  setProductQuantity: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
        quantity: z.number(),
      })
    )
    .mutation(({ input }) => {
      const { userId, productId, quantity } = input;
      return facade.setProductQuantity(userId, productId, quantity);
    }),
  decreaseProductQuantity: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number(),
      })
    )
    .mutation(({ input }) => {
      const { productId, quantity } = input;
      return facade.decreaseProductQuantity(productId, quantity);
    }),
  deleteProduct: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, productId } = input;
      return facade.deleteProduct(userId, productId);
    }),
  setProductPrice: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
        price: z.number(),
      })
    )
    .mutation(({ input }) => {
      const { userId, productId, price } = input;
      return facade.setProductPrice(userId, productId, price);
    }),
  createStore: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, name } = input;
      return facade.createStore(userId, name);
    }),
  activateStore: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        storeId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, storeId } = input;
      return facade.activateStore(userId, storeId);
    }),
  deactivateStore: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        storeId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, storeId } = input;
      return facade.deactivateStore(userId, storeId);
    }),
  closeStorePermanently: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        storeId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const { userId, storeId } = input;
      return facade.closeStorePermanently(userId, storeId);
    }),
  getProductPrice: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
      })
    )
    .query(({ input }) => {
      const { userId, productId } = input;
      return facade.getProductPrice(userId, productId);
    }),
  isProductQuantityInStock: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
        quantity: z.number(),
      })
    )
    .query(({ input }) => {
      const { userId, productId, quantity } = input;
      return facade.isProductQuantityInStock(userId, productId, quantity);
    }),
  getStoreIdByProductId: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      return facade.getStoreIdByProductId(ctx.session.user.id, input.productId);
    }),
  // TODO: getCartPrice, getBasketPrice
  searchProducts: validSessionProcedure
    .input(
      z.object({
        name: z.string().optional(),
        category: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minProductRating: z.number().optional(),
        maxProductRating: z.number().optional(),
        minStoreRating: z.number().optional(),
        maxStoreRating: z.number().optional(),
      })
    )
    .query(({ input, ctx }) => {
      return facade.searchProducts(ctx.session.user.id, input);
    }),
  getPurchaseByStore: validSessionProcedure
    .input(
      z.object({
        userId: z.string(),
        storeId: z.string(),
      })
    )
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.getPurchasesByStore(userId, storeId);
    }),

  changeStoreState: publicProcedure
    .input(z.object({ storeId: z.string() }))
    .subscription(({ input }) => {
      return observable<string>((emit) => {
        const changeStoreState = (msg: string) => {
          emit.next(msg);
        };
        eventEmitter.on(`store is changed ${input.storeId}`, changeStoreState);
        return () => {
          eventEmitter.off(
            `store is changed ${input.storeId}`,
            changeStoreState
          );
        };
      });
    }),

  changeMemberState: publicProcedure
    .input(z.object({ memberId: z.string() }))
    .subscription(({ input }) => {
      return observable<string>((emit) => {
        const changeMemberState = (msg: string) => {
          emit.next(msg);
        };
        eventEmitter.on(
          `member is changed ${input.memberId}`,
          changeMemberState
        );
        return () => {
          eventEmitter.off(
            `member is changed ${input.memberId}`,
            changeMemberState
          );
        };
      });
    }),

  onStorePurchase: publicProcedure
    .input(z.object({ storeId: z.string() }))
    // the function gets store id as input
    .subscription(({ input }) => {
      // we return an observable that emits a string on every purchase
      return observable<string>((emit) => {
        // the following function will be called on every purchase in the store
        const onStorePurchase = (msg: string) => {
          emit.next(msg);
        };
        // we listen to the event emitter for the store id
        eventEmitter.on(`purchase store ${input.storeId}`, onStorePurchase);
        // when the observable is unsubscribed, we remove the listener
        return () => {
          eventEmitter.off(`purchase store ${input.storeId}`, onStorePurchase);
        };
        // in the purchase function, we will call eventEmitter.emit(`purchase store ${storeId}`, purchaseId)
        // (I need to add dependency injection for eventEmitter through HasEventEmitter class)
      });
    }),
});
