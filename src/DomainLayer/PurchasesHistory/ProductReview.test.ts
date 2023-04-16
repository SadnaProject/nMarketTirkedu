import { expect, vi, describe, it } from "vitest";
import { BasketPurchase, BasketPurchaseDTO } from "./BasketPurchaseHistory";
import { ProductPurchase, ProductPurchaseDTO } from "./ProductPurchaseHistory";
import { BasketProduct } from "../Users/BasketProduct";
import { StoresController } from "../Stores/StoresController";
import { ProductReview } from "./ProductReview";
import { Repos, createRepos } from "./HasRepos";

const reviewData = {
  rating: 5,
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
};
const productReviewData = {
  title: "title",
  description: "description",
  ...reviewData,
};

const createProductReview = (repos: Repos = createRepos()) =>
  new ProductReview(productReviewData).initRepos(repos);

describe("ProductReview constructor", () => {
  it("✅creates a product review", () => {
    const productReview = createProductReview();
    expect(productReview.Rating).toBe(reviewData.rating);
    expect(productReview.Id).toBe(reviewData.id);
    expect(productReview.CreatedAt).toBe(reviewData.createdAt);
    expect(productReview.UserId).toBe(reviewData.userId);
    expect(productReview.PurchaseId).toBe(reviewData.purchaseId);
    expect(productReview.StoreId).toBe(undefined);
    expect(productReview.Title).toBe(productReviewData.title);
    expect(productReview.Description).toBe(productReviewData.description);
  });

  it("❎gets negative rating", () => {
    expect(
      () => new ProductReview({ ...productReviewData, rating: -1 })
    ).toThrow();
  });

  it("❎gets rating over 5", () => {
    expect(
      () => new ProductReview({ ...productReviewData, rating: 6 })
    ).toThrow();
  });
  it("❎gets storeId and productId", () => {
    expect(
      () => new ProductReview({ ...productReviewData, storeId: "storeId" })
    ).toThrow();
  });
  it("❎gets undefined productId", () => {
    expect(
      () => new ProductReview({ ...productReviewData, productId: undefined })
    ).toThrow();
  });
});

describe("ProductReview ToDTO", () => {
  it("✅returns a DTO", () => {
    const productReview = createProductReview();
    const dto = productReview.ProductReviewToDTO();
    expect(dto).toEqual({
      title: productReviewData.title,
      description: productReviewData.description,
      ...reviewData,
    });
  });
});
