import { Testable, testable } from "server/domain/_Testable";

import { type StoreProduct as DataStoreProduct } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { db } from "server/db";
import { randomUUID } from "crypto";
import { StoreProduct } from "../StoreProduct";

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

  public getActiveProducts() {
    return this.getAllProducts().filter((product) => product.Store.IsActive);
  }

  public getProductById(productId: string) {
    const product = this.getAllProducts().find((p) => p.Id === productId);
    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found",
      });
    }
    return StoreProduct.fromDAO(
      product,
      await this.getSpecialPrices(productId)
    );
    //return product;
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

  public async deleteProduct(productId: string) {
    await db.storeProduct.delete({
      where: {
        id: productId,
      },
    });
  }
  public async getSpecialPrices(productId: string) {
    const specialPrices = await db.specialPrice.findMany({
      where: {
        productId: productId,
      },
    });
    const prices: Map<string, number> = new Map();
    for (const price of specialPrices) {
      prices.set(price.userId, price.price);
    }
    return prices;
  }
  public async setSpecialPrices(
    prices: Map<string, number>,
    productId: string
  ) {
    await db.specialPrice.createMany({
      data: Array.from(prices).map(([userId, price]) => {
        return {
          userId: userId,
          price: price,
          productId: productId,
        };
      }),
      skipDuplicates: true,
    });
  }
  public setField<T extends keyof DataStoreProduct>(
    productId: string,
    field: T,
    value: DataStoreProduct[T]
  ) {
    return db.storeProduct.update({
      where: {
        id: productId,
      },
      data: {
        [field]: value,
      },
    });
    /**
  public deleteProduct(productId: string) {
    const product = this.getProductById(productId);
    const storeId = this.getStoreIdByProductId(productId);
    const products = this.getProductsByStoreId(storeId);
    const index = products.indexOf(product);
    products.splice(index, 1);
    this.productsByStoreId.set(storeId, products);
    */
  }
}
