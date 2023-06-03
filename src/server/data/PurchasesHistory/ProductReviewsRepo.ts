import { Testable, testable } from "server/helpers/_Testable";
import { ProductReview } from "server/domain/PurchasesHistory/ProductReview";
import { getDB } from "server/helpers/_Transactional";
import { TRPCError } from "@trpc/server";

@testable
export class ProductReviewRepo extends Testable {
  private productReviewsCache: ProductReview[];

  constructor() {
    super();
    this.productReviewsCache = [];
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
    const cachedProductReview = this.productReviewsCache.find(
      (productReview) =>
        productReview.PurchaseId === purchaseId &&
        productReview.ProductId === productId
    );
    if (cachedProductReview) {
      this.productReviewsCache = this.productReviewsCache.filter(
        (productReview) =>
          productReview.PurchaseId !== purchaseId ||
          productReview.ProductId !== productId
      );
      this.productReviewsCache.push(cachedProductReview);
      return cachedProductReview;
    }
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
    this.productReviewsCache.push(ProductReview.fromDAO(productReview));
    if (this.productReviewsCache.length > 10) {
      this.productReviewsCache.shift();
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
    const cachedProductReview = this.productReviewsCache.find(
      (productReview) =>
        productReview.PurchaseId === purchaseId &&
        productReview.ProductId === productId
    );
    if (cachedProductReview) {
      this.productReviewsCache = this.productReviewsCache.filter(
        (productReview) =>
          productReview.PurchaseId !== purchaseId ||
          productReview.ProductId !== productId
      );
      this.productReviewsCache.push(cachedProductReview);
      return true;
    }
    const productReview = await getDB().productReview.findUnique({
      where: {
        purchaseId_productId: {
          purchaseId: purchaseId,
          productId: productId,
        },
      },
    });
    if (productReview) {
      this.productReviewsCache.push(ProductReview.fromDAO(productReview));
      if (this.productReviewsCache.length > 10) {
        this.productReviewsCache.shift();
      }
    }
    return productReview !== null;
  }
}
