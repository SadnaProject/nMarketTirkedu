import { Testable, testable } from "server/helpers/_Testable";
import { type StoreProduct as DataStoreProduct } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { getDB } from "server/helpers/_Transactional";
import { type StoreProductArgs } from "../../domain/Stores/StoreProduct";
export type productCache = {
  product: DataStoreProduct;
  counter: number;
};
@testable
export class StoreProductsRepo extends Testable {
  //fake cache
  fake_cache = new Map<string, productCache>();
  counter = 0;
  constructor() {
    super();
  }

  public async addProduct(
    storeId: string,
    product: StoreProductArgs,
    productId: string
  ) {
    const p = await getDB().storeProduct.create({
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
    await getDB().specialPrice.create({
      data: {
        userId: userId,
        productId: productId,
        price: price,
      },
    });
  }
  public async getSpecialPrice(userId: string, productId: string) {
    const specialPrice = await getDB().specialPrice.findFirst({
      where: {
        userId: userId,
        productId: productId,
      },
    });
    return specialPrice?.price;
  }
  public async getAllProducts() {
    const products = await getDB().storeProduct.findMany();

    return products;
  }
  public async getProductById(productId: string) {
    if (this.fake_cache.has(productId)) {
      const cache_product = this.fake_cache.get(productId)?.product;
      if (cache_product !== undefined) {
        return cache_product;
      }
    }

    const product = await getDB().storeProduct.findUnique({
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
    if (this.fake_cache.size === 10) {
      ///find minimum counter and delete it
      let min = Infinity;
      let min_key = "";
      for (const [key, value] of this.fake_cache.entries()) {
        if (value.counter < min) {
          min = value.counter;
          min_key = key;
        }
      }
      this.fake_cache.delete(min_key);
      //add new product
      this.fake_cache.set(productId, {
        product: product,
        counter: this.counter,
      });
    } else {
      this.fake_cache.set(productId, {
        product: product,
        counter: this.counter,
      });
    }
    this.counter++;
    return product;
  }

  public async getActiveProducts() {
    const products = await getDB().storeProduct.findMany({
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
    const products = await getDB().storeProduct.findMany({
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
    const store = await getDB().storeProduct.findUnique({
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
    await getDB().storeProduct.delete({
      where: {
        id: productId,
      },
    });
  }
  public async getSpecialPrices(productId: string) {
    const specialPrices = await getDB().specialPrice.findMany({
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
    await getDB().specialPrice.createMany({
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
  public async setField<T extends keyof DataStoreProduct>(
    productId: string,
    field: T,
    value: DataStoreProduct[T]
  ) {
    await getDB().storeProduct.update({
      where: {
        id: productId,
      },
      data: {
        [field]: value,
      },
    });
    if (this.fake_cache.has(productId)) {
      const cache_product = this.fake_cache.get(productId)?.product;
      if (cache_product !== undefined) {
        cache_product[field] = value;
      }
    }
  }
}
