import { Testable, testable } from "server/helpers/_Testable";
import { Review } from "server/domain/PurchasesHistory/Review";
import { getDB } from "server/helpers/_Transactional";

@testable
export class ReviewRepo extends Testable {
  private reviewsCache: Review[];

  constructor() {
    super();
    this.reviewsCache = [];
  }
  public async getStoreReview(
    purchaseId: string,
    storeId: string
  ): Promise<Review> {
    const cachedReview = this.reviewsCache.find(
      (review) => review.PurchaseId === purchaseId && review.StoreId === storeId
    );
    if (cachedReview) {
      this.reviewsCache = this.reviewsCache.filter(
        (review) =>
          review.PurchaseId !== purchaseId || review.StoreId !== storeId
      );
      this.reviewsCache.push(cachedReview);
      return cachedReview;
    }
    const review = await getDB().review.findUnique({
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
    this.reviewsCache.push(Review.fromDAO(review));
    if (this.reviewsCache.length > 10) {
      this.reviewsCache.shift();
    }
    return Review.fromDAO(review);
  }
  public async getAllStoreReviews(storeId: string): Promise<Review[]> {
    const reviews = await getDB().review.findMany({
      where: {
        storeId: storeId,
      },
    });
    return reviews.map((review) => Review.fromDAO(review));
  }
  public async addStoreReview(review: Review): Promise<void> {
    await getDB().review.create({
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
    // check cache first
    const cachedReview = this.reviewsCache.find(
      (review) => review.PurchaseId === purchaseId && review.StoreId === storeId
    );
    if (cachedReview) {
      this.reviewsCache = this.reviewsCache.filter(
        (review) =>
          review.PurchaseId !== purchaseId || review.StoreId !== storeId
      );
      this.reviewsCache.push(cachedReview);
      return true;
    }
    const review = await getDB().review.findUnique({
      where: {
        purchaseId_storeId: {
          purchaseId: purchaseId,
          storeId: storeId,
        },
      },
    });
    if (review) {
      this.reviewsCache.push(Review.fromDAO(review));
      if (this.reviewsCache.length > 10) {
        this.reviewsCache.shift();
      }
      return true;
    }
    return false;
  }
}
