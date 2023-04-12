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

  public getAllProducts() {
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

  public setPrice(productId: string, price: number) {
    const product = this.getProductById(productId);
    product.price = price;
  }

  public setQuantity(productId: string, quantity: number) {
    const product = this.getProductById(productId);
    product.quantity = quantity;
  }

  public setDescription(productId: string, description: string) {
    const product = this.getProductById(productId);
    product.description = description;
  }

  public deleteProduct(productId: string) {
    const product = this.getProductById(productId);
    const storeId = this.getStoreIdByProductId(productId);
    const products = this.productsByStoreId.get(storeId) || [];
    const index = products.indexOf(product);
    products.splice(index, 1);
    this.productsByStoreId.set(storeId, products);
  }
}
