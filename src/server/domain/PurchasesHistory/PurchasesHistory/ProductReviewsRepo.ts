import { Testable, testable } from "@/server/_Testable";
import { type ProductReview } from "../ProductReview";

@testable
export class ProductReviewRepo extends Testable {
  private ProductReviews: ProductReview[];

  constructor() {
    super();
    this.ProductReviews = [];
  }
  public addProductReview(ProductReview: ProductReview) {
    this.ProductReviews.push(ProductReview);
  }
  public getProductReview(
    purchaseId: string,
    productId: string
  ): ProductReview {
    const productReview = this.ProductReviews.find(
      (review) =>
        review.PurchaseId === purchaseId && review.ProductId === productId
    );
    if (!productReview) {
      throw new Error("Product review not found");
    }
    return productReview;
  }

  public getAllProductReviews(productId: string): ProductReview[] {
    return this.ProductReviews.filter(
      (review) => review.ProductId === productId
    );
  }

  public doesProductReviewExist(
    purchaseId: string,
    productId: string
  ): boolean {
    return this.ProductReviews.some(
      (review) =>
        review.PurchaseId === purchaseId && review.ProductId === productId
    );
  }
}
