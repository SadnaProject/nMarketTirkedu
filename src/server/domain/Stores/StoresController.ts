import { HasControllers } from "../_HasController";
import { Mixin } from "ts-mixer";
import { Store, type StoreDTO } from "./Store";
import {
  StoreProduct,
  type StoreProductDTO,
  type StoreProductArgs,
} from "./StoreProduct";
import { HasRepos, createRepos } from "./_HasRepos";
import { Testable, testable } from "server/domain/_Testable";
import fuzzysearch from "fuzzysearch-ts";
import { type BasketPurchaseDTO } from "../PurchasesHistory/BasketPurchaseHistory";
import { TRPCError } from "@trpc/server";
import { eventEmitter } from "server/EventEmitter";
import { CartPurchaseDTO } from "../PurchasesHistory/CartPurchaseHistory";
import { type ConditionArgs } from "./Conditions/CompositeLogicalCondition/Condition";
import { type DiscountArgs } from "./DiscountPolicy/Discount";
import { type BasketDTO } from "../Users/Basket";
import { type RoleType } from "../Jobs/Role";
import { storeBidArgs } from "../Users/Bid";

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
  ): string;
  /**
   * This function checks if a store is active.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that is being checked.
   * @returns True if the store is active, false otherwise.
   */
  isStoreActive(userId: string, storeId: string): boolean;
  /**
   * This function gets all the products in a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that the products are being fetched from.
   * @returns An array of products.
   *@throws Error if the store is not active.
   */
  getStoreProducts(userId: string, storeId: string): StoreProductDTO[];
  /**
   * This function sets the quantity of a product in a store.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being updated.
   * @param quantity The new quantity of the product.
   * @throws Error if the store is not active.
   */
  setProductQuantity(userId: string, productId: string, quantity: number): void;
  /**
   * This function decreases the quantity of a product in a store.
   * @param productId The id of the product that is being updated.
   * @param quantity The quantity that is being removed from the product.
   * @throws Error if the store is not active.
   * @throws Error if the quantity is invalid.
   */
  decreaseProductQuantity(productId: string, quantity: number): void;
  /**
   * This function deletes a product from a store.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being removed.
   * @throws Error if the store is not active.
   * @throws Error if user does not have permission to delete product.
   */
  deleteProduct(userId: string, productId: string): void;
  /**
   * This function sets the price of a product in a store.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product that is being updated.
   * @param price The new price of the product.
   * @throws Error if the store is not active.
   * @throws Error if the price is invalid.
   * @throws Error if user does not have permission to update product price.
   */
  setProductPrice(userId: string, productId: string, price: number): void;
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
  createStore(founderId: string, storeName: string): string;
  /**
   * This function activates a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that is being activated.
   * @throws Error if the user does not have permission to activate the store.
   */
  activateStore(userId: string, storeId: string): void;
  /**
   * This function deactivates a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that is being deactivated.
   * @throws Error if the user does not have permission to deactivate the store.
   */
  deactivateStore(userId: string, storeId: string): void;
  /**
   * This function permanently closes a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that is being closed.
   * @throws Error if the user does not have permission to close the store.
   */
  closeStorePermanently(userId: string, storeId: string): void; //! should it be deleted?
  /**
   * This function returns the product's price in a store.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product.
   * @returns The price of the product in the store.
   */
  getProductPrice(userId: string, productId: string): number;
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
  ): boolean;
  /**
   * This function returns the store id of a product.
   * @param userId The id of the user that is currently logged in.
   * @param productId The id of the product.
   * @returns The id of the store that the product is in.
   * @throws Error if the product does not exist.
   */
  getStoreIdByProductId(userId: string, productId: string): string;
  /**
   * This function returns the total price of a cart.
   * @param userId The id of the user that is currently logged in.
   * @returns The total price of the cart.
   * @throws Error if a product does not exist.
   * @throws Error if a product does not belong to the store of its basket.
   */
  getCartPrice(userId: string): number;
  /**
   * This function returns the total price of a basket.
   * @param userId The id of the user that is currently logged in.
   * @param basketDTO The basket.
   * @returns The total price of the basket.
   * @throws Error if a product does not exist.
   * @throws Error if a product does not belong to the store of its basket.
   */
  getBasketPrice(userId: string, storeId: string): number;
  /**
   * This function returns the products that match the search arguments.
   * @param userId The id of the user that is currently logged in.
   * @param searchArgs The search arguments.
   */
  searchProducts(userId: string, searchArgs: SearchArgs): StoreProductDTO[];
  makeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
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
  ): void;
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
  ): void;
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
  ): void;
  setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ): void;
  canCreateProductInStore(currentId: string, storeId: string): boolean;
  isStoreOwner(userId: string, storeId: string): boolean;
  isStoreManager(userId: string, storeId: string): boolean;
  isStoreFounder(userId: string, storeId: string): boolean;
  getStoreFounderId(storeId: string): string;
  getStoreOwnersIds(storeId: string): string[];
  getStoreManagersIds(storeId: string): string[];
  getPurchasesByStoreId(userId: string, storeId: string): BasketPurchaseDTO[];
  searchStores(userId: string, name: string): StoreDTO[];
  addConstraintToStore(
    userId: string,
    storeId: string,
    constraintArgs: ConditionArgs
  ): string;
  removeConstraintFromStore(
    userId: string,
    storeId: string,
    constraintId: string
  ): void;
  addDiscountToStore(
    userId: string,
    storeId: string,
    discountArgs: DiscountArgs
  ): string;
  removeDiscountFromStore(
    userId: string,
    storeId: string,
    discountId: string
  ): void;
  checkIfBasketSatisfiesStoreConstraints(
    userId: string,
    storeId: string,
    basket: BasketDTO
  ): boolean;
  getProductById(userId: string, productId: string): StoreProductDTO;

  myStores(userId: string): { store: StoreDTO; role: RoleType }[];
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
  searchProducts(userId: string, args: SearchArgs): StoreProductDTO[] {
    return StoreProduct.getActive(this.Repos)
      .filter((p) =>
        this.Controllers.Jobs.canReceivePublicDataFromStore(userId, p.Store.Id)
      )
      .filter((p) => {
        const productRating =
          this.Controllers.PurchasesHistory.getReviewsByProduct(p.Id).avgRating;
        const storeRating = this.Controllers.PurchasesHistory.getStoreRating(
          p.Store.Id
        );
        return this.filterProductSearch(p, productRating, storeRating, args);
      })
      .map((p) => p.DTO);
  }

  private filterProductSearch(
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
    return (
      p.Store.IsActive &&
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

  private enforcePublicDataAccess(userId: string, storeId: string) {
    if (!this.Controllers.Jobs.canReceivePublicDataFromStore(userId, storeId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to receive data from store",
      });
    }
  }

  private enforcePrivateDataAccess(userId: string, storeId: string) {
    if (
      !this.Controllers.Jobs.canReceivePrivateDataFromStore(userId, storeId)
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to receive data from store",
      });
    }
  }

  private enforceProductEdit(userId: string, storeId: string) {
    if (!this.Controllers.Jobs.canEditProductInStore(userId, storeId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to edit product",
      });
    }
  }

  isProductQuantityInStock(
    userId: string,
    productId: string,
    quantity: number
  ): boolean {
    const product = StoreProduct.fromProductId(productId, this.Repos);
    this.enforcePublicDataAccess(userId, product.Store.Id);
    return product.isQuantityInStock(quantity);
  }

  createProduct(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): string {
    if (!this.Controllers.Jobs.canCreateProductInStore(userId, storeId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to create product in store",
      });
    }
    const store = Store.fromStoreId(storeId, this.Repos);
    return store.createProduct(product);
  }

  isStoreActive(userId: string, storeId: string): boolean {
    // this.checkDataRetrievalPermission(userId, storeId);
    return Store.fromStoreId(storeId, this.Repos).IsActive;
  }

  getStoreProducts(userId: string, storeId: string): StoreProductDTO[] {
    this.enforcePublicDataAccess(userId, storeId);
    return Store.fromStoreId(storeId, this.Repos).Products;
  }

  private checkDataRetrievalPermission(userId: string, storeId: string) {
    if (
      !this.Controllers.Jobs.canReceivePrivateDataFromStore(userId, storeId)
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to receive data from store",
      });
    }
  }

  setProductQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): void {
    const product = StoreProduct.fromProductId(productId, this.Repos);
    this.enforceProductEdit(userId, product.Store.Id);
    product.Quantity = quantity;
  }

  decreaseProductQuantity(productId: string, quantity: number): void {
    StoreProduct.fromProductId(productId, this.Repos).decreaseQuantity(
      quantity
    );
  }

  deleteProduct(userId: string, productId: string): void {
    const product = StoreProduct.fromProductId(productId, this.Repos);
    if (
      !this.Controllers.Jobs.canRemoveProductFromStore(userId, product.Store.Id)
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to delete product",
      });
    }
    product.delete();
  }

  setProductPrice(userId: string, productId: string, price: number): void {
    const product = StoreProduct.fromProductId(productId, this.Repos);
    this.enforceProductEdit(userId, product.Store.Id);
    product.Price = price;
  }

  createStore(founderId: string, storeName: string): string {
    if (!this.Controllers.Auth.isMember(founderId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is not a member",
      });
    }
    const store = new Store(storeName)
      .initRepos(this.Repos)
      .initControllers(this.Controllers);
    this.Controllers.Jobs.InitializeStore(founderId, store.Id);
    // todo needs to check if possible before doing any change
    if (this.Repos.Stores.getAllNames().has(storeName))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Store name already exists",
      });
    this.Repos.Stores.addStore(store);
    return store.Id;
  }

  activateStore(userId: string, storeId: string): void {
    if (!this.Controllers.Jobs.canActivateStore(userId, storeId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to activate store",
      });
    }
    const store = Store.fromStoreId(storeId, this.Repos);
    store.IsActive = true;
    const notifiedUserIds = [
      store.FounderId,
      ...store.OwnersIds,
      ...store.ManagersIds,
    ];
    notifiedUserIds.forEach((uid) => {
      this.Controllers.Users.addNotification(
        uid,
        "Store activated 💃",
        `Store ${storeId} has been activated`
      );
    });
    eventEmitter.emit(`store is changed ${storeId}`, {
      storeId: storeId,
      userId: userId,
      state: "activated",
    });
  }

  deactivateStore(userId: string, storeId: string): void {
    const store = Store.fromStoreId(storeId, this.Repos);
    if (store.IsActive === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Store is already deactivated",
      });
    }
    if (!this.Controllers.Jobs.canDeactivateStore(userId, storeId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to deactivate store",
      });
    }
    store.IsActive = false;
    const notifiedUserIds = [
      store.FounderId,
      ...store.OwnersIds,
      ...store.ManagersIds,
    ];
    notifiedUserIds.forEach((uid) => {
      this.Controllers.Users.addNotification(
        uid,
        "Store deactivated 💤",
        `Store ${storeId} has been deactivated`
      );
    });
    eventEmitter.emit(`store is changed ${storeId}`, {
      storeId: storeId,
      userId: userId,
      state: "decativated",
    });
  }

  closeStorePermanently(userId: string, storeId: string): void {
    if (!this.Controllers.Jobs.canCloseStorePermanently(userId, storeId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to close store permanently",
      });
    }
    Store.fromStoreId(storeId, this.Repos).delete();
    eventEmitter.emit(`store is changed ${storeId}`, {
      storeId: storeId,
      userId: userId,
      state: "closed",
    });
  }

  getProductPrice(userId: string, productId: string): number {
    this.enforcePublicDataAccess(
      userId,
      this.getStoreIdByProductId(userId, productId)
    );
    const product = StoreProduct.fromProductId(productId, this.Repos);
    return product.Price;
  }

  getStoreIdByProductId(userId: string, productId: string): string {
    const product = StoreProduct.fromProductId(productId, this.Repos);
    this.enforcePublicDataAccess(userId, product.Store.Id);
    return product.Store.Id;
  }

  getCartPrice(userId: string): number {
    const cartDTO = this.Controllers.Users.getCart(userId);
    let price = 0;
    cartDTO.storeIdToBasket.forEach((basket) => {
      price += this.getBasketPrice(userId, basket.storeId);
    });
    return price;
  }

  getBasketPrice(userId: string, storeId: string): number {
    this.enforcePublicDataAccess(userId, storeId);
    const store = Store.fromStoreId(storeId, this.Repos);
    const cartDTO = this.Controllers.Users.getCart(userId);
    const basketDTO = cartDTO.storeIdToBasket.get(storeId);
    if (!basketDTO)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Basket does not exist",
      });
    return store.getBasketPrice(basketDTO);
  }

  makeStoreOwner(currentId: string, storeId: string, targetUserId: string) {
    this.Controllers.Jobs.makeStoreOwner(currentId, storeId, targetUserId);
  }
  makeStoreManager(currentId: string, storeId: string, targetUserId: string) {
    this.Controllers.Jobs.makeStoreManager(currentId, storeId, targetUserId);
  }
  removeStoreOwner(currentId: string, storeId: string, targetUserId: string) {
    this.Controllers.Jobs.removeStoreOwner(currentId, storeId, targetUserId);
    eventEmitter.emit(`member is changed ${targetUserId}`, {
      changerId: currentId,
      changeeId: targetUserId,
      state: "removed as owner",
    });
  }
  removeStoreManager(currentId: string, storeId: string, targetUserId: string) {
    this.Controllers.Jobs.removeStoreManager(currentId, storeId, targetUserId);
    eventEmitter.emit(`member is changed ${targetUserId}`, {
      changerId: currentId,
      changeeId: targetUserId,
      state: "removed as manager",
    });
  }
  setAddingProductToStorePermission(
    currentId: string,
    storeId: string,
    targetUserId: string,
    permission: boolean
  ) {
    this.Controllers.Jobs.setAddingProductToStorePermission(
      currentId,
      storeId,
      targetUserId,
      permission
    );
  }
  canCreateProductInStore(currentId: string, storeId: string) {
    return Store.fromStoreId(storeId, this.Repos).canCreateProduct(currentId);
  }
  isStoreOwner(userId: string, storeId: string) {
    return Store.fromStoreId(storeId, this.Repos).isOwner(userId);
  }
  isStoreManager(userId: string, storeId: string) {
    return Store.fromStoreId(storeId, this.Repos).isManager(userId);
  }
  isStoreFounder(userId: string, storeId: string) {
    return Store.fromStoreId(storeId, this.Repos).isFounder(userId);
  }
  getStoreFounderId(storeId: string) {
    return Store.fromStoreId(storeId, this.Repos).FounderId;
  }
  getStoreOwnersIds(storeId: string) {
    return Store.fromStoreId(storeId, this.Repos).OwnersIds;
  }
  getStoreManagersIds(storeId: string) {
    return Store.fromStoreId(storeId, this.Repos).ManagersIds;
  }
  getPurchasesByStoreId(userId: string, storeId: string) {
    if (
      !this.Controllers.Jobs.canReceivePurchaseHistoryFromStore(userId, storeId)
    )
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "User does not have permission to receive purchase history from store",
      });

    return Store.fromStoreId(storeId, this.Repos).Purchases;
  }
  searchStores(userId: string, name: string): StoreDTO[] {
    if (name === "")
      return this.Repos.Stores.getAllStores()
        .filter((store) =>
          this.Controllers.Jobs.canReceivePublicDataFromStore(userId, store.Id)
        )
        .map((store) => store.DTO);

    return this.Repos.Stores.getAllStores()
      .filter(
        (store) =>
          this.Controllers.Jobs.canReceivePublicDataFromStore(
            userId,
            store.Id
          ) && store.Name === name
      )
      .map((store) => store.DTO);
  }
  addConstraintToStore(
    userId: string,
    storeId: string,
    constraintArgs: ConditionArgs
  ): string {
    if (!this.isStoreOwner(userId, storeId))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to add constraint to store",
      });
    return Store.fromStoreId(storeId, this.Repos).addConstraint(constraintArgs);
  }
  removeConstraintFromStore(
    userId: string,
    storeId: string,
    constraintId: string
  ): void {
    if (!this.isStoreOwner(userId, storeId))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "User does not have permission to remove constraint from store",
      });
    Store.fromStoreId(storeId, this.Repos).removeConstraint(constraintId);
  }
  addDiscountToStore(
    userId: string,
    storeId: string,
    discountArgs: DiscountArgs
  ): string {
    if (!this.isStoreOwner(userId, storeId))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to add discount to store",
      });
    return Store.fromStoreId(storeId, this.Repos).addDiscount(discountArgs);
  }
  removeDiscountFromStore(
    userId: string,
    storeId: string,
    discountId: string
  ): void {
    if (!this.isStoreOwner(userId, storeId))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User does not have permission to remove discount from store",
      });
    Store.fromStoreId(storeId, this.Repos).removeDiscount(discountId);
  }
  checkIfBasketSatisfiesStoreConstraints(
    userId: string,
    storeId: string,
    basket: BasketDTO
  ): boolean {
    return Store.fromStoreId(storeId, this.Repos).checkIfBasketFulfillsPolicy(
      basket
    );
  }
  myStores(userId: string): { store: StoreDTO; role: RoleType }[] {
    const founders = this.Repos.Stores.getAllStores()
      .filter((store) => store.isFounder(userId))
      .map((store) => ({
        store: store.DTO,
        role: "Founder" as RoleType satisfies RoleType,
      }));
    const owners = this.Repos.Stores.getAllStores()
      .filter((store) => store.isOwner(userId))
      .map((store) => ({
        store: store.DTO,
        role: "Owner" as RoleType satisfies RoleType,
      }));
    const managers = this.Repos.Stores.getAllStores()
      .filter((store) => store.isManager(userId))
      .map((store) => ({
        store: store.DTO,
        role: "Manager" as RoleType satisfies RoleType,
      }));
    return founders.concat(owners).concat(managers);
  }
  getProductById(userId: string, productId: string): StoreProductDTO {
    return this.Repos.Products.getProductById(productId).DTO;
  }
}
