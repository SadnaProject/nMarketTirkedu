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
  ): ProductReview | undefined {
    return this.ProductReviews.find(
      (review) =>
        review.PurchaseId === purchaseId && review.ProductId === productId
    );
  }

  public getAllProductReviews(productId: string): ProductReview[] {
    return this.ProductReviews.filter(
      (review) => review.ProductId === productId
    );
  }
}
