import { z } from "zod";
import {
  createTRPCRouter,
  validSessionProcedure,
  publicProcedure,
} from "server/service/trpc";
import { observable } from "@trpc/server/observable";
import { facade } from "../_facade";
import { eventEmitter } from "server/EventEmitter";

export const StoresRouter = createTRPCRouter({
  makeStoreOwner: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId, targetUserId } = input;
      return facade.makeStoreOwner(ctx.session.user.id, storeId, targetUserId);
    }),
  makeStoreManager: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId, targetUserId } = input;
      return facade.makeStoreManager(
        ctx.session.user.id,
        storeId,
        targetUserId
      );
    }),
  removeStoreOwner: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId, targetUserId } = input;
      return facade.removeStoreOwner(
        ctx.session.user.id,
        storeId,
        targetUserId
      );
    }),
  removeStoreManager: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
        targetUserId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId, targetUserId } = input;
      return facade.removeStoreManager(
        ctx.session.user.id,
        storeId,
        targetUserId
      );
    }),
  setAddingProductPermission: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
        targetUserId: z.string(),
        permission: z.boolean(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId, targetUserId, permission } = input;
      return facade.setAddingProductToStorePermission(
        ctx.session.user.id,
        storeId,
        targetUserId,
        permission
      );
    }),
  canCreateProductInStore: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return facade.canCreateProductInStore(ctx.session.user.id, storeId);
    }),
  canEditProductInStore: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return facade.canEditProductInStore(ctx.session.user.id, storeId);
    }),
  isStoreOwner: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return facade.isStoreOwner(ctx.session.user.id, storeId);
    }),
  isStoreManager: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return facade.isStoreManager(ctx.session.user.id, storeId);
    }),
  isStoreFounder: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return facade.isStoreFounder(ctx.session.user.id, storeId);
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
  getProductById: validSessionProcedure
    .input(z.object({ productId: z.string() }))
    .query(({ input, ctx }) => {
      const { productId } = input;
      return facade.getProductById(ctx.session.user.id, productId);
    }),

  createProduct: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
        name: z.string(),
        category: z.string(),
        quantity: z.number(),
        price: z.number(),
        description: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId, name, category, quantity, price, description } = input;
      return facade.createProduct(ctx.session.user.id, storeId, {
        name,
        category,
        price,
        quantity,
        description,
      });
    }),
  isStoreActive: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return facade.isStoreActive(ctx.session.user.id, storeId);
    }),
  getStoreProducts: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return facade.getStoreProducts(ctx.session.user.id, storeId);
    }),
  myStores: validSessionProcedure.query(({ ctx }) => {
    return facade.myStores(ctx.session.user.id);
  }),

  setProductQuantity: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { productId, quantity } = input;
      return facade.setProductQuantity(
        ctx.session.user.id,
        productId,
        quantity
      );
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
        productId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { productId } = input;
      return facade.deleteProduct(ctx.session.user.id, productId);
    }),
  setProductPrice: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
        price: z.number(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { productId, price } = input;
      return facade.setProductPrice(ctx.session.user.id, productId, price);
    }),
  createStore: validSessionProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { name } = input;
      return facade.createStore(ctx.session.user.id, name);
    }),
  activateStore: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId } = input;
      return facade.activateStore(ctx.session.user.id, storeId);
    }),
  deactivateStore: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId } = input;
      return facade.deactivateStore(ctx.session.user.id, storeId);
    }),
  closeStorePermanently: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId } = input;
      return facade.closeStorePermanently(ctx.session.user.id, storeId);
    }),
  getProductPrice: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      const { productId } = input;
      return facade.getProductPrice(ctx.session.user.id, productId);
    }),
  isProductQuantityInStock: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number(),
      })
    )
    .query(({ input, ctx }) => {
      const { productId, quantity } = input;
      return facade.isProductQuantityInStock(
        ctx.session.user.id,
        productId,
        quantity
      );
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
  searchStores: validSessionProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      return facade.searchStores(ctx.session.user.id, input.name);
    }),
  getCartPrice: validSessionProcedure.query(({ ctx }) => {
    return facade.getCartPrice(ctx.session.user.id);
  }),
  getBasketPrice: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      return facade.getBasketPrice(ctx.session.user.id, input.storeId);
    }),

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
      console.log("hello", new Date());
      return facade.searchProducts(ctx.session.user.id, input);
    }),
  getPurchaseByStore: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return facade.getPurchasesByStore(ctx.session.user.id, storeId);
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
