import { describe, expect, it } from "vitest";
import { ProductReview } from "../ProductReview";
import { ProductReviewRepo } from "./ProductReviewsRepo";
import { itUnitIntegration } from "server/domain/_mock";

const productReviewData = {
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
  rating: 5,
  title: "title",
  description: "description",
};

describe("addProductReview,", () => {
  itUnitIntegration("should add a product review", () => {
    const productReview = new ProductReview(productReviewData);
    const productReviewRepo = new ProductReviewRepo();
    productReviewRepo.addProductReview(productReview);
    expect(
      productReviewRepo.getAllProductReviews(productReview.ProductId!).length
    ).toBe(1);
  });
});

describe("getProductReview", () => {
  itUnitIntegration("should return the product review", () => {
    const productReview = new ProductReview(productReviewData);
    const productReviewRepo = new ProductReviewRepo();
    productReviewRepo.addProductReview(productReview);
    expect(
      productReviewRepo.getProductReview(
        productReview.PurchaseId,
        productReview.ProductId!
      )
    ).toEqual(productReview);
  });

  itUnitIntegration(
    "should throw an error if the product review is not found",
    () => {
      const productReview = new ProductReview(productReviewData);
      const productReviewRepo = new ProductReviewRepo();
      productReviewRepo.addProductReview(productReview);
      expect(() =>
        productReviewRepo.getProductReview(
          "wrongPurchaseId",
          productReview.ProductId!
        )
      ).toThrow();
    }
  );
});

describe("getAllProductReviews", () => {
  itUnitIntegration("should return all product reviews", () => {
    const productReview = new ProductReview(productReviewData);
    const productReviewRepo = new ProductReviewRepo();
    productReviewRepo.addProductReview(productReview);
    expect(productReviewRepo.getAllProductReviews(productReview.ProductId!))
      .length;
  });
  itUnitIntegration("should return two product reviews", () => {
    const productReview = new ProductReview(productReviewData);
    const productReviewRepo = new ProductReviewRepo();
    productReviewRepo.addProductReview(productReview);
    productReviewRepo.addProductReview(productReview);
    expect(productReviewRepo.getAllProductReviews(productReview.ProductId!))
      .length;
  });
});
