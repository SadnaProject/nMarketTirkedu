import { ProductPurchaseDTO } from "~/DomainLayer/PurchasesHistory/ProductPurchaseHistory";

export class ProductPurchaseRepo {
  private ProductPurchases: ProductPurchaseDTO[];

  constructor() {
    this.ProductPurchases = [];
  }

  public addProductPurchase(ProductPurchase: ProductPurchaseDTO) {
    this.ProductPurchases.push(ProductPurchase);
  }

  public getProductPurchaseById(ProductPurchaseId: string) {
    const ProductPurchase = this.ProductPurchases.find(
      (ProductPurchase) => ProductPurchase.id === ProductPurchaseId
    );
    if (!ProductPurchase) {
      throw new Error("ProductPurchase not found");
    }
    return ProductPurchase;
  }
}
