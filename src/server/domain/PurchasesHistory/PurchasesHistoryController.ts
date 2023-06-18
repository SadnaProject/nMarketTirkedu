import { HasControllers } from "../helpers/_HasController";
import { type CartDTO } from "../Users/Cart";
import {
  type BasketPurchase,
  type BasketPurchaseDTO,
} from "./BasketPurchaseHistory";
import { CartPurchase, type CartPurchaseDTO } from "./CartPurchaseHistory";
import { type ProductReviewDTO, ProductReview } from "./ProductReview";
import { Review } from "./Review";
import { randomUUID } from "crypto";
import { Mixin } from "ts-mixer";
import { Testable, testable } from "server/helpers/_Testable";
import { HasRepos, type Repos, createRepos } from "./helpers/_HasRepos";
import { type PaymentDetails, PaymentAdapter } from "./PaymentAdaptor";
import {
  type ProductPurchase,
  type ProductPurchaseDTO,
} from "./ProductPurchaseHistory";
import { TRPCError } from "@trpc/server";
import { eventEmitter } from "server/domain/helpers/_EventEmitter";
import { censored } from "../helpers/_Loggable";
import { type BasketDTO } from "../Users/Basket";
import { type BasketProductDTO } from "../Users/BasketProduct";
import { EventManager } from "../Notifications/EventsManager";
import { EventEmitter } from "stream";
import { DeliveryAdaptor, type DeliveryDetails } from "./DeliveryAdaptor";

