import { type StoreProductDTO } from "~/DomainLayer/Stores/StoreProduct";
import { Testable, testable } from "~/Testable";

@testable
export class StoreProductsRepo extends Testable {
  private productsByStoreId: Map<string, StoreProductDTO[]>;

  constructor() {
    super();
    this.productsByStoreId = new Map<string, StoreProductDTO[]>();
  }

  public addProduct(storeId: string, product: StoreProductDTO) {
    const products = this.productsByStoreId.get(storeId) || [];
    products.push(product);
    this.productsByStoreId.set(storeId, products);
  }

  private getAllProducts() {
    return Array.from(this.productsByStoreId.values()).flat();
  }

  public getProductById(productId: string) {
    const product = this.getAllProducts().find((p) => p.id === productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  }
  public getProductsByStoreId(storeId: string) {
    return this.productsByStoreId.get(storeId) || [];
  }

  public getStoreIdByProductId(productId: string) {
    for (const [storeId, products] of this.productsByStoreId.entries()) {
      if (products.find((p) => p.id === productId)) {
        return storeId;
      }
    }
    throw new Error("Product not found");
  }
}
