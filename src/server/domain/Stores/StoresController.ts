import { HasControllers } from "../helpers/_HasController";
import { Mixin } from "ts-mixer";
import { Store, type StoreDTO } from "./Store";
import {
  StoreProduct,
  type StoreProductDTO,
  type StoreProductArgs,
} from "./StoreProduct";
import { HasRepos, createRepos } from "./helpers/_HasRepos";
import { Testable, testable } from "server/helpers/_Testable";
import fuzzysearch from "fuzzysearch-ts";
import { type BasketPurchaseDTO } from "../PurchasesHistory/BasketPurchaseHistory";
import { TRPCError } from "@trpc/server";
import { eventEmitter } from "server/domain/helpers/_EventEmitter";
import { CartPurchaseDTO } from "../PurchasesHistory/CartPurchaseHistory";
import {
  type ICondition,
  type ConditionArgs,
} from "./Conditions/CompositeLogicalCondition/Condition";
import { type IDiscount, type DiscountArgs } from "./DiscountPolicy/Discount";
import { type BasketDTO } from "../Users/Basket";
import { type RoleType } from "../Jobs/Role";
import { type Bid, storeBidArgs } from "../Users/Bid";
import { type StoreProduct as StoreProductDAO } from "@prisma/client";
import { ConstraintPolicy } from "./PurchasePolicy/ConstraintPolicy";
import { DiscountPolicy } from "./DiscountPolicy/DiscountPolicy";

export type SearchArgs = {
  name?: string;
  category?: string;
  keywords?: string[];
  minPrice?: number;
  maxPrice?: number;
  minProductRating?: number;
  maxProductRating?: number;
  minStoreRating?: number;
  maxStoreRating?: number;
};
export type ProductWithQuantityDTO = {
  product: StoreProductDTO;
  BasketQuantity: number;
  Discount: number;
};
export type FullBasketDTO = {
  storeId: string;
  products: ProductWithQuantityDTO[];
};
export interface IStoresController extends HasRepos {
  /**
   * This function creates a product to a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that the product is being added to.
   * @param product The product that is being added to the store.
   * @returns The id of the product that was added to the store.
   */
  createProduct(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): Promise<string>;
  /**
   * This function checks if a store is active.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that is being checked.
   * @returns True if the store is active, false otherwise.
   */
  isStoreActive(userId: string, storeId: string): Promise<boolean>;
  /**
   * This function gets all the products in a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that the products are being fetched from.
   * @returns An array of products.
   *@throws Error if the store is not active.
   */
  getStoreProducts(userId: string, storeId: string): Promise<StoreProductDTO[]>;
  /**
   * This function sets the quantity of a product in a store.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being updated.
   * @param quantity The new quantity of the product.
   * @throws Error if the store is not active.
   */
  setProductQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void>;
  /**
   * This function decreases the quantity of a product in a store.
   * @param productId The id of the product that is being updated.
   * @param quantity The quantity that is being removed from the product.
   * @throws Error if the store is not active.
   * @throws Error if the quantity is invalid.
   */
  decreaseProductQuantity(productId: string, quantity: number): Promise<void>;
  /**
   * This function deletes a product from a store.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being removed.
   * @throws Error if the store is not active.
   * @throws Error if user does not have permission to delete product.
   */
  deleteProduct(userId: string, productId: string): Promise<void>;
  /**
   * This function sets the price of a product in a store.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being updated.
   * @param price The new price of the product.
   * @throws Error if the store is not active.
   * @throws Error if the price is invalid.
   * @throws Error if user does not have permission to update product price.
   */
  setProductPrice(
    userId: string,
    productId: string,
    price: number
  ): Promise<void>;
  //! There will be addDiscountCondition for each condition type
  /**
   * This function adds a discount to a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that the discount is being added to.
   * @param discount The discount that is being added to the store.
   * @returns The id of the discount that was added to the store.
   * @throws Error if the store is not active.
   * @throws Error if the discount amount is invalid.
   * @throws Error if the discount type is invalid.
   * @throws Error if the expiration date is invalid.
   * @throws Error if user does not have permission to add discount.
   */

