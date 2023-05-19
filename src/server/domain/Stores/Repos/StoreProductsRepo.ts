import { Testable, testable } from "server/domain/_Testable";
import { StoreProduct } from "../StoreProduct";
import { type StoreProduct as DataStoreProduct } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { db } from "server/db";
import { randomUUID } from "crypto";

@testable
export class StoreProductsRepo extends Testable {
  private productsByStoreId: Map<string, StoreProduct[]>;

  constructor() {
    super();
    this.productsByStoreId = new Map<string, StoreProduct[]>();
  }

  public async addProduct(storeId: string, product: StoreProduct) {
    const p = await db.storeProduct.create({
      data: {
        name: product.Name,
        category: product.Category,
        price: product.Price,
        quantity: product.Quantity,
        storeId: storeId,
        description: product.Description,
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
    const realProducts: StoreProduct[] = [];
    for (const product of products) {
      const realProduct = new StoreProduct({
        category: product.category,
        description: product.description,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      });
      realProduct.Id = product.id;
      realProducts.push(realProduct);
    }
    return realProducts;
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
    const realProduct = new StoreProduct({
      category: product.category,
      description: product.description,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    });
    realProduct.Id = product.id;
    return realProduct;
  }

  public async getActiveProducts() {
    const products = await db.storeProduct.findMany({
      include: {
        store: true,
      },
    });
    const realProducts: StoreProduct[] = [];
    for (const product of products) {
      if (!product.store.isActive) continue;
      const realProduct = new StoreProduct({
        category: product.category,
        description: product.description,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      });
      realProduct.Id = product.id;
      realProducts.push(realProduct);
    }
    return realProducts;
  }

  public async getProductsByStoreId(storeId: string) {
    const products = await db.storeProduct.findMany({
      where: {
        storeId: storeId,
      },
    });
    const realProducts: StoreProduct[] = [];
    for (const product of products) {
      if (product.storeId !== storeId) continue;
      const realProduct = new StoreProduct({
        category: product.category,
        description: product.description,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      });
      realProduct.Id = product.id;
      realProducts.push(realProduct);
    }
    return realProducts;
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
