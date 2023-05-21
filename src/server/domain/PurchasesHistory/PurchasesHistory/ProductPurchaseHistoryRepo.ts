import { Testable, testable } from "server/domain/_Testable";
import { ProductPurchase } from "../ProductPurchaseHistory";
import { db } from "server/db";

@testable
export class ProductPurchaseRepo extends Testable {
  private ProductPurchases: ProductPurchase[];

  constructor() {
    super();
    this.ProductPurchases = [];
  }

  public async addProductPurchase(
    ProductPurchase: ProductPurchase,
    storeId: string
  ) {
    await db.productPurchase.create({
      data: {
        purchaseId: ProductPurchase.PurchaseId,
        productId: ProductPurchase.ProductId,
        quantity: ProductPurchase.Quantity,
        price: ProductPurchase.Price,
        storeId: storeId,
      },
    });
  }
  // return all products with the same purchaseId
  public async getProductsPurchaseById(
    ProductPurchaseId: string
  ): Promise<ProductPurchase[]> {
    const productPurchases = await db.productPurchase.findMany({
      where: {
        purchaseId: ProductPurchaseId,
      },
      include: {
        review: true,
      },
    });
    return productPurchases.map((productPurchase) =>
      ProductPurchase.fromDAO(productPurchase)
    );
  }
}
