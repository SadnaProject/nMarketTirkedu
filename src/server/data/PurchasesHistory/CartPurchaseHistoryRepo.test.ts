import { describe, expect, beforeEach } from "vitest";
import { CartPurchase } from "server/domain/PurchasesHistory/CartPurchaseHistory";
import { CartPurchaseRepo } from "./CartPurchaseHistoryRepo";
import { type BasketPurchase } from "server/domain/PurchasesHistory/BasketPurchaseHistory";
import { getDB, resetDB } from "server/helpers/_Transactional";
import { itUnitIntegration } from "server/domain/helpers/_mock";

const CartPurchaseData = {
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
  quantity: 1,
  price: 1,
};

const CartPurchaseData2 = {
  id: "id2",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId2",
  productId: "productId",
  quantity: 1,
  price: 1,
};
beforeEach(async () => {
  await resetDB();
  await getDB().user.create({
    data: {
      id: CartPurchaseData.userId,
    },
  });
});

describe("addCartPurchase", () => {
  const storeIdToBasket = new Map<string, BasketPurchase>();

  itUnitIntegration("should add a cart purchase", async () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    await expect(
      cartPurchaseRepo.getPurchaseById(cartPurchase.PurchaseId)
    ).resolves.toEqual(cartPurchase);
  });
});
describe("getPurchaseById", () => {
  const storeIdToBasket = new Map<string, BasketPurchase>();

  itUnitIntegration("should return the cart purchase", async () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    await expect(
      cartPurchaseRepo.getPurchaseById(cartPurchase.PurchaseId)
    ).resolves.toEqual(cartPurchase);
  });
  itUnitIntegration("should throw if purchase not found", async () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    await expect(() =>
      cartPurchaseRepo.getPurchaseById(cartPurchase.PurchaseId)
    ).rejects.toThrow();
  });
});

describe("getPurchasesByUser", () => {
  const storeIdToBasket = new Map<string, BasketPurchase>();

  itUnitIntegration("should return the cart purchase", async () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    await expect(
      cartPurchaseRepo.getPurchasesByUser(cartPurchase.UserId)
    ).resolves.toEqual([cartPurchase]);
  });
  itUnitIntegration("should return two cart purchases", async () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchase2 = new CartPurchase(
      CartPurchaseData2.userId,
      CartPurchaseData2.purchaseId,
      storeIdToBasket,
      CartPurchaseData2.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    await cartPurchaseRepo.addCartPurchase(cartPurchase2);
    await expect(
      cartPurchaseRepo.getPurchasesByUser(cartPurchase.UserId)
    ).resolves.toEqual([cartPurchase, cartPurchase2]);
  });
});
describe("doesPurchaseExist", () => {
  const storeIdToBasket = new Map<string, BasketPurchase>();

  itUnitIntegration("should return true if purchase exists", async () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      storeIdToBasket,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    await expect(
      cartPurchaseRepo.doesPurchaseExist(cartPurchase.PurchaseId)
    ).resolves.toBe(true);
  });
  itUnitIntegration(
    "should return false if purchase does not exist",
    async () => {
      const cartPurchase = new CartPurchase(
        CartPurchaseData.userId,
        CartPurchaseData.purchaseId,
        storeIdToBasket,
        CartPurchaseData.price
      );
      const cartPurchaseRepo = new CartPurchaseRepo();
      await expect(
        cartPurchaseRepo.doesPurchaseExist(cartPurchase.PurchaseId)
      ).resolves.toBe(false);
    }
  );
});
