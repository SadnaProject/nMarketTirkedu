import { z } from "zod";
import { createTRPCRouter, authedProcedure } from "server/service/trpc";

import { MarketFacade } from "server/domain/MarketFacade";

const facade = new MarketFacade();
export const StoresRouter = createTRPCRouter({
  makeStoreOwner: authedProcedure
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
  makeStoreManager: authedProcedure
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
  removeStoreOwner: authedProcedure
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
  removeStoreManager: authedProcedure
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
  setAddingProductPermission: authedProcedure
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
  canCreateProductInStore: authedProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.canCreateProductInStore(userId, storeId);
    }),
  isStoreOwner: authedProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.isStoreOwner(userId, storeId);
    }),
  isStoreManager: authedProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.isStoreManager(userId, storeId);
    }),
  isStoreFounder: authedProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.isStoreFounder(userId, storeId);
    }),
  getStoreFounder: authedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return facade.getStoreFounder(storeId);
    }),
  getStoreOwners: authedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return facade.getStoreOwners(storeId);
    }),
  getStoreManagers: authedProcedure
    .input(z.object({ storeId: z.string() }))
    .query(({ input }) => {
      const { storeId } = input;
      return facade.getStoreManagers(storeId);
    }),
  createProduct: authedProcedure
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
  isStoreActive: authedProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.isStoreActive(userId, storeId);
    }),
  getStoreProducts: authedProcedure
    .input(z.object({ userId: z.string(), storeId: z.string() }))
    .query(({ input }) => {
      const { userId, storeId } = input;
      return facade.getStoreProducts(userId, storeId);
    }),
  setProductQuantity: authedProcedure
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
  decreaseProductQuantity: authedProcedure
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
  deleteProduct: authedProcedure
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
  setProductPrice: authedProcedure
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
  createStore: authedProcedure
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
  activateStore: authedProcedure
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
  deactivateStore: authedProcedure
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
  closeStorePermanently: authedProcedure
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
  getProductPrice: authedProcedure
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
  isProductQuantityInStock: authedProcedure
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
  getStoreIdByProductId: authedProcedure
    .input(
      z.object({
        userId: z.string(),
        productId: z.string(),
      })
    )
    .query(({ input }) => {
      const { userId, productId } = input;
      return facade.getStoreIdByProductId(userId, productId);
    }),
  // TODO: getCartPrice, getBasketPrice
  searchProducts: authedProcedure
    .input(
      z.object({
        userId: z.string(),
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
    .query(({ input }) => {
      const {
        userId,
        name,
        category,
        keywords,
        minPrice,
        maxPrice,
        minProductRating,
        maxProductRating,
        minStoreRating,
        maxStoreRating,
      } = input;
      return facade.searchProducts(userId, {
        name,
        category,
        keywords,
        minPrice,
        maxPrice,
        minProductRating,
        maxProductRating,
        minStoreRating,
        maxStoreRating,
      });
    }),
  getPurchaseByStore: authedProcedure
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
});
