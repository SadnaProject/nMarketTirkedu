import { HasControllers } from "../HasController";
import { Mixin } from "ts-mixer";
import { Store } from "./Store";
import {
  StoreProduct,
  type StoreProductDTO,
  type StoreProductArgs,
} from "./StoreProduct";
import { HasRepos, createRepos } from "./HasRepos";
import { type CartDTO } from "../Users/Cart";
import { type BasketDTO } from "../Users/Basket";
import { Testable, testable } from "~/Testable";
import fuzzysearch from "fuzzysearch-ts";

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
   * @param storeId The id of the store that is being checked.
   * @returns True if the store is active, false otherwise.
   */
  isStoreActive(storeId: string): boolean;
  /**
   * This function gets all the products in a store.
   * @param storeId The id of the store that the products are being fetched from.
   * @returns An array of products.
   *@throws Error if the store is not active.
   */
  getStoreProducts(storeId: string): StoreProductDTO[];
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
   * @param productId The id of the product.
   * @returns The price of the product in the store.
   */
  getProductPrice(productId: string): number;
  /**
   * This function checks if a product is in stock.
   * @param productId The id of the product.
   * @param quantity The quantity of the product.
   * @returns True if the product is in stock, false otherwise.
   * @throws Error if the store is not active.
   * @throws Error if the product does not exist.
   */
  isProductQuantityInStock(productId: string, quantity: number): boolean;
  /**
   * This function returns the store id of a product.
   * @param productId The id of the product.
   * @returns The id of the store that the product is in.
   * @throws Error if the product does not exist.
   */
  getStoreIdByProductId(productId: string): string;
  /**
   * This function returns the total price of a cart.
   * @param cartDTO The cart.
   * @returns The total price of the cart.
   * @throws Error if a product does not exist.
   * @throws Error if a product does not belong to the store of its basket.
   */
  getCartPrice(cartDTO: CartDTO): number;
  /**
   * This function returns the total price of a basket.
   * @param basketDTO The basket.
   * @returns The total price of the basket.
   * @throws Error if a product does not exist.
   * @throws Error if a product does not belong to the store of its basket.
   */
  getBasketPrice(basketDTO: BasketDTO): number;
  /**
   * This function returns the products that match the search arguments.
   * @param searchArgs The search arguments.
   */
  searchProducts(searchArgs: SearchArgs): StoreProductDTO[];
  makeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
  makeStoreManager(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
  removeStoreOwner(
    currentId: string,
    storeId: string,
    targetUserId: string
  ): void;
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
  searchProducts(args: SearchArgs): StoreProductDTO[] {
    return StoreProduct.getAll(this.Repos)
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

  isProductQuantityInStock(productId: string, quantity: number): boolean {
    const product = StoreProduct.fromProductId(productId, this.Repos);
    return product.isQuantityInStock(quantity);
  }

  createProduct(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): string {
    const hasPermission = this.Controllers.Jobs.canCreateProductInStore(
      userId,
      storeId
    );
    if (!hasPermission) {
      throw new Error(
        "User does not have permission to create product in store."
      );
    }
    const store = Store.fromStoreId(storeId, this.Repos);
    return store.createProduct(product);
  }

  isStoreActive(storeId: string): boolean {
    return Store.fromStoreId(storeId, this.Repos).IsActive;
  }

  getStoreProducts(storeId: string): StoreProductDTO[] {
    return Store.fromStoreId(storeId, this.Repos).Products;
  }

  setProductQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): void {
    const product = StoreProduct.fromProductId(productId, this.Repos);
    if (
      !this.Controllers.Jobs.canEditProductInStore(userId, product.Store.Id)
    ) {
      throw new Error("User does not have permission to set product quantity.");
    }
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
      throw new Error("User does not have permission to delete product.");
    }
    product.delete();
  }

  setProductPrice(userId: string, productId: string, price: number): void {
    const product = StoreProduct.fromProductId(productId, this.Repos);
    if (
      !this.Controllers.Jobs.canEditProductInStore(userId, product.Store.Id)
    ) {
      throw new Error("User does not have permission to set product price.");
    }
    product.Price = price;
  }

  createStore(founderId: string, storeName: string): string {
    if (!this.Controllers.Auth.isMember(founderId)) {
      throw new Error("User is not a member.");
    }
    const store = new Store(storeName)
      .initRepos(this.Repos)
      .initControllers(this.Controllers);
    this.Controllers.Jobs.InitializeStore(founderId, store.Id);
    // todo needs to check if possible before doing any change
    if (this.Repos.Stores.getAllNames().has(storeName))
      throw new Error("Store name is already taken");
    this.Repos.Stores.addStore(store);
    return store.Id;
  }

  activateStore(userId: string, storeId: string): void {
    if (!this.Controllers.Jobs.canActivateStore(userId, storeId)) {
      throw new Error("User does not have permission to activate store.");
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
  }

  deactivateStore(userId: string, storeId: string): void {
    if (!this.Controllers.Jobs.canDeactivateStore(userId, storeId)) {
      throw new Error("User does not have permission to deactivate store.");
    }
    const store = Store.fromStoreId(storeId, this.Repos);
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
  }

  closeStorePermanently(userId: string, storeId: string): void {
    if (!this.Controllers.Jobs.canCloseStorePermanently(userId, storeId)) {
      throw new Error(
        "User does not have permission to close store permanently."
      );
    }
    Store.fromStoreId(storeId, this.Repos).delete();
  }

  getProductPrice(productId: string): number {
    return StoreProduct.fromProductId(productId, this.Repos).Price;
  }

  getStoreIdByProductId(productId: string): string {
    return StoreProduct.fromProductId(productId, this.Repos).Store.Id;
  }

  getCartPrice(cartDTO: CartDTO): number {
    let price = 0;
    cartDTO.storeIdToBasket.forEach((basket, storeId) => {
      price += this.getBasketPrice(basket);
    });
    return price;
  }

  getBasketPrice(basketDTO: BasketDTO): number {
    const store = Store.fromStoreId(basketDTO.storeId, this.Repos);
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
  }
  removeStoreManager(currentId: string, storeId: string, targetUserId: string) {
    this.Controllers.Jobs.removeStoreManager(currentId, storeId, targetUserId);
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
}
