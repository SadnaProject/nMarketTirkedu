import { Testable, testable } from "server/helpers/_Testable";
import { getDB } from "server/helpers/_Transactional";
import { BasketProduct } from "../../domain/Users/BasketProduct";

@testable
export class BasketProductRepo extends Testable {
  updateProductQuantity(data: {
    productId: string;
    quantity: number;
    storeId: string;
    userId: string;
  }) {
    return getDB().basketProduct.upsert({
      where: { storeProductId: data.productId },
      update: { quantity: data.quantity },
      create: {
        storeProductId: data.productId,
        quantity: data.quantity,
        storeId: data.storeId,
        userId: data.userId,
      },
    });
  }

  async getProducts(storeId: string) {
    const products = await getDB().basketProduct.findMany({
      where: { storeId: storeId },
    });
    return products.map(
      (p) =>
        new BasketProduct(p.storeProductId, p.quantity, p.storeId, p.userId)
    );
  }
}
