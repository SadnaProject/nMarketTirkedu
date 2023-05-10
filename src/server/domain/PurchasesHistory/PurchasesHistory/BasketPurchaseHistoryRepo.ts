import { Testable, testable } from "server/domain/_Testable";
import { type BasketPurchase } from "../BasketPurchaseHistory";

@testable
export class BasketPurchaseRepo extends Testable {
  private BasketPurchases: BasketPurchase[];

  constructor() {
    super();
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
  public hasPurchase(purchaseId: string): boolean {
    const purchase = this.BasketPurchases.find(
      (purchase) => purchase.PurchaseId === purchaseId
    );
    return purchase !== undefined;
  }
}
