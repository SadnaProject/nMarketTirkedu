import { describe, expect, it } from "vitest";
import { ProductReview } from "../ProductReview";
import { ProductReviewRepo } from "./ProductReviewsRepo";
import { ProductPurchase } from "../ProductPurchaseHistory";
import { ProductPurchaseRepo } from "./ProductPurchaseHistoryRepo";
import { CartPurchase } from "../CartPurchaseHistory";
import { CartPurchaseRepo } from "./CartPurchaseHistoryRepo";
import { BasketPurchase } from "../BasketPurchaseHistory";

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

  it("should add a cart purchase", () => {
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

  it("should return the cart purchase", () => {
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
  it("should throw if purchase not found", () => {
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

  it("should return the cart purchase", () => {
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
  it("should return two cart purchases", () => {
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

  it("should return true if purchase exists", () => {
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
  it("should return false if purchase does not exist", () => {
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
