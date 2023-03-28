import { type DiscountArgs } from "./Discount";
import { type StoreProductArgs } from "./StoreProduct";

//TODO: Should we also pass storeId together with productId?

interface IStoreController {
  addProductToStore(
    userId: string,
    storeId: string,
    product: StoreProductArgs
  ): string;
  isStoreActive(storeId: string): boolean;
  getStoreProducts(storeId: string): never;
  updateProductQuantityInStore(
    userId: string,
    storeId: string,
    productId: string,
    quantity: number
  ): void;
  removeProductFromStore(
    userId: string,
    storeId: string,
    productId: string
  ): void;
  updateProductPriceInStore(
    userId: string,
    storeId: string,
    productId: string,
    price: number
  ): void;
  //! There will be addDiscountCondition for each condition type
  addDiscountToStore(
    userId: string,
    storeId: string,
    discount: DiscountArgs
  ): string;
  removeDiscountFromStore(
    userId: string,
    storeId: string,
    discountId: string
  ): void;
  // TODO: Add update discount and add condition to discount
  //! Functions related to purchase policy and discount conditions will be determined later
  createStore(founderId: string, storeName: string): string;
  activateStore(userId: string, storeId: string): void;
  deactivateStore(userId: string, storeId: string): void;
  closeStorePermanently(userId: string, storeId: string): void;
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
  addDiscountToStore(
    userId: string,
    storeId: string,
    discount: DiscountArgs
  ): string {
    throw new Error("Method not implemented.");
  }
  removeDiscountFromStore(
    userId: string,
    storeId: string,
    discountId: string
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
