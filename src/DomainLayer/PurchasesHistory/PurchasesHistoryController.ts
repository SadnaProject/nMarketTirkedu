import { HasControllers } from "../HasController";
import { type CartDTO } from "../Users/Cart";
import { type BasketPurchaseDTO } from "./BasketPurchaseHistory";
import { CartPurchase, type CartPurchaseDTO } from "./CartPurchaseHistory";
import { type ProductReviewDTO, ProductReview } from "./ProductReview";
import { Review, type ReviewDTO } from "./Review";
import { randomUUID } from "crypto";
import { Mixin } from "ts-mixer";
import { Testable, testable } from "~/Testable";
import { HasRepos, createRepos } from "./HasRepos";
import { PaymentAdapter } from "./PaymentAdaptor";

export interface IPurchasesHistoryController {
  getPurchase(purchaseId: string): CartPurchaseDTO;
  purchaseCart(userId: string, cart: CartDTO, price: number, creditCard: string): void; // TODO: add payment details
  addStorePurchaseReview(
    userId: string,
    purchaseId: string,
    storeId: string,
    review: number
  ): void; // TODO: add
  addProductPurchaseReview(
    userId: string,
    purchaseId: string,
    productId: string,
    rating: number,
    title: string,
    description: string
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
    return this.Repos.CartPurchases.getPurchasesByUser(userId).map((purchase) =>
      purchase.CartPurchaseToDTO()
    );
  }
  getPurchasesByStore(storeId: string): BasketPurchaseDTO[] {
    return this.Repos.BasketPurchases.getPurchasesByStore(storeId).map(
      (purchase) => purchase.BasketPurchaseToDTO()
    );
  }

  purchaseCart(userId: string, cart: CartDTO, price: number, creditCard :string): void {
    if(PaymentAdapter.pay(creditCard, price) === false){
      throw new Error("Payment failed");
    }
    const cartPurchase = CartPurchase.CartPurchaseDTOfromCartDTO(
      cart,
      userId,
      price
    );
    this.addPurchase(userId, cartPurchase);
  }
  addStorePurchaseReview(
    userId: string,
    purchaseId: string,
    storeId: string,
    rating: number
  ): void {
    if (this.Repos.Reviews.getStoreReview(purchaseId, storeId) !== undefined) {
      throw new Error("Store already reviewed");
    }
    if (this.Repos.BasketPurchases.getPurchaseById(purchaseId) === undefined) {
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
    this.Repos.Reviews.addStoreReview(review);

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
    purchaseId: string,
    productId: string,
    rating: number,
    title: string,
    description: string
  ): void {
    if (
      this.Repos.ProductReviews.getProductReview(purchaseId, productId) !==
      undefined
    ) {
      throw new Error("Product already reviewed");
    }
    if (this.Repos.BasketPurchases.getPurchaseById(purchaseId) === undefined) {
      throw new Error("Purchase not found");
    }
    const productReview = new ProductReview({
      rating: rating,
      id: randomUUID(),
      createdAt: new Date(),
      userId: userId,
      purchaseId: purchaseId,
      title: title,
      description: description,
    });
    this.Repos.ProductReviews.addProductReview(productReview);

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
      sum += review.Rating;
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
      sum += review.Rating;
    }
    return {
      reviews: reviews.map((review) => review.ProductReviewToDTO()),
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
    if (this.Repos.CartPurchases.getPurchaseById(purchaseId) === undefined) {
      throw new Error("Purchase not found");
    }
    return this.Repos.CartPurchases.getPurchaseById(
      purchaseId
    )!.CartPurchaseToDTO();
    // const purchase = this.purchaseIdToPurchase.get(purchaseId);
    // if (purchase === undefined) {
    //   throw new Error("Purchase not found");
    // }
    // return purchase;
  }
  addPurchase(purchaseId: string, purchase: CartPurchaseDTO) {
    this.purchaseIdToPurchase.set(purchaseId, purchase);
    const purchases = this.userIdToCartPurchases.get(purchase.userId);
    if (purchases === undefined) {
      this.userIdToCartPurchases.set(purchase.userId, [purchase]);
    } else {
      purchases.push(purchase);
    }
  }
}
