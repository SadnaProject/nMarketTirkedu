import { describe, expect, it } from "vitest";
import { ProductReview } from "../ProductReview";
import { ProductReviewRepo } from "./ProductReviewsRepo";
import { ProductPurchase } from "../ProductPurchaseHistory";
import { ProductPurchaseRepo } from "./ProductPurchaseHistoryRepo";
import { CartPurchase } from "../CartPurchaseHistory";
import { CartPurchaseRepo } from "./CartPurchaseHistoryRepo";
import { type BasketPurchase } from "../BasketPurchaseHistory";
import { itUnitIntegration } from "@domain/_mock";

const CartPurchaseData = {
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
  quantity: 1,
  price: 1,
};

describe("addCartPurchase", () => {
  const storeIdToBasket = new Map<string, BasketPurchase>();

  itUnitIntegration("should add a cart purchase", () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    cartPurchaseRepo.addCartPurchase(cartPurchase);
    expect(cartPurchaseRepo.getPurchaseById(cartPurchase.PurchaseId)).toEqual(
      cartPurchase
    );
  });
});
describe("getPurchaseById", () => {
  const storeIdToBasket = new Map<string, BasketPurchase>();

  itUnitIntegration("should return the cart purchase", () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    cartPurchaseRepo.addCartPurchase(cartPurchase);
    expect(cartPurchaseRepo.getPurchaseById(cartPurchase.PurchaseId)).toEqual(
      cartPurchase
    );
  });
  itUnitIntegration("should throw if purchase not found", () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    expect(() =>
      cartPurchaseRepo.getPurchaseById(cartPurchase.PurchaseId)
    ).toThrow();
  });
});

describe("getPurchasesByUser", () => {
  const storeIdToBasket = new Map<string, BasketPurchase>();

  itUnitIntegration("should return the cart purchase", () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    cartPurchaseRepo.addCartPurchase(cartPurchase);
    expect(cartPurchaseRepo.getPurchasesByUser(cartPurchase.UserId)).toEqual([
      cartPurchase,
    ]);
  });
  itUnitIntegration("should return two cart purchases", () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    cartPurchaseRepo.addCartPurchase(cartPurchase);
    cartPurchaseRepo.addCartPurchase(cartPurchase);
    expect(cartPurchaseRepo.getPurchasesByUser(cartPurchase.UserId)).toEqual([
      cartPurchase,
      cartPurchase,
    ]);
  });
});
describe("doesPurchaseExist", () => {
  const storeIdToBasket = new Map<string, BasketPurchase>();

  itUnitIntegration("should return true if purchase exists", () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    cartPurchaseRepo.addCartPurchase(cartPurchase);
    expect(cartPurchaseRepo.doesPurchaseExist(cartPurchase.PurchaseId)).toBe(
      true
    );
  });
  itUnitIntegration("should return false if purchase does not exist", () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    expect(cartPurchaseRepo.doesPurchaseExist(cartPurchase.PurchaseId)).toBe(
      false
    );
  });
});
