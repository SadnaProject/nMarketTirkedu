import { randomUUID } from "crypto";
import { type CartDTO } from "../Users/Cart";
import {
  BasketPurchase,
  type BasketPurchaseDTO,
} from "./BasketPurchaseHistory";
import { HasRepos } from "./_HasRepos";

// TODO: Does a class need to know its related id, or should the parent hold a map for it?

export type CartPurchaseDTO = {
  purchaseId: string;
  userId: string;
  storeIdToBasketPurchases: Map<string, BasketPurchaseDTO>;
  totalPrice: number;
};
export class CartPurchase extends HasRepos {
  private purchaseId: string;
  private storeIdToBasketPurchases: Map<string, BasketPurchase>;
  private totalPrice: number;
  private userId: string;

  static CartPurchaseDTOfromCartDTO(
    cartDTO: CartDTO,
    userId: string,
    totalPrice: number
  ): CartPurchaseDTO {
    const purchaseId = randomUUID();
    const storeIdToBasketPurchases = new Map<string, BasketPurchaseDTO>();
    cartDTO.storeIdToBasket.forEach((basketPurchase, storeId) => {
      storeIdToBasketPurchases.set(
        storeId,
        BasketPurchase.BasketPurchaseDTOFromBasketDTO(
          basketPurchase,
          purchaseId,
          userId
        )
      );
    });
    return {
      purchaseId: purchaseId,
      userId: userId,
      storeIdToBasketPurchases: storeIdToBasketPurchases,
      totalPrice: totalPrice,
    };
  }

  constructor(
    userId: string,
    purchaseId: string,
    storeIdToBasketPurchases: Map<string, BasketPurchase>,
    totalPrice: number
  ) {
    super();
    this.userId = userId;
    this.purchaseId = purchaseId;
    this.storeIdToBasketPurchases = storeIdToBasketPurchases;
    this.totalPrice = totalPrice;
  }

  // create getters and setters
  public get StoreIdToBasketPurchases(): Map<string, BasketPurchase> {
    return this.storeIdToBasketPurchases;
  }

  public ToDTO(): CartPurchaseDTO {
    const storeIdToBasketPurchases = new Map<string, BasketPurchaseDTO>();
    this.storeIdToBasketPurchases.forEach((basketPurchase, storeId) => {
      storeIdToBasketPurchases.set(storeId, basketPurchase.ToDTO());
    });
    return {
      purchaseId: this.purchaseId,
      userId: this.userId,
      storeIdToBasketPurchases: storeIdToBasketPurchases,
      totalPrice: this.totalPrice,
    };
  }

  public get PurchaseId(): string {
    return this.purchaseId;
  }
  public get UserId(): string {
    return this.userId;
  }
  static fromDTO(cartPurchaseDTO: CartPurchaseDTO): CartPurchase {
    const storeIdToBasketPurchases = new Map<string, BasketPurchase>();
    cartPurchaseDTO.storeIdToBasketPurchases.forEach(
      (basketPurchaseDTO, storeId) => {
        storeIdToBasketPurchases.set(
          storeId,
          BasketPurchase.fromDTO(basketPurchaseDTO)
        );
      }
    );
    return new CartPurchase(
      cartPurchaseDTO.userId,
      cartPurchaseDTO.purchaseId,
      storeIdToBasketPurchases,
      cartPurchaseDTO.totalPrice
    );
  }
}
