import { type BasketDTO, Basket } from "./Basket";

export type CartDTO = {
  storeIdToBasket: Map<string, BasketDTO>;
  totalPrice: number;
};
export class Cart {
  private storeIdToBasket: Map<string, Basket>;

  constructor() {
    this.storeIdToBasket = new Map();
  }
  public addProduct(productId: string, storeId:string, quantity: number): void {
    const basket = this.storeIdToBasket.get(storeId);
    if(basket === undefined){
      const new_basket = new Basket(storeId);
      new_basket.addProduct(productId, quantity);
      this.storeIdToBasket.set(storeId,new_basket);
    }else{
      basket.addProduct(productId, quantity);
    }
  }
  public getTotalPrice(): number {
    throw new Error("Not implemented");
  }
  public get DTO(): CartDTO {
    const storeIdToBasketDTO = new Map<string,BasketDTO>();
    this.storeIdToBasket.forEach((basket,storeId) => {
      storeIdToBasketDTO.set(storeId,basket.DTO);
    });
    return {
      storeIdToBasket : storeIdToBasketDTO,
      totalPrice: this.getTotalPrice(),
    };
  }


}
