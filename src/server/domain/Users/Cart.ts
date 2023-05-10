import { type BasketDTO, Basket } from "./Basket";
import { TRPCError } from "@trpc/server";
export type CartDTO = {
  storeIdToBasket: Map<string, BasketDTO>;
};
export class Cart {
  private storeIdToBasket: Map<string, Basket>;

  constructor() {
    this.storeIdToBasket = new Map();
  }
  public addProduct(
    productId: string,
    storeId: string,
    quantity: number
  ): void {
    const basket = this.storeIdToBasket.get(storeId);
    if (basket === undefined) {
      const new_basket = new Basket(storeId);
      new_basket.addProduct(productId, quantity);
      this.storeIdToBasket.set(storeId, new_basket);
    } else {
      basket.addProduct(productId, quantity);
    }
  }
  public removeProduct(productId: string, storeId: string): void {
    const basket = this.storeIdToBasket.get(storeId);
    if (basket === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested basket not found",
      });
    } else {
      basket.removeProduct(productId);
    }
  }

  public get DTO(): CartDTO {
    const storeIdToBasketDTO = new Map<string, BasketDTO>();
    this.storeIdToBasket.forEach((basket, storeId) => {
      storeIdToBasketDTO.set(storeId, basket.DTO);
    });
    return {
      storeIdToBasket: storeIdToBasketDTO,
    };
  }
  public editProductQuantity(
    productId: string,
    storeId: string,
    quantity: number
  ): void {
    const basket = this.storeIdToBasket.get(storeId);
    if (basket === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested basket not found",
      });
    } else {
      basket.editProductQuantity(productId, quantity);
    }
  }
  public toString(): string {
    let str = "";
    this.storeIdToBasket.forEach((basket, storeId) => {
      str += "StoreId: " + storeId + " Basket: \n" + basket.toString() + "\n";
    });
    return str;
  }
}
