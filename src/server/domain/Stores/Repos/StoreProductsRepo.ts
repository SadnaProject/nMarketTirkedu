import { Testable, testable } from "server/domain/_Testable";
import { type StoreProduct as DataStoreProduct } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { db } from "server/db";
import { randomUUID } from "crypto";
import { StoreProductArgs } from "../StoreProduct";

@testable
export class StoreProductsRepo extends Testable {
  constructor() {
    super();
  }

  public async addProduct(
    storeId: string,
    product: StoreProductArgs,
    productId: string
  ) {
    const p = await db.storeProduct.create({
      data: {
        id: productId,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        storeId: storeId,
        description: product.description,
      },
    });
    return p.id;
  }
  public async addSpecialPrice(
    userId: string,
    productId: string,
    price: number
  ) {
    await db.specialPrice.create({
      data: {
        userId: userId,
        productId: productId,
        price: price,
      },
    });
  }
  public async getSpecialPrice(userId: string, productId: string) {
    const specialPrice = await db.specialPrice.findFirst({
      where: {
        userId: userId,
        productId: productId,
      },
    });
    return specialPrice?.price;
  }
  public async getAllProducts() {
    const products = await db.storeProduct.findMany({
      include: {
        store: true,
      },
    });

    return products;
  }
  public async getProductById(productId: string) {
    const product = await db.storeProduct.findUnique({
      where: {
        id: productId,
      },
    });
    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found",
      });
    }
    return product;
  }

  public async getActiveProducts() {
    const products = await db.storeProduct.findMany({
      include: {
        store: true,
      },
    });
    const active: DataStoreProduct[] = [];
    for (const product of products) {
      if (!product.store.isActive) continue;
      active.push(product);
    }
    return active;
  }

  public async getProductsByStoreId(storeId: string) {
    const products = await db.storeProduct.findMany({
      where: {
        storeId: storeId,
      },
    });
    const storeProducts: DataStoreProduct[] = [];
    for (const product of products) {
      if (product.storeId !== storeId) continue;
      storeProducts.push(product);
    }
    return storeProducts;
  }

  public async getStoreIdByProductId(productId: string) {
    const store = await db.storeProduct.findUnique({
      where: {
        id: productId,
      },
      select: {
        store: true,
      },
    });
    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Product not found",
      });
    }
    return store.store.id;
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
  }
}
