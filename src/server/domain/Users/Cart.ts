import { getDB } from "../_Transactional";
import { type BasketDTO, Basket } from "./Basket";
import { TRPCError } from "@trpc/server";

export type CartDTO = {
  storeIdToBasket: Map<string, BasketDTO>;
  userId: string;
};
export class Cart {
  private storeIdToBasket: Map<string, Basket>;
  //new
  private userId: string;

  constructor(userId: string) {
    this.storeIdToBasket = new Map();
    this.userId = userId;
  }
  public async addProduct(
    productId: string,
    storeId: string,
    quantity: number
  ): Promise<void> {
    const b = await getDB().basket.findUnique({
      where: { userId_storeId: { storeId: storeId, userId: this.userId } },
    });
    if (b == null) {
      await getDB().basket.create({
        data: {
          storeId: storeId,
          userId: this.userId,
        },
      });
      const new_basket = new Basket(storeId, this.userId);
      await new_basket.addProduct(productId, quantity);
      this.storeIdToBasket.set(storeId, new_basket);
    }
    const basket = this.storeIdToBasket.get(storeId);
    if (basket === undefined) {
      let new_basket = new Basket(storeId, this.userId);
      if (b != null) {
        const products = await getDB().basketProduct.findMany({
          where: { storeId: storeId, userId: this.userId },
        });
        new_basket = Basket.createFromDTO({
          storeId: storeId,
          products: products,
          userId: this.userId,
        });
      }
      await new_basket.addProduct(productId, quantity);
      this.storeIdToBasket.set(storeId, new_basket);
    } else {
      await basket.addProduct(productId, quantity);
    }
  }
  public async removeProduct(
    productId: string,
    storeId: string
  ): Promise<void> {
    const b = await getDB().basket.findUnique({
      where: { userId_storeId: { storeId: storeId, userId: this.userId } },
    });
    if (b == null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested basket not found",
      });
    }
    const basket = this.storeIdToBasket.get(storeId);
    if (basket === undefined) {
      let new_basket = new Basket(storeId, this.userId);
      if (b != null) {
        const products = await getDB().basketProduct.findMany({
          where: { storeId: storeId, userId: this.userId },
        });
        new_basket = Basket.createFromDTO({
          storeId: storeId,
          products: products,
          userId: this.userId,
        });
      }
      await new_basket.removeProduct(productId);
      this.storeIdToBasket.set(storeId, new_basket);
    } else {
      await basket.removeProduct(productId);
    }
  }

  public get DTO(): CartDTO {
    const storeIdToBasketDTO = new Map<string, BasketDTO>();
    this.storeIdToBasket.forEach((basket, storeId) => {
      storeIdToBasketDTO.set(storeId, basket.DTO);
    });
    return {
      storeIdToBasket: storeIdToBasketDTO,
      userId: this.userId,
    };
  }
  public async editProductQuantity(
    productId: string,
    storeId: string,
    quantity: number
  ): Promise<void> {
    const b = await getDB().basket.findUnique({
      where: { userId_storeId: { storeId: storeId, userId: this.userId } },
    });
    if (b == null) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The requested basket not found",
      });
    }
    const basket = this.storeIdToBasket.get(storeId);
    if (basket === undefined) {
      let new_basket = new Basket(storeId, this.userId);
      if (b != null) {
        const products = await getDB().basketProduct.findMany({
          where: { storeId: storeId, userId: this.userId },
        });
        new_basket = Basket.createFromDTO({
          storeId: storeId,
          products: products,
          userId: this.userId,
        });
      }
      await new_basket.editProductQuantity(productId, quantity);
      this.storeIdToBasket.set(storeId, new_basket);
    } else {
      await basket.editProductQuantity(productId, quantity);
    }
  }
  public toString(): string {
    let str = "";
    this.storeIdToBasket.forEach((basket, storeId) => {
      str += "StoreId: " + storeId + " Basket: \n" + basket.toString() + "\n";
    });
    return str;
  }
  static createFromDTO(dto: CartDTO): Cart {
    const c = new Cart(dto.userId);
    for (const b of dto.storeIdToBasket) {
      c.storeIdToBasket.set(b[0], Basket.createFromDTO(b[1]));
    }
    return c;
  }
  static async createFromArgs(
    userId: string,
    storenames: string[]
  ): Promise<Cart> {
    const c = new Cart(userId);
    for (const s of storenames) {
      c.storeIdToBasket.set(s, await Basket.createFromArgs(userId, s));
    }
    return c;
  }
}
