import {
  BasketPurchase,
  type BasketPurchaseDTO,
} from "./BasketPurchaseHistory";
import { HasRepos } from "./helpers/_HasRepos";
import { type CartPurchaseDAO } from "./helpers/TypeHelper";

// TODO: Does a class need to know its related id, or should the parent hold a map for it?

export type CartPurchaseDTO = {
  purchaseId: string;
  userId: string;
  storeIdToBasketPurchases: Map<string, BasketPurchaseDTO>;
  totalPrice: number;
};
export class CartPurchase {
  private purchaseId: string;
  private storeIdToBasketPurchases: Map<string, BasketPurchase>;
  private totalPrice: number;
  private userId: string;

  constructor(
    userId: string,
    purchaseId: string,
    storeIdToBasketPurchases: Map<string, BasketPurchase>,
    totalPrice: number
  ) {
    // super();
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
  public get TotalPrice(): number {
    return this.totalPrice;
  }
  static fromDAO(cartPurchaseDAO: CartPurchaseDAO): CartPurchase {
    const cart = new CartPurchase(
      cartPurchaseDAO.userId,
      cartPurchaseDAO.purchaseId,
      new Map<string, BasketPurchase>(),
      cartPurchaseDAO.totalPrice
    );
    // for each basket in cartPurchaseDAO.baskets, create a basket purchase and add it to the cart
    cartPurchaseDAO.baskets.forEach((basketPurchaseDAO) => {
      const basketPurchase = BasketPurchase.fromDAO(basketPurchaseDAO);
      cart.StoreIdToBasketPurchases.set(basketPurchase.StoreId, basketPurchase);
    });
    return cart;
  }
}
