import { Testable, testable } from "server/domain/_Testable";
import { Review } from "../Review";
import { db } from "server/db";

@testable
export class ReviewRepo extends Testable {
  private Reviews: Review[];

  constructor() {
    super();
    this.Reviews = [];
  }
  public async getStoreReview(
    purchaseId: string,
    storeId: string
  ): Promise<Review> {
    const review = await db.review.findUnique({
      where: {
        purchaseId_storeId: {
          purchaseId: purchaseId,
          storeId: storeId,
        },
      },
    });
    if (!review) {
      throw new Error("No review found");
    }
    return Review.fromDAO(review);
  }
  public async getAllStoreReviews(storeId: string): Promise<Review[]> {
    const reviews = await db.review.findMany({
      where: {
        storeId: storeId,
      },
    });
    return reviews.map((review) => Review.fromDAO(review));
  }
  public async addStoreReview(review: Review): Promise<void> {
    await db.review.create({
      data: {
        rating: review.Rating,
        createdAt: review.CreatedAt,
        userId: review.UserId,
        purchaseId: review.PurchaseId,
        storeId: review.StoreId,
      },
    });
  }
  public async doesStoreReviewExist(
    purchaseId: string,
    storeId: string
  ): Promise<boolean> {
    const review = await db.review.findUnique({
      where: {
        purchaseId_storeId: {
          purchaseId: purchaseId,
          storeId: storeId,
        },
      },
    });
    return review !== null;
  }
}
