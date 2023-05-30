import { Testable, testable } from "server/helpers/_Testable";
import { getDB } from "server/helpers/_Transactional";
import { TRPCError } from "@trpc/server";
import { CartPurchase as RealCartPurchase } from "server/domain/PurchasesHistory/CartPurchaseHistory";

@testable
export class CartPurchaseRepo extends Testable {
  private cartPurchasesCache: RealCartPurchase[];

  constructor() {
    super();
    this.cartPurchasesCache = [];
  }
  public async addCartPurchase(CartPurchase: RealCartPurchase) {
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
    for (const purchase of this.cartPurchasesCache) {
      if (purchase.PurchaseId === purchaseId) {
        this.cartPurchasesCache = this.cartPurchasesCache.filter(
          (e) => e.PurchaseId !== purchaseId
        );
        this.cartPurchasesCache.push(purchase);
        return purchase;
      }
    }
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
    this.cartPurchasesCache.push(RealCartPurchase.fromDAO(purchase));
    if (this.cartPurchasesCache.length > 10) {
      this.cartPurchasesCache.shift();
    }
    return RealCartPurchase.fromDAO(purchase);
  }
  public async doesPurchaseExist(purchaseId: string): Promise<boolean> {
    for (const purchase of this.cartPurchasesCache) {
      if (purchase.PurchaseId === purchaseId) {
        this.cartPurchasesCache = this.cartPurchasesCache.filter(
          (e) => e.PurchaseId !== purchaseId
        );
        this.cartPurchasesCache.push(purchase);
        return true;
      }
    }
    const purchase = await getDB().cartPurchase.findUnique({
      where: {
        purchaseId: purchaseId,
      },
    });
    return purchase !== null;
  }
}
