import { Testable, testable } from "server/domain/_Testable";
import { getDB } from "server/domain/_Transactional";
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
    // await db.cartPurchase.create({
    //   data: {
    //     purchaseId: CartPurchase.PurchaseId,
    //     userId: CartPurchase.UserId,
    //     baskets: {
    //       create: Object.values(
    //         Object.fromEntries(CartPurchase.StoreIdToBasketPurchases)
    //       ).map((basket) => {
    //         return {
    //           purchaseId: basket.PurchaseId,
    //           storeId: basket.StoreId,
    //           products: {
    //             create: Object.values(Object.fromEntries(basket.Products)).map(
    //               (product) => {
    //                 return {
    //                   purchaseId: product.PurchaseId,
    //                   productId: product.ProductId,
    //                   quantity: product.Quantity,
    //                   price: product.Price,
    //                   storeId: basket.StoreId,
    //                 };
    //               }
    //             ),
    //           },
    //           price: basket.Price,
    //         };
    //       }),
    //     },
    //     totalPrice: CartPurchase.TotalPrice,
    //   },
    // }); TODO consider promiseall/waitall whatever
    await getDB().cartPurchase.create({
      data: {
        purchaseId: CartPurchase.PurchaseId,
        userId: CartPurchase.UserId,
        totalPrice: CartPurchase.TotalPrice,
      },
    });
    for (const basket of CartPurchase.StoreIdToBasketPurchases.values()) {
      await getDB().basketPurchase.create({
        data: {
          purchaseId: basket.PurchaseId,
          storeId: basket.StoreId,
          price: basket.Price,
        },
      });
      for (const product of basket.Products.values()) {
        await getDB().productPurchase.create({
          data: {
            purchaseId: product.PurchaseId,
            productId: product.ProductId,
            quantity: product.Quantity,
            price: product.Price,
            storeId: basket.StoreId,
          },
        });
      }
    }
  }

  public async getPurchasesByUser(userId: string): Promise<RealCartPurchase[]> {
    const cartPurchases = await getDB().cartPurchase.findMany({
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
    const purchase = await getDB().cartPurchase.findUnique({
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
    const purchase = await getDB().cartPurchase.findUnique({
      where: {
        purchaseId: purchaseId,
      },
    });
    return purchase !== null;
  }
}
