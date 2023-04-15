import { ProductPurchase } from "../ProductPurchaseHistory";

export class ProductPurchaseRepo {
  private ProductPurchases: ProductPurchase[];

  constructor() {
    this.ProductPurchases = [];
  }

  public addProductPurchase(ProductPurchase: ProductPurchase) {
    this.ProductPurchases.push(ProductPurchase);
  }

  public getProductPurchaseById(ProductPurchaseId: string) {
    const ProductPurchase = this.ProductPurchases.find(
      (ProductPurchase) => ProductPurchase.PurchaseId === ProductPurchaseId
    );
    if (!ProductPurchase) {
      throw new Error("ProductPurchase not found");
    }
    return ProductPurchase;
  }
}
