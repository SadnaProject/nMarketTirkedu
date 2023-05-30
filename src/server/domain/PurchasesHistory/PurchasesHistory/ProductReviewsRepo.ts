import { Testable, testable } from "server/domain/_Testable";
import { ProductReview } from "../ProductReview";
import { getDB } from "server/domain/_Transactional";
import { TRPCError } from "@trpc/server";

@testable
export class ProductReviewRepo extends Testable {
  private ProductReviews: ProductReview[];

  constructor() {
    super();
    this.ProductReviews = [];
  }
  public async addProductReview(ProductReview: ProductReview) {
    await getDB().productReview.create({
      data: {
        title: ProductReview.Title,
        description: ProductReview.Description,
        productId: ProductReview.ProductId,
        rating: ProductReview.Rating,
        createdAt: ProductReview.CreatedAt,
        userId: ProductReview.UserId,
        purchaseId: ProductReview.PurchaseId,
        storeId: ProductReview.StoreId,
      },
    });
  }
  public async getProductReview(
    purchaseId: string,
    productId: string
  ): Promise<ProductReview> {
    const productReview = await getDB().productReview.findUnique({
      where: {
        purchaseId_productId: {
          purchaseId: purchaseId,
          productId: productId,
        },
      },
    });
    if (!productReview) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No review found" });
    }
    return ProductReview.fromDAO(productReview);
  }

  public async getAllProductReviews(
    productId: string
  ): Promise<ProductReview[]> {
    const productReviews = await getDB().productReview.findMany({
      where: {
        productId: productId,
      },
    });
    return productReviews.map((productReview) =>
      ProductReview.fromDAO(productReview)
    );
  }

  public async doesProductReviewExist(
    purchaseId: string,
    productId: string
  ): Promise<boolean> {
    const productReview = await getDB().productReview.findUnique({
      where: {
        purchaseId_productId: {
          purchaseId: purchaseId,
          productId: productId,
        },
      },
    });
    return productReview !== null;
  }
}
