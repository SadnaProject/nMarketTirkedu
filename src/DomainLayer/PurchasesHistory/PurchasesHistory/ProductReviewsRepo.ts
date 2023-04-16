import { ProductReview } from "../ProductReview";

export class ProductReviewRepo {
  private ProductReviews: ProductReview[];

  constructor() {
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
