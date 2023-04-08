import { HasControllers } from "../HasController";
import { type CartDTO } from "../Users/Cart";
import { type BasketPurchaseDTO } from "./BasketPurchase";
import { CartPurchase, type CartPurchaseDTO } from "./CartPurchase";
import { type ProductReviewArgs, type ProductReviewDTO, ProductReview } from "./ProductReview";

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
    storeId: string,
    purchaseId: string,
    productId: string,
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
  private purchaseIdToPurchase: Map<string, CartPurchaseDTO>;
  constructor() {
    super();
    this.purchaseIdToPurchase = new Map();
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
    storeId: string,
    purchaseId: string,
    productId: string,
    review: ProductReviewArgs
  ): void {
    if(this.getPurchase(purchaseId) === undefined) {
      throw new Error("Purchase not found");
    }
    this.getPurchase(purchaseId).storeIdToBasketPurchases.get(storeId)?.Products.get(productId)?.setReview(new ProductReview(review, userId, purchaseId, "", productId));
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
    const purchase = this.purchaseIdToPurchase.get(purchaseId);
    if (purchase === undefined) {
      throw new Error("Purchase not found");
    }
    return purchase;
  }
  addPurchase(purchaseId: string, userId: string, purchase: CartPurchaseDTO) {
    if (this.purchaseIdToPurchase.get(purchaseId) !== undefined) {
      throw new Error("Purchase already exists");
    }
    this.purchaseIdToPurchase.set(purchaseId, purchase);
    if (this.userIdToCartPurchases.get(userId) === undefined) {
      this.userIdToCartPurchases.set(userId, []);
    }
    this.userIdToCartPurchases.get(userId)?.push(purchase);
  }

}
