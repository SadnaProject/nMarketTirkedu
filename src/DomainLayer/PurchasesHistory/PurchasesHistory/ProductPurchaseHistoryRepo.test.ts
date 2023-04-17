import { describe, expect, it } from "vitest";
import { ProductReview } from "../ProductReview";
import { ProductReviewRepo } from "./ProductReviewsRepo";
import { ProductPurchase } from "../ProductPurchaseHistory";
import { ProductPurchaseRepo } from "./ProductPurchaseHistoryRepo";

const productPurchaseData = {
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
  quantity: 1,
  price: 1,
};

describe("addProductPurchase", () => {
  it("should add a product purchase", () => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    const productPurchaseRepo = new ProductPurchaseRepo();
    productPurchaseRepo.addProductPurchase(productPurchase);
    expect(
      productPurchaseRepo.getProductsPurchaseById(productPurchase.PurchaseId)
        .length
    ).toBe(1);
  });
});

describe("getProductsPurchaseById", () => {
  it("should return the product purchase", () => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    const productPurchaseRepo = new ProductPurchaseRepo();
    productPurchaseRepo.addProductPurchase(productPurchase);
    expect(
      productPurchaseRepo.getProductsPurchaseById(productPurchase.PurchaseId)
    ).toEqual([productPurchase]);
  });

  it("should return two product purchases", () => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    const productPurchaseRepo = new ProductPurchaseRepo();
    productPurchaseRepo.addProductPurchase(productPurchase);
    productPurchaseRepo.addProductPurchase(productPurchase);
    expect(
      productPurchaseRepo.getProductsPurchaseById(productPurchase.PurchaseId)
    ).toEqual([productPurchase, productPurchase]);
  });
});
