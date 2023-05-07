import { HasControllers } from "../_HasController";
import { type CartDTO } from "../Users/Cart";
import {
  type BasketPurchase,
  type BasketPurchaseDTO,
} from "./BasketPurchaseHistory";
import { CartPurchase, type CartPurchaseDTO } from "./CartPurchaseHistory";
import { type ProductReviewDTO, ProductReview } from "./ProductReview";
import { Review, type ReviewDTO } from "./Review";
import { randomUUID } from "crypto";
import { Mixin } from "ts-mixer";
import { Testable, testable } from "server/domain/_Testable";
import { HasRepos, type Repos, createRepos } from "./_HasRepos";
import { type CreditCard, PaymentAdapter } from "./PaymentAdaptor";
import { type ProductPurchase } from "./ProductPurchaseHistory";
import { error } from "console";
import { createControllers } from "../_createControllers";
import { JobsController } from "../Jobs/JobsController";
import { TRPCError } from "@trpc/server";
import { emitter } from "server/Emitter";
import { censored } from "../_Loggable";

export interface IPurchasesHistoryController extends HasRepos {
  getPurchase(purchaseId: string): CartPurchaseDTO;
  purchaseCart(
    userId: string,
    cart: CartDTO,
    price: number,
    creditCard: CreditCard
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
  getPurchasesByUser(admingId: string, userId: string): CartPurchaseDTO[];
  getPurchasesByStore(storeId: string): BasketPurchaseDTO[];
}

@testable
export class PurchasesHistoryController
  extends Mixin(Testable, HasControllers, HasRepos)
  implements IPurchasesHistoryController
{
  constructor(repos: Repos = createRepos()) {
    super();
    this.initRepos(repos);
  }
  getPurchasesByUser(admingId: string, userId: string): CartPurchaseDTO[] {
    if (new JobsController().isSystemAdmin(admingId) === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "User is not a system admin, and therefore cannot view other users' purchases",
      });
    }
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
    @censored creditCard: CreditCard
  ): void {
    if (PaymentAdapter.pay(creditCard, price) === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Payment failed, please check your credit card details and try again",
      });
    }
    if (cart.storeIdToBasket.size === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cart is empty, please add products to cart before purchasing",
      });
    }
    //TODO fix
    // cart.storeIdToBasket.forEach((basket) => {
    //   basket.products.forEach((product) => {
    //     if (
    //       this.Controllers.Stores.isProductQuantityInStock(
    //         userId,
    //         product.storeProductId,
    //         product.quantity
    //       )
    //     ) {
    //       throw new Error("Product quantity is not available");
    //     }
    //   });
    // });
    // for every storeId in cart, EventEmmiter.emit("purchase", storeId, cart.storeIdToBasket.get(storeId))
    const cartPurchase = CartPurchase.CartPurchaseDTOfromCartDTO(
      cart,
      userId,
      price
    );
    this.addPurchase(CartPurchase.fromDTO(cartPurchase));
    for (const [storeId, basket] of cart.storeIdToBasket) {
      emitter.emit(`purchase store ${storeId}`, {
        purchaseId: cartPurchase.purchaseId,
        userId: userId,
        storeId: storeId,
      });
    }
  }

  addPurchase(cartPurchase: CartPurchase): void {
    // check that purchase with same id doesn't exist
    // if this.Repos.CartPurchases.getPurchaseById(cartPurchase.PurchaseId) dosent throw, throw error
    if (this.Repos.CartPurchases.doesPurchaseExist(cartPurchase.PurchaseId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Purchase with same id already exists, please try again with a different cart",
      });
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
    if (this.Repos.Reviews.doesStoreReviewExist(purchaseId, storeId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Store already reviewed, please try again with a different purchase",
      });
    }
    if (this.Repos.BasketPurchases.hasPurchase(purchaseId) === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Purchase not found",
      });
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
      this.Repos.ProductReviews.doesProductReviewExist(purchaseId, productId)
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Product already reviewed, please try again with a different purchase",
      });
    }
    if (
      this.Repos.ProductsPurchases.getProductsPurchaseById(purchaseId) ===
      undefined
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Purchase not found",
      });
    }
    // check if there is product with productId in getProductsPurchaseById
    if (
      this.Repos.ProductsPurchases.getProductsPurchaseById(purchaseId).find(
        (product) => product.ProductId === productId
      ) === undefined
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Product not found in purchase",
      });
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
    return sum / count || 0;
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
      avgRating: sum / reviews.length || 0,
    };
  }
  getPurchase(purchaseId: string): CartPurchaseDTO {
    if (this.Repos.CartPurchases.doesPurchaseExist(purchaseId) === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Purchase not found",
      });
    }
    return this.Repos.CartPurchases.getPurchaseById(purchaseId)!.ToDTO();
  }
}
