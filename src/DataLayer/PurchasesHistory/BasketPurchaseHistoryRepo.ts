import { BasketPurchaseDTO } from "~/DomainLayer/PurchasesHistory/BasketPurchaseHistory";
import { ProductPurchaseDTO } from "~/DomainLayer/PurchasesHistory/ProductPurchaseHistory";

export class BasketPurchaseRepo {
  private BasketPurchases: BasketPurchaseDTO[];

  constructor() {
    this.BasketPurchases = [];
  }
  public addBasketPurchase(BasketPurchase: BasketPurchaseDTO) {
    this.BasketPurchases.push(BasketPurchase);
  }
  // public getBasketPurchase(id : string) : BasketPurchaseDTO | undefined{
  //     return this.BasketPurchases.find((p) => p.id === id);
  // }
}
