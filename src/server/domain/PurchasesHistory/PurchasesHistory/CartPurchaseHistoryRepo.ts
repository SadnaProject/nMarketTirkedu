import { Testable, testable } from "server/domain/_Testable";
import { type CartPurchase } from "../CartPurchaseHistory";

@testable
export class CartPurchaseRepo extends Testable {
  private CartPurchase: CartPurchase[];

  constructor() {
    super();
    this.CartPurchase = [];
  }
  public addCartPurchase(CartPurchase: CartPurchase) {
    this.CartPurchase.push(CartPurchase);
  }

  public getPurchasesByUser(userId: string): CartPurchase[] {
    return this.CartPurchase.filter((purchase) => purchase.UserId === userId);
  }
  public getPurchaseById(purchaseId: string): CartPurchase {
    const purchase = this.CartPurchase.find(
      (purchase) => purchase.PurchaseId === purchaseId
    );
    if (purchase === undefined) {
      throw new Error("Purchase not found");
    }
    return purchase;
  }
  public doesPurchaseExist(purchaseId: string): boolean {
    return this.CartPurchase.some(
      (purchase) => purchase.PurchaseId === purchaseId
    );
  }
}