  //! Functions related to purchase policy and discount conditions will be determined later
  /**
   * This function creates a new store.
   * @param founderId The id of the user that is currently logged in.
   * @param storeName The name of the store.
   * @returns The id of the store that was added to the system.
   * @throws Error if the store name is invalid.
   * @throws Error if the store name is already taken.
   */
  createStore(founderId: string, storeName: string): Promise<string>;
  /**
   * This function activates a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that is being activated.
   * @throws Error if the user does not have permission to activate the store.
   */
  activateStore(userId: string, storeId: string): Promise<void>;
  /**
   * This function deactivates a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that is being deactivated.
   * @throws Error if the user does not have permission to deactivate the store.
   */
  deactivateStore(userId: string, storeId: string): Promise<void>;
  /**
   * This function permanently closes a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that is being closed.
   * @throws Error if the user does not have permission to close the store.
   */
  closeStorePermanently(userId: string, storeId: string): Promise<void>; //! should it be deleted?
  /**
   * This function returns the product's price in a store.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product.
   * @returns The price of the product in the store.
   */
  getProductPrice(userId: string, productId: string): Promise<number>;
  /**
   * This function checks if a product is in stock.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product.
   * @param quantity The quantity of the product.
   * @returns True if the product is in stock, false otherwise.
   * @throws Error if the store is not active.
   * @throws Error if the product does not exist.
   */
  isProductQuantityInStock(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<boolean>;
  /**
   * This function returns the store id of a product.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product.
   * @returns The id of the store that the product is in.
   * @throws Error if the product does not exist.
   */
  getStoreIdByProductId(userId: string, productId: string): Promise<string>;
  /**
   * This function returns the total price of a cart.
   * @param userId The id of the user that is currently logged in.
   * @returns The total price of the cart.
   * @throws Error if a product does not exist.
   * @throws Error if a product does not belong to the store of its basket.
   */
  getCartPrice(userId: string): Promise<number>;
  /**
   * This function returns the total price of a basket.
   * @param userId The id of the user that is currently logged in.
   * @param basketDTO The basket.
   * @returns The total price of the basket.
   * @throws Error if a product does not exist.
   * @throws Error if a product does not belong to the store of its basket.
   */
  getBasketPrice(userId: string, storeId: string): Promise<number>;
  /**
   * This function returns the products that match the search arguments.
   * @param userId The id of the user that is currently logged in.
   * @param searchArgs The search arguments.
   */
  searchProducts(
    userId: string,
    searchArgs: SearchArgs
  ): Promise<StoreProductDTO[]>;
  makeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void>;
  /**
   * This function makes a user a store manager.
   * @param currentId The id of the user that is currently logged in.
   * @param storeId The id of the store that the user is being made a manager of.
   * @param targetUserId The id of the user that is being made a manager.
   * @throws Error if the user is already a manager of the store.
   */
  makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void>;
  /**
   * This function removes a user from being a store owner.
   * @param currentId The id of the user that is currently logged in.
   * @param storeId The id of the store that the user is being removed from.
   * @param targetUserId The id of the user that is being removed.
   * @throws Error if the user is not an owner of the store.
   * @throws Error if the user is the only owner of the store.
   * @throws Error if the user is the founder of the store.
   */
  removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void>;
  /**
   * This function removes a user from being a store manager.
   * @param currentId The id of the user that is currently logged in.
   * @param storeId The id of the store that the user is being removed from.
   * @param targetUserId The id of the user that is being removed.
   * @throws Error if the user is not a manager of the store.
   * @throws Error if the user is the only manager of the store.
   * @throws Error if the user is the founder of the store.
   * @throws Error if the current user is can't remove the target user.
   */
  removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): Promise<void>;
  setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): Promise<void>;
  canCreateProductInStore(currentId: string, storeId: string): Promise<boolean>;
  isStoreOwner(userId: string, storeId: string): Promise<boolean>;
  isStoreManager(userId: string, storeId: string): Promise<boolean>;
  isStoreFounder(userId: string, storeId: string): Promise<boolean>;
  getStoreFounderId(storeId: string): Promise<string>;
  getStoreOwnersIds(storeId: string): Promise<string[]>;
  getStoreManagersIds(storeId: string): Promise<string[]>;
  getPurchasesByStoreId(
    userId: string,
    storeId: string
  ): Promise<BasketPurchaseDTO[]>;
  searchStores(userId: string, name: string): Promise<StoreDTO[]>;
  addConstraintToStore(
    userId: string,
    storeId: string,
    constraintArgs: ConditionArgs
  ): Promise<string>;
  removeConstraintFromStore(
    userId: string,
    storeId: string,
    constraintId: string
  ): Promise<void>;
  addDiscountToStore(
    userId: string,
    storeId: string,
    discountArgs: DiscountArgs
  ): Promise<string>;
  removeDiscountFromStore(
    userId: string,
    storeId: string,
    discountId: string
  ): Promise<void>;
  checkIfBasketSatisfiesStoreConstraints(
    userId: string,
    storeId: string,
    basket: BasketDTO
  ): Promise<boolean>;
  getProductById(userId: string, productId: string): Promise<StoreProductDTO>;

  myStores(userId: string): Promise<{ store: StoreDTO; role: RoleType }[]>;
  addSpecialPriceToProduct(bid: Bid): Promise<void>;
  getDiscountPolicy(
    userId: string,
    storeId: string
  ): Promise<Map<string, IDiscount>>;
  getConstraintPolicy(
    userId: string,
    storeId: string
  ): Promise<Map<string, ICondition>>;
  getStoreNameById(userId: string, storeId: string): Promise<string>;
}

