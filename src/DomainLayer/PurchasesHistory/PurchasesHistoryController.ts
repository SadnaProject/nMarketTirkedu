import { HasControllers } from "../HasController";
import { type CartDTO } from "../Users/Cart";
import {
  BasketPurchase,
  type BasketPurchaseDTO,
} from "./BasketPurchaseHistory";
import { CartPurchase, type CartPurchaseDTO } from "./CartPurchaseHistory";
import { type ProductReviewDTO, ProductReview } from "./ProductReview";
import { Review, type ReviewDTO } from "./Review";
import { randomUUID } from "crypto";
import { Mixin } from "ts-mixer";
import { Testable, testable } from "~/Testable";
import { HasRepos, createRepos } from "./HasRepos";
import { PaymentAdapter } from "./PaymentAdaptor";
import { ProductPurchase } from "./ProductPurchaseHistory";

export interface IPurchasesHistoryController {
  getPurchase(purchaseId: string): CartPurchaseDTO;
  purchaseCart(
    userId: string,
    cart: CartDTO,
    price: number,
    creditCard: string
  ): void; // TODO: add payment details
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
  constructor() {
    super();
    this.initRepos(createRepos());
  }
  getPurchasesByUser(userId: string): CartPurchaseDTO[] {
    return this.Repos.CartPurchases.getPurchasesByUser(userId).map((purchase) =>
      purchase.ToDTO()
    );
  }
  getPurchasesByStore(storeId: string): BasketPurchaseDTO[] {
    return this.Repos.BasketPurchases.getPurchasesByStore(storeId).map(
      (purchase) => purchase.ToDTO()
    );
  }

  purchaseCart(
    userId: string,
    cart: CartDTO,
    price: number,
    creditCard: string
  ): void {
    if (PaymentAdapter.pay(creditCard, price) === false) {
      throw new Error("Payment failed");
    }
    const cartPurchase = CartPurchase.CartPurchaseDTOfromCartDTO(
      cart,
      userId,
      price
    );
    this.addPurchase(CartPurchase.fromDTO(cartPurchase));
  }

  addPurchase(cartPurchase: CartPurchase): void {
    // check that purchase with same id doesn't exist
    if (this.Repos.CartPurchases.getPurchaseById(cartPurchase.PurchaseId) !== undefined) {
      throw new Error("Purchase already exists");
    }
    this.Repos.CartPurchases.addCartPurchase(cartPurchase);
    // for each <string, basket> in cart do addBasketPurchase
    cartPurchase.StoreIdToBasketPurchases.forEach((basket, storeId) => {
      this.addBasketPurchase(basket);
      basket.Products.forEach((product) => {
        this.addProductPurchase(product);
      });
    });
  }
  addBasketPurchase(basketPurchase: BasketPurchase): void {
    this.Repos.BasketPurchases.addBasketPurchase(basketPurchase);
  }

  addProductPurchase(productPurchase: ProductPurchase): void {
    this.Repos.ProductsPurchases.addProductPurchase(productPurchase);
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
    if (
      this.Repos.ProductsPurchases.getProductPurchaseById(purchaseId) ===
      undefined
    ) {
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
      productId: productId,
    });
    this.Repos.ProductReviews.addProductReview(productReview);
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
  }
  getPurchase(purchaseId: string): CartPurchaseDTO {
    if (this.Repos.CartPurchases.getPurchaseById(purchaseId) === undefined) {
      throw new Error("Purchase not found");
    }
    return this.Repos.CartPurchases.getPurchaseById(purchaseId)!.ToDTO();
  }
}
