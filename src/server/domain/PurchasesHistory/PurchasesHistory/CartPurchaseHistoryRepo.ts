import { Testable, testable } from "server/domain/_Testable";
import { db } from "server/db";
import { TRPCError } from "@trpc/server";
import {
  BasketPurchase,
  CartPurchase,
  ProductPurchase,
  ProductReview,
  Review as DBReview,
} from "@prisma/client";
import { CartPurchase as RealCartPurchase } from "../CartPurchaseHistory";

export type ProductReviewDAO = ProductReview;

export type ReviewDAO = DBReview;

export type ProductPurchaseDAO = ProductPurchase & {
  review: ProductReviewDAO | null;
};

export type BasketPurchaseDAO = BasketPurchase & {
  products: ProductPurchaseDAO[];
  review: ReviewDAO | null;
};

export type CartPurchaseDAO = CartPurchase & {
  baskets: BasketPurchaseDAO[];
};

@testable
export class CartPurchaseRepo extends Testable {
  private CartPurchase: CartPurchase[];

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
  public doesPurchaseExist(purchaseId: string): boolean {
    const purchase = db.cartPurchase.findUnique({
      where: {
        purchaseId: purchaseId,
      },
    });
    return purchase !== null;
  }
}
