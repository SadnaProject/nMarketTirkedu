import { Testable, testable } from "@/server/_Testable";
import { type ProductPurchase } from "../ProductPurchaseHistory";

@testable
export class ProductPurchaseRepo extends Testable {
  private ProductPurchases: ProductPurchase[];

  constructor() {
    super();
    this.ProductPurchases = [];
  }

  public addProductPurchase(ProductPurchase: ProductPurchase) {
    this.ProductPurchases.push(ProductPurchase);
  }
  // return all products with the same purchaseId
  public getProductsPurchaseById(ProductPurchaseId: string): ProductPurchase[] {
    return this.ProductPurchases.filter(
      (ProductPurchase) => ProductPurchase.PurchaseId === ProductPurchaseId
    );
  }
}
