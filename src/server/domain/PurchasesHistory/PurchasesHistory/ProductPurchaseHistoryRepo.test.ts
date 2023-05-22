import { describe, expect } from "vitest";
import { ProductPurchase } from "../ProductPurchaseHistory";
import { ProductPurchaseRepo } from "./ProductPurchaseHistoryRepo";
import { itUnitIntegration } from "server/domain/_mock";
import { product } from "ramda";

const productPurchaseData = {
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
  quantity: 1,
  storeId: "storeId",
  price: 1,
};

describe("addProductPurchase", () => {
  itUnitIntegration("should add a product purchase", async () => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    const productPurchaseRepo = new ProductPurchaseRepo();
    await productPurchaseRepo.addProductPurchase(
      productPurchase,
      productPurchaseData.storeId
    );
    const products = await productPurchaseRepo.getProductsPurchaseById(
      productPurchase.PurchaseId
    );
    expect(products.length).toBe(1);
  });
});

describe("getProductsPurchaseById", () => {
  itUnitIntegration("should return the product purchase", async () => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    const productPurchaseRepo = new ProductPurchaseRepo();
    await productPurchaseRepo.addProductPurchase(
      productPurchase,
      productPurchaseData.storeId
    );
    await expect(
      productPurchaseRepo.getProductsPurchaseById(productPurchase.PurchaseId)
    ).resolves.toEqual([productPurchase]);
  });

  itUnitIntegration("should return two product purchases", async () => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    const productPurchaseRepo = new ProductPurchaseRepo();
    await productPurchaseRepo.addProductPurchase(
      productPurchase,
      productPurchaseData.storeId
    );
    await productPurchaseRepo.addProductPurchase(
      productPurchase,
      productPurchaseData.storeId
    );
    await expect(
      productPurchaseRepo.getProductsPurchaseById(productPurchase.PurchaseId)
    ).resolves.toEqual([productPurchase, productPurchase]);
  });
});
