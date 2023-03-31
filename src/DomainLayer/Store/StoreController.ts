import { type StoreProductArgs } from "./StoreProduct";

//TODO: Should we also pass storeId together with productId?

interface IStoreController {
  /**
   * This function adds a product to a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that the product is being added to.
   * @param product The product that is being added to the store.
   * @returns The id of the product that was added to the store.
   */
  addProductToStore(
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
  getStoreProducts(storeId: string): never;
  /**
   * This function updates the quantity of a product in a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that the product is being updated in.
   * @param productId The id of the product that is being updated.
   * @param quantity The new quantity of the product.
   * @throws Error if the store is not active.
   */
  updateProductQuantityInStore(
    userId: string,
    storeId: string,
    productId: string,
    quantity: number
  ): void;
  /**
   * This function removes a product from a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that the product is being removed from.
   * @param productId The id of the product that is being removed.
   * @throws Error if the store is not active.
   * @throws Error if the product is not in the store.
   * @throws Error if user does not have permission to remove product.
   */
  removeProductFromStore(
    userId: string,
    storeId: string,
    productId: string
  ): void;
  /**
   * This function updates the price of a product in a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that the product is being updated in.
   * @param productId The id of the product that is being updated.
   * @param price The new price of the product.
   * @throws Error if the store is not active.
   * @throws Error if the product is not in the store.
   * @throws Error if the price is invalid.
   *@throws Error if user does not have permission to update product price.
   */
  updateProductPriceInStore(
    userId: string,
    storeId: string,
    productId: string,
    price: number
  ): void;
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
   * This function adds a new store to the system.
   * @param founderId The id of the user that is currently logged in.
   * @param storeName The name of the store.
   * @returns The id of the store that was added to the system.
   * @throws Error if the store name is invalid.
   * @throws Error if the user does not have permission to add a store.
   * @throws Error if the store name is already taken.
   */
  createStore(founderId: string, storeName: string): string;
  /**
   * This function activates a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that is being activated.
   * @throws Error if the store is already active.
   * @throws Error if the user does not have permission to activate the store.
   */

  activateStore(userId: string, storeId: string): void;
  /**
   * This function deactivates a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that is being deactivated.
   * @throws Error if the store is already inactive.
   * @throws Error if the user does not have permission to deactivate the store.
   */
  deactivateStore(userId: string, storeId: string): void;
  /**
   * This function permanently closes a store.
   * @param userId The id of the user that is currently logged in.
   * @param storeId The id of the store that is being closed.
   * @throws Error if the store is already closed.
   * @throws Error if the user does not have permission to close the store.
   */
  closeStorePermanently(userId: string, storeId: string): void;
  /**
   * This function returns the product's price in a store.
   * @param productId The id of the product.
   * @returns The price of the product in the store.
   * @throws Error if the product is not in the store.
   */
  getProductPriceInStore(productId: string): number;
}

export class StoreController implements IStoreController {
  addProductToStore(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): string {
    throw new Error("Method not implemented.");
  }

  isStoreActive(storeId: string): boolean {
    throw new Error("Method not implemented.");
  }
  getStoreProducts(storeId: string): never {
    throw new Error("Method not implemented.");
  }
  updateProductQuantityInStore(
    userId: string,
    storeId: string,
    productId: string,
    quantity: number
  ): void {
    throw new Error("Method not implemented.");
  }
  removeProductFromStore(
    userId: string,
    storeId: string,
    productId: string
  ): void {
    throw new Error("Method not implemented.");
  }
  updateProductPriceInStore(
    userId: string,
    storeId: string,
    productId: string,
    price: number
  ): void {
    throw new Error("Method not implemented.");
  }

  createStore(founderId: string, storeName: string): string {
    throw new Error("Method not implemented.");
  }
  activateStore(userId: string, storeId: string): void {
    throw new Error("Method not implemented.");
  }
  deactivateStore(userId: string, storeId: string): void {
    throw new Error("Method not implemented.");
  }
  closeStorePermanently(userId: string, storeId: string): void {
    throw new Error("Method not implemented.");
  }
  getProductPriceInStore(productId: string): number {
    throw new Error("Method not implemented.");
  }
}