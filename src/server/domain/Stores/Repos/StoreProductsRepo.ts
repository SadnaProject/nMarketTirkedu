import { Testable, testable } from "server/domain/_Testable";
import { type StoreProduct } from "../StoreProduct";
import { TRPCError } from "@trpc/server";

@testable
export class StoreProductsRepo extends Testable {
  private productsByStoreId: Map<string, StoreProduct[]>;

  constructor() {
    super();
    this.productsByStoreId = new Map<string, StoreProduct[]>();
  }

  public addProduct(storeId: string, product: StoreProduct) {
    const products = this.productsByStoreId.get(storeId) || [];
    products.push(product);
    this.productsByStoreId.set(storeId, products);
  }

  public getAllProducts() {
    return Array.from(this.productsByStoreId.values()).flat();
  }

  public getProductById(productId: string) {
    const product = this.getAllProducts().find((p) => p.Id === productId);
    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found",
      });
    }
    return product;
  }

  public getProductsByStoreId(storeId: string) {
    return this.productsByStoreId.get(storeId) || [];
  }

  public getStoreIdByProductId(productId: string) {
    for (const [storeId, products] of this.productsByStoreId.entries()) {
      if (products.find((p) => p.Id === productId)) {
        return storeId;
      }
    }
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Product not found",
    });
  }

  public deleteProduct(productId: string) {
    const product = this.getProductById(productId);
    const storeId = this.getStoreIdByProductId(productId);
    const products = this.getProductsByStoreId(storeId);
    const index = products.indexOf(product);
    products.splice(index, 1);
    this.productsByStoreId.set(storeId, products);
  }
}
