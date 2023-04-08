import { HasControllers } from "../HasController";
import { type CartDTO } from "../Users/Cart";
import { type BasketPurchaseDTO } from "./BasketPurchase";
import { type CartPurchaseDTO } from "./CartPurchase";
import { type ProductReviewArgs, type ProductReviewDTO } from "./ProductReview";

export interface IPurchasesHistoryController {
  getPurchase(purchaseId: string): CartPurchaseDTO;
  purchaseCart(userId: string, cart: CartDTO): void; // TODO: add payment details
  addStorePurchaseReview(
    userId: string,
    purchaseId: string,
    review: number
  ): void; // TODO: add
  addProductPurchaseReview(
    userId: string,
    purchaseId: string,
    review: ProductReviewArgs
  ): void;
  getStoreRating(storeId: string): number;
  getProductRating(productId: string): number;
  getReviewsByStore(storeId: string): number;
  getReviewsByProduct(productId: string): {
    reviews: ProductReviewDTO[];
    avgRating: number;
  };
  getPurchasesByUser(userId: string): CartPurchaseDTO[];
  getPurchasesByStore(storeId: string): BasketPurchaseDTO[];
}

export class PurchasesHistoryController
  extends HasControllers
  implements IPurchasesHistoryController
{
  private userIdToCartPurchases: Map<string, CartPurchaseDTO[]>;

  constructor() {
    super();
    this.userIdToCartPurchases = new Map();
  }
  getPurchasesByUser(userId: string): CartPurchaseDTO[] {
    throw new Error("Method not implemented.");
  }
  getPurchasesByStore(storeId: string): BasketPurchaseDTO[] {
    throw new Error("Method not implemented.");
  }

  purchaseCart(userId: string, cart: CartDTO): void {
    throw new Error("Method not implemented.");
  }
  addStorePurchaseReview(
    userId: string,
    purchaseId: string,
    review: number
  ): void {
    throw new Error("Method not implemented.");
  }
  addProductPurchaseReview(
    userId: string,
    purchaseId: string,
    review: ProductReviewArgs
  ): void {
    throw new Error("Method not implemented.");
  }
  getStoreRating(storeId: string): number {
    throw new Error("Method not implemented.");
  }
  getProductRating(productId: string): number {
    throw new Error("Method not implemented.");
  }
  getReviewsByStore(storeId: string): number {
    throw new Error("Method not implemented.");
  }
  getReviewsByProduct(productId: string): {
    reviews: ProductReviewDTO[];
    avgRating: number;
  } {
    throw new Error("Method not implemented.");
  }
  getPurchase(purchaseId: string): CartPurchaseDTO {
    throw new Error("Method not implemented.");
  }
}
