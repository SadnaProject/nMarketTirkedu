import { Testable, testable } from "server/domain/_Testable";
import { StoreProduct } from "../StoreProduct";
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
    products.forEach((product) => {
      this.getProductById(product.id)
        .then((realProduct) => {
          realProducts.push(realProduct);
        })
        .catch((err) => {
          throw err;
        });
    });
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

  public getActiveProducts() {
    const activeProducts: StoreProduct[] = [];
    this.getAllProducts()
      .then((products) => {
        products.forEach((product) => {
          db.storeProduct
            .findUnique({
              where: {
                id: product.Id,
              },
              select: {
                store: true,
              },
            })
            .then((store) => {
              if (store?.store.isActive) {
                activeProducts.push(product);
              }
            })
            .catch((err) => {
              throw err;
            });
        });
      })
      .catch((err) => {
        throw err;
      });
    return activeProducts;
  }

  public async getProductsByStoreId(storeId: string) {
    const products = await db.storeProduct.findMany({
      where: {
        storeId: storeId,
      },
    });
    const realProducts: StoreProduct[] = [];
    products.forEach((product) => {
      this.getProductById(product.id)
        .then((realProduct) => {
          realProducts.push(realProduct);
        })
        .catch((err) => {
          throw err;
        });
    });
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
}
