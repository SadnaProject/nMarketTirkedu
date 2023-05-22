import { describe, expect, beforeEach } from "vitest";
import { ProductPurchase } from "../ProductPurchaseHistory";
import { ProductPurchaseRepo } from "./ProductPurchaseHistoryRepo";
import { itUnitIntegration } from "server/domain/_mock";
import { BasketPurchase } from "../BasketPurchaseHistory";
import { CartPurchase } from "../CartPurchaseHistory";
import { CartPurchaseRepo } from "./CartPurchaseHistoryRepo";
import { db } from "server/db";

const productPurchase = new ProductPurchase({
  productId: "productId",
  quantity: 1,
  price: 1,
  purchaseId: "purchaseId",
});

const productPurchase2 = new ProductPurchase({
  productId: "productId2",
  quantity: 1,
  price: 1,
  purchaseId: "purchaseId",
});

const basketPurchase2 = new BasketPurchase(
  "storeId",
  new Map<string, ProductPurchase>([
    [productPurchase2.ProductId, productPurchase2],
    [productPurchase.ProductId, productPurchase],
  ]),
  2,
  "purchaseId"
);

const basketPurchase = new BasketPurchase(
  "storeId",
  new Map<string, ProductPurchase>([["productId", productPurchase]]),
  1,
  "purchaseId"
);

const cartPurchase2 = new CartPurchase(
  "userId",
  "purchaseId",
  new Map<string, BasketPurchase>([["storeId", basketPurchase2]]),
  2
);

const cartPurchase = new CartPurchase(
  "userId",
  "purchaseId",
  new Map<string, BasketPurchase>([["storeId", basketPurchase]]),
  1
);

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

beforeEach(async () => {
  await db.productPurchase.deleteMany({});
  await db.basketPurchase.deleteMany({});
  await db.cartPurchase.deleteMany({});
  await db.user.deleteMany({});
  await db.user.create({
    data: {
      id: "userId",
    },
  });
});

describe("addProductPurchase", () => {
  itUnitIntegration("should add a product purchase", async () => {
    const cartPurchaseRepo = new CartPurchaseRepo();
    const productPurchaseRepo = new ProductPurchaseRepo();
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    const products = await productPurchaseRepo.getProductsPurchaseById(
      productPurchase.PurchaseId
    );
    expect(products.length).toBe(1);
  });
});

describe("getProductsPurchaseById", () => {
  itUnitIntegration("should return the product purchase", async () => {
    const productPurchaseRepo = new ProductPurchaseRepo();
    const cartPurchaseRepo = new CartPurchaseRepo();
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    await expect(
      productPurchaseRepo.getProductsPurchaseById(productPurchase.PurchaseId)
    ).resolves.toEqual([productPurchase]);
  });

  itUnitIntegration("should return two product purchases", async () => {
    const productPurchaseRepo = new ProductPurchaseRepo();
    const cartPurchaseRepo = new CartPurchaseRepo();
    await cartPurchaseRepo.addCartPurchase(cartPurchase2);
    await expect(
      productPurchaseRepo.getProductsPurchaseById(productPurchase.PurchaseId)
    ).resolves.toEqual([productPurchase2, productPurchase]);
  });
});