export interface IPurchasesHistoryController extends HasRepos {
  getPurchase(purchaseId: string): Promise<CartPurchaseDTO>;
  purchaseCart(
    userId: string,
    cart: CartDTO,
    price: number,
    creditCard: PaymentDetails,
    deliveryDetails: DeliveryDetails
  ): Promise<{
    paymentTransactionId: number;
    deliveryTransactionId: number;
  }>;
  addStorePurchaseReview(
    userId: string,
    purchaseId: string,
    storeId: string,
    review: number
  ): Promise<void>;
  addProductPurchaseReview(
    userId: string,
    purchaseId: string,
    productId: string,
    rating: number,
    title: string,
    description: string,
    storeId: string
  ): Promise<void>;
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
  ): Promise<ProductPurchaseDTO>;
  BasketPurchaseDTOFromBasketDTO(
    basket: BasketDTO,
    purchaseId: string,
    userId: string
  ): Promise<BasketPurchaseDTO>;
  CartPurchaseDTOfromCartDTO(
    cartDTO: CartDTO,
    userId: string,
    totalPrice: number
  ): Promise<CartPurchaseDTO>;
  addPurchase(cartPurchase: CartPurchase): Promise<void>;
  getMyPurchases(userId: string): Promise<CartPurchaseDTO[]>;
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
    if ((await this.Controllers.Jobs.isSystemAdmin(admingId)) === false) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "User is not a system admin, and therefore cannot view other users' purchases",
      });
    }
    const purchases = await this.Repos.CartPurchases.getPurchasesByUser(userId);
    const purchaseDTO = purchases.map((purchase) => purchase.ToDTO());
    // for every basket, set the store name, and the products names
    for (const purchase of purchaseDTO) {
      for (const [storeId, basket] of purchase.storeIdToBasketPurchases) {
        basket.storeName = await this.Controllers.Stores.getStoreNameById(
          "userId",
          storeId
        );
        for (const [productId, product] of basket.products) {
          const pro = await this.Controllers.Stores.getProductById(
            "userId",
            productId
          );
          product.name = pro.name;
          product.description = pro.description;
        }
      }
    }
    return purchaseDTO;
  }
  async getPurchasesByStore(storeId: string): Promise<BasketPurchaseDTO[]> {
    const purchases = await this.Repos.BasketPurchases.getPurchasesByStore(
      storeId
    );
    const purchaseDTO = purchases.map((purchase) => purchase.ToDTO());
    // for every basket, set the store name, and the products names
    for (const purchase of purchaseDTO) {
      purchase.storeName = await this.Controllers.Stores.getStoreNameById(
        "userId",
        storeId
      );
      for (const [productId, product] of purchase.products) {
        try {
          const pro = await this.Controllers.Stores.getProductById(
            "userId",
            productId
          );
          product.name = pro.name;
          product.description = pro.description;
        } catch (e) {
          product.name = "product not found";
          product.description = "product not found";
        }
      }
    }
    return purchaseDTO;
  }

  async getMyPurchases(userId: string): Promise<CartPurchaseDTO[]> {
    const purchases = await this.Repos.CartPurchases.getPurchasesByUser(userId);
    const purchaseDTO = purchases.map((purchase) => purchase.ToDTO());
    // for every basket, set the store name, and the products names
    for (const purchase of purchaseDTO) {
      for (const [storeId, basket] of purchase.storeIdToBasketPurchases) {
        basket.storeName = await this.Controllers.Stores.getStoreNameById(
          "userId",
          storeId
        );
        for (const [productId, product] of basket.products) {
          try {
            const pro = await this.Controllers.Stores.getProductById(
              "userId",
              productId
            );
            product.name = pro.name;
            product.description = pro.description;
          } catch (e) {
            product.name = "product not found";
            product.description = "product not found";
          }
        }
      }
    }
    return purchaseDTO;
  }

  async purchaseCart(
    userId: string,
    cart: CartDTO,
    price: number,
    @censored creditCard: PaymentDetails,
    @censored deliveryDetails: DeliveryDetails
  ): Promise<{
    paymentTransactionId: number;
    deliveryTransactionId: number;
  }> {
    // for each basket run StoresController.checkIfBasketSatisfiesStoreConstraints
    for (const [storeId, basket] of cart.storeIdToBasket) {
      if (
        !(await this.Controllers.Stores.checkIfBasketSatisfiesStoreConstraints(
          userId,
          storeId,
          basket
        ))
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Basket does not satisfy store constraints",
        });
      }
    }
    for (const basket of cart.storeIdToBasket.values()) {
      for (const product of basket.products.values()) {
        if (
          !(await this.Controllers.Stores.isProductQuantityInStock(
            userId,
            product.storeProductId,
            product.quantity
          ))
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Product quantity is not available",
          });
        }
      }
    }
    if (cart.storeIdToBasket.size === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cart is empty, please add products to cart before purchasing",
      });
    }

    await PaymentAdapter.handShake();
    const payTransID = await PaymentAdapter.pay(creditCard, price);
    await DeliveryAdaptor.handShake();
    const deliveryTransId = await DeliveryAdaptor.supply(deliveryDetails);
    for (const basket of cart.storeIdToBasket.values()) {
      for (const product of basket.products.values()) {
        await this.Controllers.Stores.decreaseProductQuantity(
          product.storeProductId,
          product.quantity
        );
      }
    }
    // for every storeId in cart, EventEmmiter.emit("purchase", storeId, cart.storeIdToBasket.get(storeId))
    const cartPurchase = await this.CartPurchaseDTOfromCartDTO(
      cart,
      userId,
      price
    );
    await this.addPurchase(CartPurchase.fromDTO(cartPurchase));
    return {
      paymentTransactionId: payTransID,
      deliveryTransactionId: deliveryTransId,
    };
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
    // for each basket in cartPurchase do addBasketPurchase
    for (const basket of cartPurchase.StoreIdToBasketPurchases.values()) {
      await eventEmitter.emitEvent({
        type: "storePurchase",
        channel: `storePurchase_${basket.StoreId}`,
        storeId: basket.StoreId,
        message: "You have a new purchase!",
      });
    }
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
    if (
      (await this.Repos.BasketPurchases.hasPurchase(purchaseId, storeId)) ===
      false
    ) {
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
      await this.Repos.ProductReviews.doesProductReviewExist(
        purchaseId,
        productId
      )
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
    const purchaseDTO = purchase.ToDTO();
    // for each basket, set its name, and for each product set its name and description
    for (const [
      storeId,
      basketPurchase,
    ] of purchaseDTO.storeIdToBasketPurchases) {
      basketPurchase.storeName = await this.Controllers.Stores.getStoreNameById(
        "userId",
        storeId
      );
      for (const [productId, productPurchase] of basketPurchase.products) {
        try {
          const product = await this.Controllers.Stores.getProductById(
            "userId",
            productId
          );
          productPurchase.name = product.name;
          productPurchase.description = product.description;
        } catch (e) {
          productPurchase.name = "Product not found";
          productPurchase.description = "Product not found";
        }
      }
    }
    return purchaseDTO;
  }
  async BasketPurchaseDTOFromBasketDTO(
    basketDTO: BasketDTO,
    purchaseId: string,
    userId: string
  ): Promise<BasketPurchaseDTO> {
    const products = new Map<string, ProductPurchaseDTO>();
    for (const product of basketDTO.products) {
      products.set(
        product.storeProductId,
        await this.ProductPurchaseDTOFromBasketProductDTO(
          product,
          purchaseId,
          userId
        )
      );
    }
    return {
      purchaseId: purchaseId,
      storeId: basketDTO.storeId,
      products: products,
      price: await this.Controllers.Stores.getBasketPrice(
        userId,
        basketDTO.storeId
      ),
    };
  }
  async ProductPurchaseDTOFromBasketProductDTO(
    basketProductDTO: BasketProductDTO,
    purchaseId: string,
    userId: string
  ): Promise<ProductPurchaseDTO> {
    return {
      productId: basketProductDTO.storeProductId,
      quantity: basketProductDTO.quantity,
      price: await this.Controllers.Stores.getProductPrice(
        userId,
        basketProductDTO.storeProductId
      ),
      purchaseId: purchaseId,
    };
  }
  async CartPurchaseDTOfromCartDTO(
    cartDTO: CartDTO,
    userId: string,
    totalPrice: number
  ): Promise<CartPurchaseDTO> {
    const purchaseId = randomUUID();
    const storeIdToBasketPurchases = new Map<string, BasketPurchaseDTO>();
    for (const [storeId, basket] of cartDTO.storeIdToBasket) {
      storeIdToBasketPurchases.set(
        storeId,
        await this.BasketPurchaseDTOFromBasketDTO(basket, purchaseId, userId)
      );
    }
    return {
      purchaseId: purchaseId,
      userId: userId,
      storeIdToBasketPurchases: storeIdToBasketPurchases,
      totalPrice: totalPrice,
    };
  }
}
