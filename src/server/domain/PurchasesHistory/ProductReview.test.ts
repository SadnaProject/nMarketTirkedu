import { expect, vi, describe, it } from "vitest";
import { BasketPurchase, BasketPurchaseDTO } from "./BasketPurchaseHistory";
import { ProductPurchase, ProductPurchaseDTO } from "./ProductPurchaseHistory";
import { BasketProduct } from "../Users/BasketProduct";
import { StoresController } from "../Stores/StoresController";
import { ProductReview } from "./ProductReview";
import { type Repos, createRepos } from "./_HasRepos";
import { itUnitIntegration } from "../_mock";

const reviewData = {
  rating: 5,
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  storeId: "storeId",
};
const productReviewData = {
  title: "title",
  description: "description",
  productId: "productId",
  ...reviewData,
};

const createProductReview = (repos: Repos = createRepos()) =>
  new ProductReview(productReviewData).initRepos(repos);

describe("ProductReview constructor", () => {
  itUnitIntegration("✅creates a product review", () => {
    const productReview = createProductReview();
    expect(productReview.Rating).toBe(reviewData.rating);
    expect(productReview.CreatedAt).toBe(reviewData.createdAt);
    expect(productReview.UserId).toBe(reviewData.userId);
    expect(productReview.PurchaseId).toBe(reviewData.purchaseId);
    expect(productReview.StoreId).toBe(undefined);
    expect(productReview.Title).toBe(productReviewData.title);
    expect(productReview.Description).toBe(productReviewData.description);
  });

  itUnitIntegration("❎gets negative rating", () => {
    expect(
      () => new ProductReview({ ...productReviewData, rating: -1 })
    ).toThrow();
  });

  itUnitIntegration("❎gets rating over 5", () => {
    expect(
      () => new ProductReview({ ...productReviewData, rating: 6 })
    ).toThrow();
  });
  itUnitIntegration("❎gets storeId and productId", () => {
    expect(
      () => new ProductReview({ ...productReviewData, storeId: "storeId" })
    ).toThrow();
  });
});

describe("ProductReview ToDTO", () => {
  itUnitIntegration("✅returns a DTO", () => {
    const productReview = createProductReview();
    const dto = productReview.ProductReviewToDTO();
    expect(dto).toEqual({
      title: productReviewData.title,
      description: productReviewData.description,
      ...reviewData,
    });
  });
});
