import { expect, describe } from "vitest";
import { type Repos, createRepos } from "../_HasRepos";
import { Review } from "../Review";
import { ReviewRepo } from "./ReviewRepo";
import { itUnitIntegration } from "server/domain/_mock";

const reviewData = {
  rating: 5,
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  storeId: "storeId",
};
const createReview = (repos: Repos = createRepos()) =>
  new Review(reviewData).initRepos(repos);

describe("addStoreReview", () => {
  itUnitIntegration("✅adds a store review", () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    reviewRepo.addStoreReview(review);
    expect(reviewRepo.getAllStoreReviews(review.StoreId!)).toEqual([review]);
  });
});

describe("getStoreReview", () => {
  itUnitIntegration("✅gets a store review", () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    reviewRepo.addStoreReview(review);
    expect(reviewRepo.getStoreReview(review.PurchaseId, review.StoreId!)).toBe(
      review
    );
  });
});

describe("getAllStoreReviews", () => {
  itUnitIntegration("✅gets all store reviews", () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    reviewRepo.addStoreReview(review);
    expect(reviewRepo.getAllStoreReviews(review.StoreId!)).toEqual([review]);
  });

  itUnitIntegration(
    "✅gets all store reviews when there are more than one",
    () => {
      const reviewRepo = new ReviewRepo();
      const review = createReview();
      const review2 = createReview();
      reviewRepo.addStoreReview(review);
      reviewRepo.addStoreReview(review2);
      expect(reviewRepo.getAllStoreReviews(review.StoreId!)).toEqual([
        review,
        review2,
      ]);
    }
  );
});
describe("doesStoreReviewExist", () => {
  itUnitIntegration("✅returns true when store review exists", () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    reviewRepo.addStoreReview(review);
    expect(
      reviewRepo.doesStoreReviewExist(review.PurchaseId, review.StoreId!)
    ).toBe(true);
  });

  itUnitIntegration("✅returns false when store review does not exist", () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    expect(
      reviewRepo.doesStoreReviewExist(review.PurchaseId, review.StoreId!)
    ).toBe(false);
  });
});
