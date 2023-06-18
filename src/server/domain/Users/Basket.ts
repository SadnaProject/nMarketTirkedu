import { getDB } from "server/helpers/_Transactional";
import { type BasketProductDTO, BasketProduct } from "./BasketProduct";
import { type StoreProduct as DataStoreProduct } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export type BasketDTO = {
  storeId: string;
  products: BasketProductDTO[];
  //new
  userId: string;
};
export type ExtendedBasketDTO = {
  storeId: string;
  storeName: string;
  products: BasketProductDTO[];
  storeProducts: DataStoreProduct[];
  //new
  userId: string;
};
export class Basket {
  private storeId: string;
  private products: BasketProduct[];
  //new
  private userId: string;

  constructor(storeId: string, userId: string) {
    this.userId = userId;
    this.storeId = storeId;
    this.products = [];
  }
  // add product to the basket, notice that we override the quantity if the product already exists in the basket,
  // if the user wants to add he needs to use the edit product quantity method
  public async addProduct(productId: string, quantity: number): Promise<void> {
    if (quantity < 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Quantity cannot be negative",
      });
    }
    const pdb = await getDB().basketProduct.findUnique({
      where: { storeProductId: productId },
    });
    if (pdb === null) {
      await getDB().basketProduct.create({
        data: {
          storeProductId: productId,
          quantity: quantity,
          storeId: this.storeId,
          userId: this.userId,
        },
      });
    } else {
      await getDB().basketProduct.update({
        where: { storeProductId: productId },
        data: { quantity: quantity },
      });
    }
    const product = this.products.find((p) => p.ProductId === productId);
    if (product === undefined) {
      const new_product = new BasketProduct(
        productId,
        quantity,
        this.storeId,
        this.userId
      );
      if (this.products.length < 10) this.products.push(new_product);
    } else {
      product.Quantity = quantity;
    }
  }
  public async removeProduct(productId: string): Promise<void> {
    const pdb = await getDB().basketProduct.findUnique({
      where: { storeProductId: productId },
    });
    if (pdb === null) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    } else {
      this.products = this.products.filter((p) => p.ProductId !== productId);
      await getDB().basketProduct.delete({
        where: { storeProductId: productId },
      });
    }
  }
  public get DTO(): BasketDTO {
    const productsDTO = this.products.map((p) => p.DTO);
    return {
      storeId: this.storeId,
      products: productsDTO,
      userId: this.userId,
    };
  }
  public async editProductQuantity(
    productId: string,
    quantity: number
  ): Promise<void> {
    if (quantity < 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Quantity cannot be negative",
      });
    }
    const pdb = await getDB().basketProduct.findUnique({
      where: { storeProductId: productId },
    });
    if (pdb === null) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    } else {
      if (quantity === 0) {
        this.products = this.products.filter((p) => p.ProductId !== productId);
        await getDB().basketProduct.delete({
          where: { storeProductId: productId },
        });
      } else {
        await getDB().basketProduct.update({
          where: { storeProductId: productId },
          data: { quantity: quantity },
        });
        const product = this.products.find((p) => p.ProductId === productId);
        if (product === undefined) {
          const new_product = new BasketProduct(
            productId,
            quantity,
            this.storeId,
            this.userId
          );
          if (this.products.length < 10) this.products.push(new_product);
        } else {
          product.Quantity = quantity;
        }
      }
    }
  }
  static createFromDTO(dto: BasketDTO): Basket {
    const b = new Basket(dto.storeId, dto.userId);
    for (const p of dto.products) {
      b.products.push(BasketProduct.createFromDTO(p));
    }
    return b;
  }
  static async createFromArgs(
    userId: string,
    storeId: string
  ): Promise<Basket> {
    const b = new Basket(storeId, userId);
    const products = await getDB().basketProduct.findMany({
      where: { userId: userId, storeId: storeId },
    });
    const toBeRemoved = [];
    for (const p of products) {
      const prod = await getDB().storeProduct.findUnique({
        where: { id: p.storeProductId },
      });
      if (!prod) {
        toBeRemoved.push(p);
      }
    }
    for (const p of toBeRemoved) {
      const idx = products.indexOf(p);
      products.splice(idx, 1);
    }
    b.products = products.map((p) => BasketProduct.createFromDTO(p));
    return b;
  }
  static async createFromArgsUI(
    userId: string,
    storeId: string
  ): Promise<ExtendedBasketDTO> {
    const b: ExtendedBasketDTO = {
      storeId: storeId,
      storeName: "",
      products: [],
      storeProducts: [],
      userId: userId,
    };
    const store = await getDB().store.findUnique({
      where: {
        id: storeId,
      },
    });
    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }
    b.storeName = store?.name;
    const products = await getDB().basketProduct.findMany({
      where: { userId: userId, storeId: storeId },
    });
    b.products = products;
    const toBeRemoved = [];
    for (const p of products) {
      const prod = await getDB().storeProduct.findUnique({
        where: { id: p.storeProductId },
      });
      if (!prod) {
        toBeRemoved.push(p);
      }
      if (prod) b.storeProducts.push(prod);
    }
    for (const p of toBeRemoved) {
      const idx = b.products.indexOf(p);
      b.products.splice(idx, 1);
    }
    return b;
  }
  public toString(): string {
    let str = "";
    this.products.forEach((p) => {
      str += p.toString() + " ";
    });
    return str;
  }
}
