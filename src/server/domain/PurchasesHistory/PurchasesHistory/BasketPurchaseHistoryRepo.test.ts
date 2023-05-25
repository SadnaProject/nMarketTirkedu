import { beforeEach, describe, expect, it } from "vitest";
import { ProductPurchase } from "../ProductPurchaseHistory";
import { BasketPurchase } from "../BasketPurchaseHistory";
import { BasketPurchaseRepo } from "./BasketPurchaseHistoryRepo";
import { itUnitIntegration } from "server/domain/_mock";
import { getDB } from "server/domain/_Transactional";
import { CartPurchase } from "../CartPurchaseHistory";
import { CartPurchaseRepo } from "./CartPurchaseHistoryRepo";

const products = new Map<string, ProductPurchase>();
const products2 = new Map<string, ProductPurchase>();

const basketPurchase = new BasketPurchase("storeId", products, 1, "purchaseId");

const basketPurchaseData = new Map<string, BasketPurchase>();
basketPurchaseData.set("storeId", basketPurchase);

const CartPurchaseData = {
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
  baskets: basketPurchaseData,
  quantity: 1,
  price: 1,
};

beforeEach(async () => {
  await getDB().user.create({
    data: {
      id: CartPurchaseData.userId,
      name: "name",
      email: "email",
    },
  });
});

describe("addBasketPurchase", () => {
  itUnitIntegration("should add a basket purchase", async (testType) => {
    const cartPurchaseRepo = new CartPurchaseRepo();
    const basketPurchaseRepo = new BasketPurchaseRepo();
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      CartPurchaseData.baskets,
      CartPurchaseData.price
    );
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    await expect(
      basketPurchaseRepo.getPurchaseById(
        basketPurchase.PurchaseId,
        basketPurchase.StoreId
      )
    ).resolves.toEqual(basketPurchase);
  });
});

describe("getPurchaseById", () => {
  const productIdToProductPurchase = new Map<string, ProductPurchase>();
  itUnitIntegration("should return the basket purchase", async () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      CartPurchaseData.baskets,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    const basketPurchaseRepo = new BasketPurchaseRepo();
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    await expect(
      basketPurchaseRepo.getPurchaseById(
        basketPurchase.PurchaseId,
        basketPurchase.StoreId
      )
    ).resolves.toEqual(basketPurchase);
  });
  itUnitIntegration("should throw if purchase not found", async () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      CartPurchaseData.baskets,
      CartPurchaseData.price
    );
    const cartPurchaseRepo = new CartPurchaseRepo();
    const basketPurchaseRepo = new BasketPurchaseRepo();
    await expect(() =>
      basketPurchaseRepo.getPurchaseById(
        basketPurchase.PurchaseId,
        basketPurchase.StoreId
      )
    ).rejects.toThrow("Purchase not found");
  });
});

describe("getPurchaseByStoreId", () => {
  const productIdToProductPurchase = new Map<string, ProductPurchase>();
  itUnitIntegration("should return the basket purchase", async () => {
    const basketPurchaseRepo = new BasketPurchaseRepo();
    const cartPurchaseRepo = new CartPurchaseRepo();
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      CartPurchaseData.baskets,
      CartPurchaseData.price
    );
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    await expect(
      basketPurchaseRepo.getPurchasesByStore(basketPurchase.StoreId)
    ).resolves.toEqual([basketPurchase]);
  });
  itUnitIntegration("it should return one purchase", async () => {
    const basketPurchaseRepo = new BasketPurchaseRepo();
    const cartPurchaseRepo = new CartPurchaseRepo();
    // create new basket and add it to CartPurchaseData.baskets
    const basketPurchase2 = new BasketPurchase(
      "storeId2",
      products2,
      1,
      "purchaseId"
    );
    CartPurchaseData.baskets.set("storeId2", basketPurchase2);
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      CartPurchaseData.baskets,
      CartPurchaseData.price
    );
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    const array = await basketPurchaseRepo.getPurchasesByStore(
      basketPurchase.StoreId
    );
    expect(array.length).toBe(1);
  });
  itUnitIntegration("it should return two purchase", async () => {
    const basketPurchaseRepo = new BasketPurchaseRepo();
    const cartPurchaseRepo = new CartPurchaseRepo();
    // create new basket and add it to CartPurchaseData.baskets
    const basketPurchase2 = new BasketPurchase(
      "storeId",
      products2,
      1,
      "purchaseId2"
    );
    const baskets2 = new Map<string, BasketPurchase>();
    baskets2.set("storeId", basketPurchase2);
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      CartPurchaseData.baskets,
      CartPurchaseData.price
    );
    const cartPurchase2 = new CartPurchase(
      CartPurchaseData.userId,
      "purchaseId2",
      baskets2,
      CartPurchaseData.price
    );
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    await cartPurchaseRepo.addCartPurchase(cartPurchase2);
    const array = await basketPurchaseRepo.getPurchasesByStore(
      basketPurchase.StoreId
    );
    expect(array.length).toBe(2);
  });
});
describe("hasPurchase", () => {
  const productIdToProductPurchase = new Map<string, ProductPurchase>();
  itUnitIntegration("should return true", async () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      CartPurchaseData.baskets,
      CartPurchaseData.price
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    const cartPurchaseRepo = new CartPurchaseRepo();
    await cartPurchaseRepo.addCartPurchase(cartPurchase);
    await expect(
      basketPurchaseRepo.hasPurchase(
        basketPurchase.PurchaseId,
        basketPurchase.StoreId
      )
    ).resolves.toBe(true);
  });
  it("should return false", async () => {
    const cartPurchase = new CartPurchase(
      CartPurchaseData.userId,
      CartPurchaseData.purchaseId,
      CartPurchaseData.baskets,
      CartPurchaseData.price
    );
    const basketPurchaseRepo = new BasketPurchaseRepo();
    const cartPurchaseRepo = new CartPurchaseRepo();
    await expect(
      basketPurchaseRepo.hasPurchase(
        basketPurchase.PurchaseId,
        basketPurchase.StoreId
      )
    ).resolves.toBe(false);
  });
});
