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
import { Testable, testable } from "~/Testable";
import { HasRepos, createRepos } from "./HasRepos";

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

@testable
export class PurchasesHistoryController
  extends Mixin(Testable, HasControllers, HasRepos)
  implements IPurchasesHistoryController
{
  private userIdToCartPurchases: Map<string, CartPurchaseDTO[]>;
  private purchaseIdToPurchase: Map<string, CartPurchaseDTO>;
  private productsReviews: ProductReviewDTO[];
  private storesRatings: ReviewDTO[];
  constructor() {
    super();
    this.initRepos(createRepos());
    this.purchaseIdToPurchase = new Map();
    this.userIdToCartPurchases = new Map();
    this.productsReviews = [];
    this.storesRatings = [];
  }
  getPurchasesByUser(userId: string): CartPurchaseDTO[] {
    return this.Repos.CartPurchases.getPurchasesByUser(userId);
    // return this.userIdToCartPurchases.get(userId) ?? [];
  }
  getPurchasesByStore(storeId: string): BasketPurchaseDTO[] {
    return this.Repos.BasketPurchases.getPurchasesByStore(storeId);
    // const purchases: BasketPurchaseDTO[] = [];
    // for (const purchase of this.purchaseIdToPurchase.values()) {
    //   if (purchase.storeIdToBasketPurchases.has(storeId)) {
    //     purchases.push(
    //       purchase.storeIdToBasketPurchases.get(storeId)!.BasketPurchaseToDTO()
    //     );
    //   }
    // }
    // return purchases;
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
    if(this.Repos.Reviews.getStoreReview(purchaseId, storeId) !== undefined){
      throw new Error("Store already reviewed");
    }
    if(this.Repos.BasketPurchases.getPurchaseById(purchaseId) === undefined){
      throw new Error("Purchase not found");
    }
    const review = new Review({
      rating: rating,
      id: randomUUID(),
      createdAt: new Date(),
      userId: userId,
      purchaseId: purchaseId,
      storeId: storeId,
    });
    this.Repos.Reviews.addStoreReview(review.ReviewToDTO());

    // if (this.getPurchase(purchaseId) === undefined) {
    //   throw new Error("Purchase not found");
    // }
    // this.storesRatings.push(
    //   new Review({
    //     rating: rating,
    //     id: randomUUID(),
    //     createdAt: new Date(),
    //     userId: userId,
    //     purchaseId: purchaseId,
    //     storeId: storeId,
    //   }).ReviewToDTO()
    // );
  }
  addProductPurchaseReview(
    userId: string,
    storeId: string,
    purchaseId: string,
    productId: string,
    review: ProductReviewArgs
  ): void {
    if(this.Repos.ProductReviews.getProductReview(purchaseId, productId) !== undefined){
      throw new Error("Product already reviewed");
    }
    if(this.Repos.BasketPurchases.getPurchaseById(purchaseId) === undefined){
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
    this.Repos.ProductReviews.addProductReview(productReview.ProductReviewToDTO());

    // if (this.getPurchase(purchaseId) === undefined) {
    //   throw new Error("Purchase not found");
    // }
    // const productReview = new ProductReview({
    //   rating: review.rating,
    //   id: randomUUID(),
    //   createdAt: new Date(),
    //   userId: userId,
    //   purchaseId: purchaseId,
    //   storeId: storeId,
    //   title: review.title,
    //   description: review.description,
    // });
    // this.getPurchase(purchaseId)
    //   .storeIdToBasketPurchases.get(storeId)
    //   ?.Products.get(productId)
    //   ?.setReview(productReview);
    // this.productsReviews.push(productReview.ProductReviewToDTO());
  }
  getStoreRating(storeId: string): number {
    let sum = 0;
    let count = 0;
    const reviews = this.Repos.Reviews.getAllStoreReviews(storeId);
    for (const review of reviews) {
        sum += review.rating;
        count++;
    }
    return sum / count;
  }
  getReviewsByStore(storeId: string): number {
    const reviews = this.Repos.Reviews.getAllStoreReviews(storeId);
    return reviews.length;
  }
  getReviewsByProduct(productId: string): {
    reviews: ProductReviewDTO[];
    avgRating: number;
  } {
    const reviews = this.Repos.ProductReviews.getAllProductReviews(productId);
    let sum = 0;
    for (const review of reviews) {
      sum += review.rating;
    }
    return {
      reviews: reviews,
      avgRating: sum / reviews.length,
    };
    // const relevantReviews = [];
    // for (const productReview of this.productsReviews) {
    //   if (productReview.productId === productId) {
    //     relevantReviews.push(productReview);
    //   }
    // }
    // let sum = 0;
    // for (const productReview of relevantReviews) {
    //   sum += productReview.rating;
    // }
    // return {
    //   reviews: relevantReviews,
    //   avgRating: sum / relevantReviews.length,
    // };
  }
  getPurchase(purchaseId: string): CartPurchaseDTO {
    if(this.Repos.CartPurchases.getPurchaseById(purchaseId) === undefined){
      throw new Error("Purchase not found");
    }
    return this.Repos.CartPurchases.getPurchaseById(purchaseId)!;
    // const purchase = this.purchaseIdToPurchase.get(purchaseId);
    // if (purchase === undefined) {
    //   throw new Error("Purchase not found");
    // }
    // return purchase;
  }
  addPurchase(purchaseId: string, purchase: CartPurchaseDTO) {
    if(this.Repos.CartPurchases.getPurchaseById(purchaseId) !== undefined){
      throw new Error("Purchase already exists");
    }
    this.Repos.CartPurchases.addCartPurchase(purchase);
    // if (this.purchaseIdToPurchase.get(purchaseId) !== undefined) {
    //   throw new Error("Purchase already exists");
    // }
    // this.purchaseIdToPurchase.set(purchaseId, purchase);
    // if (this.userIdToCartPurchases.get(userId) === undefined) {
    //   this.userIdToCartPurchases.set(userId, []);
    // }
    // this.userIdToCartPurchases.get(userId)?.push(purchase);
  }

}