@testable
export class StoresController
  extends Mixin(Testable, HasControllers, HasRepos)
  implements IStoresController
{
  constructor() {
    super();
    this.initRepos(createRepos());
  }
  async searchProducts(
    userId: string,
    args: SearchArgs
  ): Promise<StoreProductDTO[]> {
    const pro = await StoreProduct.getActive(this.Repos);
    const fun = async (p: StoreProductDAO) => {
      const store = await StoreProduct.fromDAO(
        p,
        await this.Repos.Products.getSpecialPrices(p.id)
      )
        .initRepos(this.Repos)
        .initControllers(this.Controllers)
        .getStore();
      const productRating = (
        await this.Controllers.PurchasesHistory.getReviewsByProduct(p.id)
      ).avgRating;
      const storeRating =
        await this.Controllers.PurchasesHistory.getStoreRating(store.Id);
      const first_bool = await this.filterProductSearch(
        StoreProduct.fromDAO(
          p,
          await this.Repos.Products.getSpecialPrices(p.id)
        )
          .initRepos(this.Repos)
          .initControllers(this.Controllers),
        productRating,
        storeRating,
        args
      );
      const other_Bool =
        await this.Controllers.Jobs.canReceivePublicDataFromStore(
          userId,
          store.Id
        );
      return { productData: p, bool: other_Bool && first_bool };
    };
    const products = (await Promise.all(pro.map(fun)))
      .filter((x) => x.bool)
      .map((x) => x.productData);

    const productsDTO: StoreProductDTO[] = [];
    for (const product of products) {
      productsDTO.push(
        await StoreProduct.fromDAO(
          product,
          await this.Repos.Products.getSpecialPrices(product.id)
        )
          .initControllers(this.Controllers)
          .initRepos(this.Repos)
          .getDTO()
      );
    }
    return productsDTO;
  }

  private async filterProductSearch(
    p: StoreProduct,
    productRating: number,
    storeRating: number,
    {
      name,
      category,
      keywords = [],
      minPrice = 0,
      maxPrice = Infinity,
      minProductRating = 0,
      maxProductRating = Infinity,
      minStoreRating = 0,
      maxStoreRating = Infinity,
    }: SearchArgs
  ) {
    const store = await p.getStore();
    return (
      store.IsActive() &&
      this.search(name, p.Name) &&
      this.search(category, p.Category) &&
      keywords.every(
        (k) =>
          this.search(k, p.Name) ||
          this.search(k, p.Category) ||
          this.search(k, p.Description)
      ) &&
      p.Price >= minPrice &&
      p.Price <= maxPrice &&
      productRating >= minProductRating &&
      productRating <= maxProductRating &&
      storeRating >= minStoreRating &&
      storeRating <= maxStoreRating
    );
  }

  private search(shortStr: string | undefined, longStr: string) {
    return shortStr
      ? fuzzysearch(shortStr.toLowerCase(), longStr.toLowerCase())
      : true;
  }

  private async enforcePublicDataAccess(userId: string, storeId: string) {
    if (
      !(await this.Controllers.Jobs.canReceivePublicDataFromStore(
        userId,
        storeId
      ))
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to receive data from store",
      });
    }
  }

  private async enforcePrivateDataAccess(userId: string, storeId: string) {
    if (
      !(await this.Controllers.Jobs.canReceivePrivateDataFromStore(
        userId,
        storeId
      ))
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to receive data from store",
      });
    }
  }

  private async enforceProductEdit(userId: string, storeId: string) {
    if (!(await this.Controllers.Jobs.canEditProductInStore(userId, storeId))) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to edit product",
      });
    }
  }

  async isProductQuantityInStock(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<boolean> {
    const product = await StoreProduct.fromProductId(
      productId,
      this.Repos,
      this.Controllers
    );
    const store = await product.getStore();
    await this.enforcePublicDataAccess(userId, store.Id);
    return product.isQuantityInStock(quantity);
  }

  async createProduct(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): Promise<string> {
    if (
      !(await this.Controllers.Jobs.canCreateProductInStore(userId, storeId))
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to create product in store",
      });
    }
    const store = await Store.fromStoreId(
      storeId,
      this.Repos,
      this.Controllers
    );
    return store.createProduct(product);
  }

  async isStoreActive(userId: string, storeId: string): Promise<boolean> {
    // this.checkDataRetrievalPermission(userId, storeId);
    const store = await Store.fromStoreId(
      storeId,
      this.Repos,
      this.Controllers
    );
    return store.IsActive();
  }

  async getStoreProducts(
    userId: string,
    storeId: string
  ): Promise<StoreProductDTO[]> {
    await this.enforcePublicDataAccess(userId, storeId);
    const store = await Store.fromStoreId(
      storeId,
      this.Repos,
      this.Controllers
    );
    return await store.getProducts();
  }

  private async checkDataRetrievalPermission(userId: string, storeId: string) {
    if (
      !(await this.Controllers.Jobs.canReceivePrivateDataFromStore(
        userId,
        storeId
      ))
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to receive data from store",
      });
    }
  }

  async setProductQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    const product = await StoreProduct.fromProductId(
      productId,
      this.Repos,
      this.Controllers
    );
    const store = await product.getStore();
    await this.enforceProductEdit(userId, store.Id);
    await product.setQuantity(quantity);
  }

  async decreaseProductQuantity(
    productId: string,
    quantity: number
  ): Promise<void> {
    await (
      await StoreProduct.fromProductId(productId, this.Repos, this.Controllers)
    ).decreaseQuantity(quantity);
  }

  async deleteProduct(userId: string, productId: string): Promise<void> {
    const product = await StoreProduct.fromProductId(
      productId,
      this.Repos,
      this.Controllers
    );
    const store = await product.getStore();
    if (
      !(await this.Controllers.Jobs.canRemoveProductFromStore(userId, store.Id))
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to delete product",
      });
    }
    await product.delete();
  }

  async setProductPrice(
    userId: string,
    productId: string,
    price: number
  ): Promise<void> {
    const product = await StoreProduct.fromProductId(
      productId,
      this.Repos,
      this.Controllers
    );
    await this.enforceProductEdit(userId, (await product.getStore()).Id);
    await product.setPrice(price);
  }

  async createStore(founderId: string, storeName: string): Promise<string> {
    if (!(await this.Controllers.Auth.isMember(founderId))) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is not a member",
      });
    }
    const store = new Store(storeName)
      .initRepos(this.Repos)
      .initControllers(this.Controllers);
    // todo needs to check if possible before doing any change
    if ((await this.Repos.Stores.getAllNames()).has(storeName))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Store name already exists",
      });

    await this.Repos.Stores.addStore(store.Name, store.Id);
    await this.Controllers.Jobs.InitializeStore(founderId, store.Id);
    // TODO needs to create here event for the store
    return store.Id;
  }

  async activateStore(userId: string, storeId: string): Promise<void> {
    if (!(await this.Controllers.Jobs.canActivateStore(userId, storeId))) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to activate store",
      });
    }
    const store = await Store.fromStoreId(
      storeId,
      this.Repos,
      this.Controllers
    );
    await store.setActive(true);
    const ownerIds = await store.OwnersIds;
    const managerIds = await store.ManagersIds;
    const founderId = await store.FounderId;
    const notifiedUserIds = [founderId, ...ownerIds, ...managerIds];
    for (const uid of notifiedUserIds) {
      await this.Controllers.Users.addNotification(
        uid,
        "Store activated 💃",
        `Store ${storeId} has been activated`
      );
    }
    // eventEmitter.emitEvent(`store is changed ${storeId}`, {
    //   storeId: storeId,
    //   userId: userId,
    //   state: "activated",
    // });
  }

  async deactivateStore(userId: string, storeId: string): Promise<void> {
    const store = await Store.fromStoreId(
      storeId,
      this.Repos,
      this.Controllers
    );
    if (store.IsActive() === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Store is already deactivated",
      });
    }
    if (!(await this.Controllers.Jobs.canDeactivateStore(userId, storeId))) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to deactivate store",
      });
    }
    await store.setActive(false);
    const ownerIds = await store.OwnersIds;
    const managerIds = await store.ManagersIds;
    const founderId = await store.FounderId;
    const notifiedUserIds = [founderId, ...ownerIds, ...managerIds];
    for (const uid of notifiedUserIds) {
      await this.Controllers.Users.addNotification(
        uid,
        "Store deactivated 💤",
        `Store ${storeId} has been deactivated`
      );
    }
    // eventEmitter.emit(`store is changed ${storeId}`, {
    //   storeId: storeId,
    //   userId: userId,
    //   state: "decativated",
    // });
  }

  async closeStorePermanently(userId: string, storeId: string): Promise<void> {
    if (
      !(await this.Controllers.Jobs.canCloseStorePermanently(userId, storeId))
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to close store permanently",
      });
    }
    await (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).delete();
    // eventEmitter.emit(`store is changed ${storeId}`, {
    //   storeId: storeId,
    //   userId: userId,
    //   state: "closed",
    // });
  }

  async getProductPrice(userId: string, productId: string): Promise<number> {
    await this.enforcePublicDataAccess(
      userId,
      await this.getStoreIdByProductId(userId, productId)
    );
    const product = await StoreProduct.fromProductId(
      productId,
      this.Repos,
      this.Controllers
    );
    return product.getPriceForUser(userId);
  }

  async getStoreIdByProductId(
    userId: string,
    productId: string
  ): Promise<string> {
    const product = await StoreProduct.fromProductId(
      productId,
      this.Repos,
      this.Controllers
    );
    await this.enforcePublicDataAccess(userId, (await product.getStore()).Id);
    return (await product.getStore()).Id;
  }

  async getCartPrice(userId: string): Promise<number> {
    const cartDTO = await this.Controllers.Users.getCart(userId);
    let price = 0;
    for (const storeId of cartDTO.storeIdToBasket.keys()) {
      price += await this.getBasketPrice(userId, storeId);
    }
    return price;
  }

  async getBasketPrice(userId: string, storeId: string): Promise<number> {
    await this.enforcePublicDataAccess(userId, storeId);
    const store = await Store.fromStoreId(
      storeId,
      this.Repos,
      this.Controllers
    );
    const cartDTO = await this.Controllers.Users.getCart(userId);
    const basketDTO = cartDTO.storeIdToBasket.get(storeId);
    if (!basketDTO)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Basket does not exist",
      });
    return store.getBasketPrice(userId, basketDTO);
  }

  async makeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ) {
    await this.Controllers.Jobs.makeStoreOwner(
      currentId,
      storeId,
      targetUserId
    );
    // eventEmitter.emit(`receive bid for store ${storeId}`, {
    //   storeId: storeId,
    //   userId: targetUserId,
    // });
  }
  async makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ) {
    await this.Controllers.Jobs.makeStoreManager(
      currentId,
      storeId,
      targetUserId
    );
  }
  async removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ) {
    await this.Controllers.Jobs.removeStoreOwner(
      currentId,
      storeId,
      targetUserId
    );
    // eventEmitter.emit(`member is changed ${targetUserId}`, {
    //   changerId: currentId,
    //   changeeId: targetUserId,
    //   state: "removed as owner",
    // });
  }
  async removeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ) {
    await this.Controllers.Jobs.removeStoreManager(
      currentId,
      storeId,
      targetUserId
    );
    // eventEmitter.emit(`member is changed ${targetUserId}`, {
    //   changerId: currentId,
    //   changeeId: targetUserId,
    //   state: "removed as manager",
    // });
  }
  async setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ) {
    await this.Controllers.Jobs.setAddingProductToStorePermission(
      currentId,
      storeId,
      targetUserId,
      permission
    );
  }
  async canCreateProductInStore(currentId: string, storeId: string) {
    return (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).canCreateProduct(currentId);
  }
  async isStoreOwner(userId: string, storeId: string) {
    return (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).isOwner(userId);
  }
  async isStoreManager(userId: string, storeId: string) {
    return (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).isManager(userId);
  }
  async isStoreFounder(userId: string, storeId: string) {
    return (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).isFounder(userId);
  }
  async getStoreFounderId(storeId: string) {
    return (await Store.fromStoreId(storeId, this.Repos, this.Controllers))
      .FounderId;
  }
  async getStoreOwnersIds(storeId: string) {
    return (await Store.fromStoreId(storeId, this.Repos, this.Controllers))
      .OwnersIds;
  }
  async getStoreManagersIds(storeId: string) {
    return (await Store.fromStoreId(storeId, this.Repos, this.Controllers))
      .ManagersIds;
  }
  async getPurchasesByStoreId(userId: string, storeId: string) {
    if (
      !(await this.Controllers.Jobs.canReceivePurchaseHistoryFromStore(
        userId,
        storeId
      ))
    )
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "User does not have permission to receive purchase history from store",
      });

    return (await Store.fromStoreId(storeId, this.Repos, this.Controllers))
      .Purchases;
  }
  async searchStores(userId: string, name: string): Promise<StoreDTO[]> {
    const stores = (await this.Repos.Stores.getAllStores()).filter(
      async (store) =>
        (await this.Controllers.Jobs.canReceivePublicDataFromStore(
          userId,
          store.id
        )) &&
        (name === "" || store.name === name)
    );
    const storesDTO: StoreDTO[] = [];
    for (const store of stores) {
      storesDTO.push(
        await Store.fromDAO(
          store,
          await this.Repos.Stores.getDiscounts(store.id),
          await this.Repos.Stores.getConstraints(store.id)
        )
          .initControllers(this.Controllers)
          .initRepos(this.Repos)
          .getDTO()
      );
    }
    return storesDTO;
  }
  async addConstraintToStore(
    userId: string,
    storeId: string,
    constraintArgs: ConditionArgs
  ): Promise<string> {
    if (!(await this.isStoreOwner(userId, storeId)))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to add constraint to store",
      });
    return (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).addConstraint(constraintArgs);
  }
  async removeConstraintFromStore(
    userId: string,
    storeId: string,
    constraintId: string
  ): Promise<void> {
    if (!(await this.isStoreOwner(userId, storeId)))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "User does not have permission to remove constraint from store",
      });
    await (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).removeConstraint(constraintId);
  }
  async addDiscountToStore(
    userId: string,
    storeId: string,
    discountArgs: DiscountArgs
  ): Promise<string> {
    if (!(await this.isStoreOwner(userId, storeId)))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to add discount to store",
      });
    return (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).addDiscount(discountArgs);
  }
  async removeDiscountFromStore(
    userId: string,
    storeId: string,
    discountId: string
  ): Promise<void> {
    if (!(await this.isStoreOwner(userId, storeId)))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to remove discount from store",
      });
    await (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).removeDiscount(discountId);
  }
  async checkIfBasketSatisfiesStoreConstraints(
    userId: string,
    storeId: string,
    basket: BasketDTO
  ): Promise<boolean> {
    return (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).checkIfBasketFulfillsPolicy(basket);
  }
  async myStores(
    userId: string
  ): Promise<{ store: StoreDTO; role: RoleType }[]> {
    const stores = await this.Repos.Stores.getAllStores();
    const realStores: Store[] = [];
    for (const store of stores) {
      realStores.push(
        Store.fromDAO(
          store,
          await this.Repos.Stores.getDiscounts(store.id),
          await this.Repos.Stores.getConstraints(store.id)
        )
          .initControllers(this.Controllers)
          .initRepos(this.Repos)
      );
    }
    const myStores: { store: StoreDTO; role: RoleType }[] = [];
    const founders = [];
    for (const store of realStores) {
      if (await store.isFounder(userId)) {
        founders.push(store);
      }
    }
    for (const store of founders) {
      const storeDTO = await store.getDTO();
      myStores.push({
        store: storeDTO,
        role: "Founder",
      });
    }
    const owners = [];
    for (const store of realStores) {
      if (await store.isOwner(userId)) {
        owners.push(store);
      }
    }
    for (const store of owners) {
      const storeDTO = await store.getDTO();
      if (myStores.find((store) => store.store.id === storeDTO.id)) continue; // if already added as founder
      myStores.push({
        store: storeDTO,
        role: "Owner",
      });
    }
    const managers = [];
    for (const store of realStores) {
      if (await store.isManager(userId)) {
        managers.push(store);
      }
    }
    for (const store of managers) {
      const storeDTO = await store.getDTO();
      if (myStores.find((store) => store.store.id === storeDTO.id)) continue; // if already added as founder
      myStores.push({
        store: storeDTO,
        role: "Manager",
      });
    }
    return myStores;
  }
  async getProductById(
    userId: string,
    productId: string
  ): Promise<StoreProductDTO> {
    return StoreProduct.fromDAO(
      await this.Repos.Products.getProductById(productId),
      await this.Repos.Products.getSpecialPrices(productId)
    )
      .initControllers(this.Controllers)
      .initRepos(this.Repos)
      .getDTO();
  }
  async addSpecialPriceToProduct(bid: Bid): Promise<void> {
    const product = StoreProduct.fromDAO(
      await this.Repos.Products.getProductById(bid.ProductId),
      await this.Repos.Products.getSpecialPrices(bid.ProductId)
    );
    product.initControllers(this.Controllers).initRepos(this.Repos);
    await product.addSpecialPrice(bid.UserId, bid.Price);
  }
  async getConstraintPolicy(
    userId: string,
    storeId: string
  ): Promise<Map<string, ICondition>> {
    return (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).ConstraintPolicy.getConstraints();
  }
  async getDiscountPolicy(
    userId: string,
    storeId: string
  ): Promise<Map<string, IDiscount>> {
    return (
      await Store.fromStoreId(storeId, this.Repos, this.Controllers)
    ).DiscountPolicy.getDiscounts();
  }
  async getStoreNameById(userId: string, storeId: string): Promise<string> {
    return (await Store.fromStoreId(storeId, this.Repos, this.Controllers))
      .Name;
  }
  async subscribeToStoreEvents(userId: string): Promise<void> {
    const myStores = await this.myStores(userId);
    for (const store of myStores) {
      eventEmitter.subscribeChannel(`storeChanged_${store.store.id}`, userId);
    }
  }
}
