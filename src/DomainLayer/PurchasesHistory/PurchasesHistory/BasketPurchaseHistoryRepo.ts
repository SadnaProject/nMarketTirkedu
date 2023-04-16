import { BasketPurchase } from "../BasketPurchaseHistory";

export class BasketPurchaseRepo {
  private BasketPurchases: BasketPurchase[];

  constructor() {
    this.BasketPurchases = [];
  }
  public addBasketPurchase(BasketPurchase: BasketPurchase) {
    this.BasketPurchases.push(BasketPurchase);
  }

  public getPurchasesByStore(storeId: string): BasketPurchase[] {
    return this.BasketPurchases.filter(
      (purchase) => purchase.StoreId === storeId
    );
  }
  public getPurchaseById(purchaseId: string): BasketPurchase {
    const purchase = this.BasketPurchases.find(
      (purchase) => purchase.PurchaseId === purchaseId
    );
    if (purchase === undefined) {
      throw new Error("Purchase not found");
    }
    return purchase;
  }
}
