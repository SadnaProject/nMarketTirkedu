import { HasControllers } from "../_HasController";
import { type CartDTO } from "../Users/Cart";
import {
  BasketPurchase,
  type BasketPurchaseDTO,
} from "./BasketPurchaseHistory";
import { CartPurchase, type CartPurchaseDTO } from "./CartPurchaseHistory";
import { type ProductReviewDTO, ProductReview } from "./ProductReview";
import { Review } from "./Review";
import { randomUUID } from "crypto";
import { Mixin } from "ts-mixer";
import { Testable, testable } from "server/domain/_Testable";
import { HasRepos, type Repos, createRepos } from "./_HasRepos";
import { type CreditCard, PaymentAdapter } from "./PaymentAdaptor";
import {
  ProductPurchase,
  type ProductPurchaseDTO,
} from "./ProductPurchaseHistory";
import { TRPCError } from "@trpc/server";
import { eventEmitter } from "server/EventEmitter";
import { censored } from "../_Loggable";
import { type BasketDTO } from "../Users/Basket";
import { type BasketProductDTO } from "../Users/BasketProduct";

export interface IPurchasesHistoryController extends HasRepos {
  getPurchase(purchaseId: string): Promise<CartPurchaseDTO>;
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
    description: string,
    storeId: string
  ): void;
  getStoreRating(storeId: string): Promise<number>;
  getReviewsByStore(storeId: string): Promise<number>;
  getReviewsByProduct(productId: string): Promise<{
    reviews: ProductReviewDTO[];
    avgRating: number;
  }>;
  getPurchasesByUser(
    admingId: string,
    userId: string
  ): Promise<CartPurchaseDTO[]>;
  getPurchasesByStore(storeId: string): Promise<BasketPurchaseDTO[]>;
  ProductPurchaseDTOFromBasketProductDTO(
    basketProductDTO: BasketProductDTO,
    purchaseId: string,
    userId: string
  ): ProductPurchaseDTO;
  BasketPurchaseDTOFromBasketDTO(
    basket: BasketDTO,
    purchaseId: string,
    userId: string
  ): BasketPurchaseDTO;
  CartPurchaseDTOfromCartDTO(
    cartDTO: CartDTO,
    userId: string,
    totalPrice: number
  ): CartPurchaseDTO;
  addPurchase(cartPurchase: CartPurchase): void;
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
  async getPurchasesByUser(
    admingId: string,
    userId: string
  ): Promise<CartPurchaseDTO[]> {
    if (this.Controllers.Jobs.isSystemAdmin(admingId) === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "User is not a system admin, and therefore cannot view other users' purchases",
      });
    }
    const purchases = await this.Repos.CartPurchases.getPurchasesByUser(userId);
    return purchases.map((purchase) => purchase.ToDTO());
  }
  async getPurchasesByStore(storeId: string): Promise<BasketPurchaseDTO[]> {
    const purchases = await this.Repos.BasketPurchases.getPurchasesByStore(
      storeId
    );
    return purchases.map((purchase) => purchase.ToDTO());
  }

  async purchaseCart(
    userId: string,
    cart: CartDTO,
    price: number,
    @censored creditCard: CreditCard
  ): Promise<void> {
    cart.storeIdToBasket.forEach((basket) => {
      basket.products.forEach((product) => {
        if (
          !this.Controllers.Stores.isProductQuantityInStock(
            userId,
            product.storeProductId,
            product.quantity
          )
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Product quantity is not available",
          });
        }
      });
    });
    if (cart.storeIdToBasket.size === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cart is empty, please add products to cart before purchasing",
      });
    }
    if (PaymentAdapter.pay(creditCard, price) === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Payment failed, please check your credit card details and try again",
      });
    }
    cart.storeIdToBasket.forEach((basket) => {
      basket.products.forEach((product) => {
        this.Controllers.Stores.decreaseProductQuantity(
          product.storeProductId,
          product.quantity
        );
      });
    });
    // for every storeId in cart, EventEmmiter.emit("purchase", storeId, cart.storeIdToBasket.get(storeId))
    const cartPurchase = this.CartPurchaseDTOfromCartDTO(cart, userId, price);
    await this.addPurchase(CartPurchase.fromDTO(cartPurchase));
    for (const [storeId, basket] of cart.storeIdToBasket) {
      eventEmitter.emit(`purchase store ${storeId}`, {
        purchaseId: cartPurchase.purchaseId,
        userId: userId,
        storeId: storeId,
      });
    }
  }

  async addPurchase(cartPurchase: CartPurchase): Promise<void> {
    // check that purchase with same id doesn't exist
    // if this.Repos.CartPurchases.getPurchaseById(cartPurchase.PurchaseId) dosent throw, throw error
    if (
      await this.Repos.CartPurchases.doesPurchaseExist(cartPurchase.PurchaseId)
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Purchase with same id already exists, please try again with a different cart",
      });
    }
    await this.Repos.CartPurchases.addCartPurchase(cartPurchase);
    // for each <string, basket> in cart do addBasketPurchase
    // cartPurchase.StoreIdToBasketPurchases.forEach((basket, storeId) => {
    //   this.addBasketPurchase(basket);
    //   basket.Products.forEach((product) => {
    //     this.addProductPurchase(product);
    //   });
    // });
  }

  async addBasketPurchase(basketPurchase: BasketPurchase): Promise<void> {
    await this.Repos.BasketPurchases.addBasketPurchase(basketPurchase);
  }

  async addProductPurchase(
    productPurchase: ProductPurchase,
    storeId: string
  ): Promise<void> {
    await this.Repos.ProductsPurchases.addProductPurchase(
      productPurchase,
      storeId
    );
  }

  async addStorePurchaseReview(
    userId: string,
    purchaseId: string,
    storeId: string,
    rating: number
  ): Promise<void> {
    if (await this.Repos.Reviews.doesStoreReviewExist(purchaseId, storeId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Store already reviewed, please try again with a different purchase",
      });
    }
    if (this.Repos.BasketPurchases.hasPurchase(purchaseId, storeId) === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Purchase not found",
      });
    }
    const review = new Review({
      rating: rating,
      createdAt: new Date(),
      userId: userId,
      purchaseId: purchaseId,
      storeId: storeId,
    });
    await this.Repos.Reviews.addStoreReview(review);
  }
  async addProductPurchaseReview(
    userId: string,
    purchaseId: string,
    productId: string,
    rating: number,
    title: string,
    description: string,
    storeId: string
  ): Promise<void> {
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
    const products = await this.Repos.ProductsPurchases.getProductsPurchaseById(
      purchaseId
    );
    if (
      products.find((product) => product.ProductId === productId) === undefined
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Product not found in purchase",
      });
    }
    const productReview = new ProductReview({
      title: title,
      description: description,
      productId: productId,
      rating: rating,
      createdAt: new Date(),
      userId: userId,
      purchaseId: purchaseId,
      storeId: storeId,
    });
    await this.Repos.ProductReviews.addProductReview(productReview);
  }
  async getStoreRating(storeId: string): Promise<number> {
    let sum = 0;
    let count = 0;
    const reviews = await this.Repos.Reviews.getAllStoreReviews(storeId);
    for (const review of reviews) {
      sum += review.Rating;
      count++;
    }
    return sum / count || 0;
  }
  async getReviewsByStore(storeId: string): Promise<number> {
    const reviews = await this.Repos.Reviews.getAllStoreReviews(storeId);
    return reviews.length;
  }
  async getReviewsByProduct(productId: string): Promise<{
    reviews: ProductReviewDTO[];
    avgRating: number;
  }> {
    const reviews = await this.Repos.ProductReviews.getAllProductReviews(
      productId
    );
    let sum = 0;
    for (const review of reviews) {
      sum += review.Rating;
    }
    return {
      reviews: reviews.map((review) => review.ProductReviewToDTO()),
      avgRating: sum / reviews.length || 0,
    };
  }
  async getPurchase(purchaseId: string): Promise<CartPurchaseDTO> {
    if (
      (await this.Repos.CartPurchases.doesPurchaseExist(purchaseId)) === false
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Purchase not found",
      });
    }
    const purchase = await this.Repos.CartPurchases.getPurchaseById(purchaseId);
    return purchase.ToDTO();
  }
  BasketPurchaseDTOFromBasketDTO(
    basketDTO: BasketDTO,
    purchaseId: string,
    userId: string
  ): BasketPurchaseDTO {
    const products = new Map<string, ProductPurchaseDTO>();
    basketDTO.products.forEach((product) => {
      products.set(
        product.storeProductId,
        this.ProductPurchaseDTOFromBasketProductDTO(product, purchaseId, userId)
      );
    });
    return {
      purchaseId: purchaseId,
      storeId: basketDTO.storeId,
      products: products,
      price: this.Controllers.Stores.getBasketPrice(userId, basketDTO.storeId),
    };
  }
  ProductPurchaseDTOFromBasketProductDTO(
    basketProductDTO: BasketProductDTO,
    purchaseId: string,
    userId: string
  ): ProductPurchaseDTO {
    return {
      productId: basketProductDTO.storeProductId,
      quantity: basketProductDTO.quantity,
      price: this.Controllers.Stores.getProductPrice(
        userId,
        basketProductDTO.storeProductId
      ),
      purchaseId: purchaseId,
    };
  }
  CartPurchaseDTOfromCartDTO(
    cartDTO: CartDTO,
    userId: string,
    totalPrice: number
  ): CartPurchaseDTO {
    const purchaseId = randomUUID();
    const storeIdToBasketPurchases = new Map<string, BasketPurchaseDTO>();
    cartDTO.storeIdToBasket.forEach((basketPurchase, storeId) => {
      storeIdToBasketPurchases.set(
        storeId,
        this.BasketPurchaseDTOFromBasketDTO(basketPurchase, purchaseId, userId)
      );
    });
    return {
      purchaseId: purchaseId,
      userId: userId,
      storeIdToBasketPurchases: storeIdToBasketPurchases,
      totalPrice: totalPrice,
    };
  }
}
