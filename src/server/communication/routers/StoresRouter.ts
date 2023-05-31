import { z } from "zod";
import {
  createTRPCRouter,
  validSessionProcedure,
  publicProcedure,
} from "server/communication/trpc";
import { observable } from "@trpc/server/observable";
import { service } from "../helpers/_service";
import { eventEmitter } from "server/domain/helpers/_EventEmitter";

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
      return service.makeStoreOwner(ctx.session.user.id, storeId, targetUserId);
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
      return service.makeStoreManager(
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
      return service.removeStoreOwner(
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
      return service.removeStoreManager(
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
      return service.setAddingProductToStorePermission(
        ctx.session.user.id,
        storeId,
        targetUserId,
        permission
      );
    }),
  setEditingProductInStorePermission: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
        targetUserId: z.string(),
        permission: z.boolean(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId, targetUserId, permission } = input;
      return service.setEditingProductInStorePermission(
        ctx.session.user.id,
        storeId,
        targetUserId,
        permission
      );
    }),
  setModifyingPurchasePolicyPermission: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
        targetUserId: z.string(),
        permission: z.boolean(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId, targetUserId, permission } = input;
      return service.setModifyingPurchasePolicyPermission(
        ctx.session.user.id,
        storeId,
        targetUserId,
        permission
      );
    }),
  setRemovingProductFromStorePermission: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
        targetUserId: z.string(),
        permission: z.boolean(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId, targetUserId, permission } = input;
      return service.setRemovingProductFromStorePermission(
        ctx.session.user.id,
        storeId,
        targetUserId,
        permission
      );
    }),
  setReceivingPrivateStoreDataPermission: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
        targetUserId: z.string(),
        permission: z.boolean(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId, targetUserId, permission } = input;
      return service.setReceivingPrivateStoreDataPermission(
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
      return service.canCreateProductInStore(ctx.session.user.id, storeId);
    }),
  canEditProductInStore: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return service.canEditProductInStore(ctx.session.user.id, storeId);
    }),
  isStoreOwner: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return service.isStoreOwner(ctx.session.user.id, storeId);
    }),
  isStoreManager: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return service.isStoreManager(ctx.session.user.id, storeId);
    }),
  isStoreFounder: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return service.isStoreFounder(ctx.session.user.id, storeId);
    }),
  getStoreFounder: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return service.getStoreFounder(storeId);
    }),
  getStoreOwners: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return service.getStoreOwners(storeId);
    }),
  getStoreManagers: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return service.getStoreManagers(storeId);
    }),
  getProductById: validSessionProcedure
    .input(z.object({ productId: z.string() }))
    .query(({ input, ctx }) => {
      const { productId } = input;
      return service.getProductById(ctx.session.user.id, productId);
    }),
  // getStoreDiscounts: validSessionProcedure
  // .input(z.object({ storeId: z.string() }))
  // .query(({ input,ctx }) => {
  //   const { storeId } = input;
  //   return service.getStoreDiscounts(ctx.session.user.id,storeId);
  // }),
  // getStoreConstraints: validSessionProcedure
  // .input(z.object({ storeId: z.string() }))
  // .query(({ input,ctx }) => {
  //   const { storeId } = input;
  //   return service.getStoreConstraints(ctx.session.user.id,storeId);
  // }),
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
      return service.createProduct(ctx.session.user.id, storeId, {
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
      return service.isStoreActive(ctx.session.user.id, storeId);
    }),
  getStoreProducts: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return service.getStoreProducts(ctx.session.user.id, storeId);
    }),
  myStores: validSessionProcedure.query(({ ctx }) => {
    return service.myStores(ctx.session.user.id);
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
      return service.setProductQuantity(
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
      return service.decreaseProductQuantity(productId, quantity);
    }),
  deleteProduct: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { productId } = input;
      return service.deleteProduct(ctx.session.user.id, productId);
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
      return service.setProductPrice(ctx.session.user.id, productId, price);
    }),
  createStore: validSessionProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { name } = input;
      return service.createStore(ctx.session.user.id, name);
    }),
  activateStore: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId } = input;
      return service.activateStore(ctx.session.user.id, storeId);
    }),
  deactivateStore: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId } = input;
      return service.deactivateStore(ctx.session.user.id, storeId);
    }),
  closeStorePermanently: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const { storeId } = input;
      return service.closeStorePermanently(ctx.session.user.id, storeId);
    }),
  getProductPrice: validSessionProcedure
    .input(
      z.object({
        productId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      const { productId } = input;
      return service.getProductPrice(ctx.session.user.id, productId);
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
      return service.isProductQuantityInStock(
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
      return service.getStoreIdByProductId(
        ctx.session.user.id,
        input.productId
      );
    }),
  searchStores: validSessionProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      return service.searchStores(ctx.session.user.id, input.name);
    }),
  getCartPrice: validSessionProcedure.query(({ ctx }) => {
    return service.getCartPrice(ctx.session.user.id);
  }),
  getBasketPrice: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      return service.getBasketPrice(ctx.session.user.id, input.storeId);
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
      return service.searchProducts(ctx.session.user.id, input);
    }),
  getPurchaseByStore: validSessionProcedure
    .input(
      z.object({
        storeId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      const { storeId } = input;
      return service.getPurchasesByStore(ctx.session.user.id, storeId);
    }),

  changeStoreState: publicProcedure
    .input(z.object({ storeId: z.string() }))
    .subscription(({ input }) => {
      return observable<string>((emit) => {
        const changeStoreState = (msg: string) => {
          emit.next(msg);
        };
        // eventEmitter.on(`store is changed ${input.storeId}`, changeStoreState);//TODO FIX
        return () => {
          // eventEmitter.off(
          //   `store is changed ${input.storeId}`,
          //   changeStoreState
          // );//TODO FIX
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
        // eventEmitter.on(
        //   `member is changed ${input.memberId}`,
        //   changeMemberState
        // );//TODO FIX
        return () => {
          // eventEmitter.off(
          //   `member is changed ${input.memberId}`,
          //   changeMemberState
          // ); //TODO FIX
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
        // eventEmitter.on(`purchase store ${input.storeId}`, onStorePurchase); //TODO FIX
        // when the observable is unsubscribed, we remove the listener
        return () => {
          // eventEmitter.off(`purchase store ${input.storeId}`, onStorePurchase);//TODO FIX
        };
        // in the purchase function, we will call eventEmitter.emit(`purchase store ${storeId}`, purchaseId)
        // (I need to add dependency injection for eventEmitter through HasEventEmitter class)
      });
    }),
  getJobsHierarchyOfStore: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      return service.getJobsHierarchyOfStore(
        ctx.session.user.id,
        input.storeId
      );
    }),
  getStoreDiscounts: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      return service.getStoreDiscounts(ctx.session.user.id, input.storeId);
    }),
  getStoreConstraints: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      return service.getStoreConstraints(ctx.session.user.id, input.storeId);
    }),
  getStoreNameById: validSessionProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input, ctx }) => {
      return service.getStoreNameById(ctx.session.user.id, input.storeId);
    }),
});
