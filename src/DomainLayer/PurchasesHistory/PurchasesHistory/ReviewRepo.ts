import { Review } from "../Review";

export class ReviewRepo {
  private Reviews: Review[];

  constructor() {
    this.Reviews = [];
  }
  public Review(ProductReview: Review) {
    this.Reviews.push(ProductReview);
  }
  public getStoreReview(
    purchaseId: string,
    storeId: string
  ): Review | undefined {
    return this.Reviews.find(
      (review) => review.PurchaseId === purchaseId && review.StoreId === storeId
    );
  }
  public getAllStoreReviews(storeId: string): Review[] {
    return this.Reviews.filter((review) => review.StoreId === storeId);
  }
  public addStoreReview(review: Review): void {
    this.Reviews.push(review);
  }
}
