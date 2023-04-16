import { CartPurchase } from "../CartPurchaseHistory";

export class CartPurchaseRepo {
  private CartPurchase: CartPurchase[];

  constructor() {
    this.CartPurchase = [];
  }
  public addCartPurchase(CartPurchase: CartPurchase) {
    this.CartPurchase.push(CartPurchase);
  }

  public getPurchasesByUser(userId: string): CartPurchase[] {
    return this.CartPurchase.filter((purchase) => purchase.UserId === userId);
  }
  public getPurchaseById(purchaseId: string): CartPurchase | undefined {
    return this.CartPurchase.find(
      (purchase) => purchase.PurchaseId === purchaseId
    );
  }
}
