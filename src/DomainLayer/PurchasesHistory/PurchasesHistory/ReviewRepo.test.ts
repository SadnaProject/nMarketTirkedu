import { expect, vi, describe, it } from "vitest";
import { Repos, createRepos } from "../HasRepos";
import { Review } from "../Review";
import { ReviewRepo } from "./ReviewRepo";

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
  it("✅adds a store review", () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    reviewRepo.addStoreReview(review);
    expect(reviewRepo.getAllStoreReviews(review.StoreId!)).toEqual([review]);
  });
});

describe("getStoreReview", () => {
  it("✅gets a store review", () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    reviewRepo.addStoreReview(review);
    expect(reviewRepo.getStoreReview(review.PurchaseId, review.StoreId!)).toBe(
      review
    );
  });
});

describe("getAllStoreReviews", () => {
  it("✅gets all store reviews", () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    reviewRepo.addStoreReview(review);
    expect(reviewRepo.getAllStoreReviews(review.StoreId!)).toEqual([review]);
  });

  it("✅gets all store reviews when there are more than one", () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    const review2 = createReview();
    reviewRepo.addStoreReview(review);
    reviewRepo.addStoreReview(review2);
    expect(reviewRepo.getAllStoreReviews(review.StoreId!)).toEqual([
      review,
      review2,
    ]);
  });
});

describe("doesStoreReviewExist", () => {
  it("✅returns true when store review exists", () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    reviewRepo.addStoreReview(review);
    expect(
      reviewRepo.doesStoreReviewExist(review.PurchaseId, review.StoreId!)
    ).toBe(true);
  });

  it("✅returns false when store review does not exist", () => {
    const reviewRepo = new ReviewRepo();
    const review = createReview();
    expect(
      reviewRepo.doesStoreReviewExist(review.PurchaseId, review.StoreId!)
    ).toBe(false);
  });
});
