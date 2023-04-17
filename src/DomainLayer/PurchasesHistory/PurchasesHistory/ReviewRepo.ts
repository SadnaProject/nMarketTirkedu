import { Testable, testable } from "~/_Testable";
import { type Review } from "../Review";

@testable
export class ReviewRepo extends Testable {
  private Reviews: Review[];

  constructor() {
    super();
    this.Reviews = [];
  }
  public getStoreReview(purchaseId: string, storeId: string): Review {
    const review = this.Reviews.find(
      (review) => review.PurchaseId === purchaseId && review.StoreId === storeId
    );
    if (!review) {
      throw new Error("No review found");
    }
    return review;
  }
  public getAllStoreReviews(storeId: string): Review[] {
    return this.Reviews.filter((review) => review.StoreId === storeId);
  }
  public addStoreReview(review: Review): void {
    this.Reviews.push(review);
  }
  public doesStoreReviewExist(purchaseId: string, storeId: string): boolean {
    return this.Reviews.some(
      (review) => review.PurchaseId === purchaseId && review.StoreId === storeId
    );
  }
}
