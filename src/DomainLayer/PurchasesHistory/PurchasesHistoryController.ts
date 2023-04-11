import { Hash } from "crypto";
import { HasControllers } from "../HasController";
import { type CartDTO } from "../Users/Cart";
import { type BasketPurchaseDTO } from "./BasketPurchase";
import { CartPurchase, type CartPurchaseDTO } from "./CartPurchase";
import {
  type ProductReviewArgs,
  type ProductReviewDTO,
  ProductReview,
} from "./ProductReview";
import { Review, type ReviewDTO, ReviewArgs } from "./Review";
import { randomUUID } from "crypto";
import { Mixin } from "ts-mixer";
import { Controller } from "../Controller";

export interface IPurchasesHistoryController {
  getPurchase(purchaseId: string): CartPurchaseDTO;
  purchaseCart(userId: string, cart: CartDTO): void; // TODO: add payment details
  addStorePurchaseReview(
    userId: string,
    purchaseId: string,
    storeId: string,
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
  getReviewsByStore(storeId: string): number;
  getReviewsByProduct(productId: string): {
    reviews: ProductReviewDTO[];
    avgRating: number;
  };
  getPurchasesByUser(userId: string): CartPurchaseDTO[];
  getPurchasesByStore(storeId: string): BasketPurchaseDTO[];
}

export class PurchasesHistoryController
  extends Mixin(Controller, HasControllers)
  implements IPurchasesHistoryController
{
  private userIdToCartPurchases: Map<string, CartPurchaseDTO[]>;
  private purchaseIdToPurchase: Map<string, CartPurchaseDTO>;
  private productsReviews: ProductReviewDTO[];
  private storesRatings: ReviewDTO[];
  constructor() {
    super();
    this.purchaseIdToPurchase = new Map();
    this.userIdToCartPurchases = new Map();
    this.productsReviews = [];
    this.storesRatings = [];
  }
  getPurchasesByUser(userId: string): CartPurchaseDTO[] {
    return this.userIdToCartPurchases.get(userId) ?? [];
  }
  getPurchasesByStore(storeId: string): BasketPurchaseDTO[] {
    const purchases: BasketPurchaseDTO[] = [];
    for (const purchase of this.purchaseIdToPurchase.values()) {
      if (purchase.storeIdToBasketPurchases.has(storeId)) {
        purchases.push(
          purchase.storeIdToBasketPurchases.get(storeId)!.BasketPurchaseToDTO()
        );
      }
    }
    return purchases;
  }

  purchaseCart(userId: string, cart: CartDTO): void {
    throw new Error("Method not implemented.");
  }
  addStorePurchaseReview(
    userId: string,
    purchaseId: string,
    storeId: string,
    rating: number
  ): void {
    if (this.getPurchase(purchaseId) === undefined) {
      throw new Error("Purchase not found");
    }
    this.storesRatings.push(
      new Review({
        rating: rating,
        id: randomUUID(),
        createdAt: new Date(),
        userId: userId,
        purchaseId: purchaseId,
        storeId: storeId,
      }).ReviewToDTO()
    );
  }
  addProductPurchaseReview(
    userId: string,
    storeId: string,
    purchaseId: string,
    productId: string,
    review: ProductReviewArgs
  ): void {
    if (this.getPurchase(purchaseId) === undefined) {
      throw new Error("Purchase not found");
    }
    const productReview = new ProductReview({
      rating: review.rating,
      id: randomUUID(),
      createdAt: new Date(),
      userId: userId,
      purchaseId: purchaseId,
      storeId: storeId,
      title: review.title,
      description: review.description,
    });
    this.getPurchase(purchaseId)
      .storeIdToBasketPurchases.get(storeId)
      ?.Products.get(productId)
      ?.setReview(productReview);
    this.productsReviews.push(productReview.ProductReviewToDTO());
  }
  getStoreRating(storeId: string): number {
    let sum = 0;
    let count = 0;
    for (const review of this.storesRatings) {
      if (review.storeId === storeId) {
        sum += review.rating;
        count++;
      }
    }
    return sum / count;
  }
  getReviewsByStore(storeId: string): number {
    let count = 0;
    for (const review of this.storesRatings) {
      if (review.storeId === storeId) {
        count++;
      }
    }
    return count;
  }
  getReviewsByProduct(productId: string): {
    reviews: ProductReviewDTO[];
    avgRating: number;
  } {
    // run on productsReviews and return the reviews and avgRating
    const relevantReviews = [];
    for (const productReview of this.productsReviews) {
      if (productReview.productId === productId) {
        relevantReviews.push(productReview);
      }
    }
    let sum = 0;
    for (const productReview of relevantReviews) {
      sum += productReview.rating;
    }
    return {
      reviews: relevantReviews,
      avgRating: sum / relevantReviews.length,
    };
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

  addCartPurchase(userId: string, cartPurchase: CartPurchaseDTO) {
    if (this.userIdToCartPurchases.get(userId) === undefined) {
      this.userIdToCartPurchases.set(userId, []);
    }
    this.userIdToCartPurchases.get(userId)?.push(cartPurchase);
  }
}
