import { expect, vi, describe, it } from "vitest";
import { BasketPurchase, BasketPurchaseDTO } from "./BasketPurchaseHistory";
import { ProductPurchase, ProductPurchaseDTO } from "./ProductPurchaseHistory";
import { BasketProduct } from "../Users/BasketProduct";
import { StoresController } from "../Stores/StoresController";
import { ProductReview } from "./ProductReview";
import { Repos, createRepos } from "./_HasRepos";
import { Review } from "./Review";

const reviewData = {
  rating: 5,
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
};

const createReview = (repos: Repos = createRepos()) =>
  new Review(reviewData).initRepos(repos);

describe("Review constructor", () => {
  it("✅creates a review", () => {
    const review = createReview();
    expect(review.Rating).toBe(reviewData.rating);
    expect(review.Id).toBe(reviewData.id);
    expect(review.CreatedAt).toBe(reviewData.createdAt);
    expect(review.UserId).toBe(reviewData.userId);
    expect(review.PurchaseId).toBe(reviewData.purchaseId);
    expect(review.StoreId).toBe(undefined);
  });

  it("❎gets negative rating", () => {
    expect(() => new Review({ ...reviewData, rating: -1 })).toThrow();
  });

  it("❎gets rating over 5", () => {
    expect(() => new Review({ ...reviewData, rating: 6 })).toThrow();
  });
});

describe("Review to DTO", () => {
  it("✅creates a review DTO", () => {
    const review = createReview();
    const reviewDTO = review.ReviewToDTO();
    expect(reviewDTO.rating).toBe(reviewData.rating);
    expect(reviewDTO.id).toBe(reviewData.id);
    expect(reviewDTO.createdAt).toBe(reviewData.createdAt);
    expect(reviewDTO.userId).toBe(reviewData.userId);
    expect(reviewDTO.purchaseId).toBe(reviewData.purchaseId);
    expect(reviewDTO.storeId).toBe(undefined);
  });
});
