import { Testable, testable } from "server/domain/_Testable";
import { db } from "server/db";
import { TRPCError } from "@trpc/server";
import { CartPurchase as RealCartPurchase } from "../CartPurchaseHistory";

@testable
export class CartPurchaseRepo extends Testable {
  private CartPurchase: RealCartPurchase[];

  constructor() {
    super();
    this.CartPurchase = [];
  }
  public async addCartPurchase(CartPurchase: RealCartPurchase) {
    await db.cartPurchase.create({
      data: {
        purchaseId: CartPurchase.PurchaseId,
        userId: CartPurchase.UserId,
        baskets: {
          create: Object.values(
            Object.fromEntries(CartPurchase.StoreIdToBasketPurchases)
          ).map((basket) => {
            return {
              purchaseId: basket.PurchaseId,
              storeId: basket.StoreId,
              products: {
                create: Object.values(Object.fromEntries(basket.Products)).map(
                  (product) => {
                    return {
                      purchaseId: product.PurchaseId,
                      productId: product.ProductId,
                      quantity: product.Quantity,
                      price: product.Price,
                      storeId: basket.StoreId,
                    };
                  }
                ),
              },
              price: basket.Price,
            };
          }),
        },
        totalPrice: CartPurchase.TotalPrice,
      },
    });
  }

  public async getPurchasesByUser(userId: string): Promise<RealCartPurchase[]> {
    const cartPurchases = await db.cartPurchase.findMany({
      where: {
        userId: userId,
      },
      include: {
        baskets: {
          include: {
            products: {
              include: {
                review: true,
              },
            },
            review: true,
          },
        },
      },
    });
    return cartPurchases.map((cartPurchase) => {
      return RealCartPurchase.fromDAO(cartPurchase);
    });
  }
  public async getPurchaseById(purchaseId: string): Promise<RealCartPurchase> {
    const purchase = await db.cartPurchase.findUnique({
      where: {
        purchaseId: purchaseId,
      },
      include: {
        baskets: {
          include: {
            products: {
              include: {
                review: true,
              },
            },
            review: true,
          },
        },
      },
    });
    if (!purchase) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Purchase not found" });
    }
    return RealCartPurchase.fromDAO(purchase);
  }
  public async doesPurchaseExist(purchaseId: string): Promise<boolean> {
    const purchase = await db.cartPurchase.findUnique({
      where: {
        purchaseId: purchaseId,
      },
    });
    return purchase !== null;
  }
}
