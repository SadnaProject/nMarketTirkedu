import { describe, expect } from "vitest";
import { ProductPurchase } from "../ProductPurchaseHistory";
import { ProductPurchaseRepo } from "./ProductPurchaseHistoryRepo";
import { itUnitIntegration } from "server/domain/_mock";

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
  itUnitIntegration("should add a product purchase", () => {
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
  itUnitIntegration("should return the product purchase", () => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    const productPurchaseRepo = new ProductPurchaseRepo();
    productPurchaseRepo.addProductPurchase(productPurchase);
    expect(
      productPurchaseRepo.getProductsPurchaseById(productPurchase.PurchaseId)
    ).toEqual([productPurchase]);
  });

  itUnitIntegration("should return two product purchases", () => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    const productPurchaseRepo = new ProductPurchaseRepo();
    productPurchaseRepo.addProductPurchase(productPurchase);
    productPurchaseRepo.addProductPurchase(productPurchase);
    expect(
      productPurchaseRepo.getProductsPurchaseById(productPurchase.PurchaseId)
    ).toEqual([productPurchase, productPurchase]);
  });
});
