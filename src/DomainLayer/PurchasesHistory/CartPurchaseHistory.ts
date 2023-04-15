import { randomUUID } from "crypto";
import { type CartDTO } from "../Users/Cart";
import { BasketPurchase } from "./BasketPurchaseHistory";
import { HasRepos } from "./HasRepos";

// TODO: Does a class need to know its related id, or should the parent hold a map for it?

export type CartPurchaseDTO = {
  purchaseId: string;
  userId: string;
  storeIdToBasketPurchases: Map<string, BasketPurchase>;
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
    const storeIdToBasketPurchases = new Map<string, BasketPurchase>();
    cartDTO.storeIdToBasket.forEach((basketPurchase, storeId) => {
      storeIdToBasketPurchases.set(
        storeId,
        BasketPurchase.BasketPurchaseFromBasketDTO(basketPurchase, purchaseId)
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
    storeIdToBasketPurchases: Map<string, BasketPurchase>,
    totalPrice: number
  ) {
    super();
    this.userId = userId;
    this.purchaseId = randomUUID();
    this.storeIdToBasketPurchases = storeIdToBasketPurchases;
    this.totalPrice = totalPrice;
  }

  // create getters and setters
  public get StoreIdToBasketPurchases(): Map<string, BasketPurchase> {
    return this.storeIdToBasketPurchases;
  }

  public CartPurchaseToDTO(): CartPurchaseDTO {
    return {
      purchaseId: this.purchaseId,
      userId: this.userId,
      storeIdToBasketPurchases: this.storeIdToBasketPurchases,
      totalPrice: this.totalPrice,
    };
  }

  public get PurchaseId(): string {
    return this.purchaseId;
  }
  public get UserId(): string {
    return this.userId;
  }
}
