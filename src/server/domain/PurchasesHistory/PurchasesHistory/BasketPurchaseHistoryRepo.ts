import { Testable, testable } from "server/domain/_Testable";
import { BasketPurchase as RealBasketPurchase } from "../BasketPurchaseHistory";
import { getDB } from "server/domain/_Transactional";
import { TRPCError } from "@trpc/server";

@testable
export class BasketPurchaseRepo extends Testable {
  private BasketPurchases: RealBasketPurchase[];

  constructor() {
    super();
    this.BasketPurchases = [];
  }

  public async addBasketPurchase(
    basketPurchase: RealBasketPurchase
  ): Promise<void> {
    await getDB().basketPurchase.create({
      data: {
        purchaseId: basketPurchase.PurchaseId,
        storeId: basketPurchase.StoreId,
        products: {
          create: Object.values(
            Object.fromEntries(basketPurchase.Products)
          ).map((product) => {
            return {
              purchaseId: product.PurchaseId,
              productId: product.ProductId,
              quantity: product.Quantity,
              price: product.Price,
            };
          }),
        },
        price: basketPurchase.Price,
      },
    });
  }

  public async getPurchasesByStore(
    storeId: string
  ): Promise<RealBasketPurchase[]> {
    const baskets = await getDB().basketPurchase.findMany({
      where: {
        storeId: storeId,
      },
      include: {
        review: true,
        products: {
          include: {
            review: true,
          },
        },
      },
    });
    const basketPurchases = baskets.map((basket) => {
      return RealBasketPurchase.fromDAO(basket);
    });
    return basketPurchases;
  }
  public async getPurchaseById(
    purchaseId: string,
    storeId: string
  ): Promise<RealBasketPurchase> {
    const purchase = await getDB().basketPurchase.findUnique({
      where: {
        purchaseId_storeId: {
          purchaseId: purchaseId,
          storeId: storeId,
        },
      },
      include: {
        review: true,
        products: {
          include: {
            review: true,
          },
        },
      },
    });
    if (!purchase) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Purchase not found" });
    }
    return RealBasketPurchase.fromDAO(purchase);
  }
  public async hasPurchase(
    purchaseId: string,
    storeId: string
  ): Promise<boolean> {
    const purchase = await getDB().basketPurchase.findUnique({
      where: {
        purchaseId_storeId: {
          purchaseId: purchaseId,
          storeId: storeId,
        },
      },
    });
    // return weather the purchase exists
    return purchase !== null;
  }
}
