import { ProductPurchase } from "../ProductPurchaseHistory";

export class ProductPurchaseRepo {
  private ProductPurchases: ProductPurchase[];

  constructor() {
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
