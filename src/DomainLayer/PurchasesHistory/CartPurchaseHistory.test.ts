import { expect, vi, describe, it } from "vitest";
import { BasketPurchase, BasketPurchaseDTO } from "./BasketPurchaseHistory";
import { ProductPurchase, ProductPurchaseDTO } from "./ProductPurchaseHistory";
import { BasketProduct } from "../Users/BasketProduct";
import { StoresController } from "../Stores/StoresController";
import { CartPurchase } from "./CartPurchaseHistory";
import { BasketDTO } from "../Users/Basket";

const productPurchaseData = {
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
  quantity: 1,
  price: 1,
};
const basketPurchaseData = {
  //products : Map<string, ProductPurchase>, price: number
  storeId: "storeId",
  products: new Map<string, ProductPurchase>([
    ["productId", new ProductPurchase(productPurchaseData)],
  ]),
  price: 1,
  purchaseId: "purchaseId",
};
const cartPurchaseData = {
  //storeIdToBasketPurchases: Map<string, BasketPurchase>, totalPrice: number
  purchaseId: "purchaseId",
  userId: "userId",
  storeIdToBasketPurchases: new Map<string, BasketPurchase>([
    [
      "storeId",
      new BasketPurchase(
        basketPurchaseData.storeId,
        basketPurchaseData.products,
        basketPurchaseData.price,
        basketPurchaseData.purchaseId
      ),
    ],
  ]),
  totalPrice: 1,
  creditCard: "creditCard",
};

describe("constructor", () => {
  it("should create a CartPurchase", () => {
    const cartPurchase = new CartPurchase(
      "userId",
      "purchaseId",
      new Map<string, BasketPurchase>([
        [
          "storeId",
          new BasketPurchase(
            basketPurchaseData.storeId,
            basketPurchaseData.products,
            basketPurchaseData.price,
            basketPurchaseData.purchaseId
          ),
        ],
      ]),
      1
    );
    expect(cartPurchase).toEqual({
      purchaseId: "purchaseId",
      userId: "userId",
      storeIdToBasketPurchases: new Map<string, BasketPurchase>([
        [
          "storeId",
          new BasketPurchase(
            basketPurchaseData.storeId,
            basketPurchaseData.products,
            basketPurchaseData.price,
            basketPurchaseData.purchaseId
          ),
        ],
      ]),
      totalPrice: 1,
    });
  });
});

describe("ToDTO", () => {
  it("should return a DTO", () => {
    const cartPurchase = new CartPurchase(
      "userId",
      "purchaseId",
      new Map<string, BasketPurchase>([
        [
          "storeId",
          new BasketPurchase(
            basketPurchaseData.storeId,
            basketPurchaseData.products,
            basketPurchaseData.price,
            basketPurchaseData.purchaseId
          ),
        ],
      ]),
      1
    );
    //mock basketPurchase.ToDTO()
    vi.spyOn(BasketPurchase.prototype, "ToDTO").mockReturnValueOnce({
      storeId: "storeId",
      products: new Map<string, ProductPurchaseDTO>([
        ["productId", productPurchaseData],
      ]),
      price: 1,
      purchaseId: "purchaseId",
    });
    const dto = cartPurchase.ToDTO();
    expect(dto).toEqual({
      purchaseId: "purchaseId",
      userId: "userId",
      storeIdToBasketPurchases: new Map<string, BasketPurchaseDTO>([
        [
          "storeId",
          {
            storeId: "storeId",
            products: new Map<string, ProductPurchaseDTO>([
              ["productId", productPurchaseData],
            ]),
            price: 1,
            purchaseId: "purchaseId",
          },
        ],
      ]),
      totalPrice: 1,
    });
  });
});

describe("fromDTO", () => {
  it("should return a CartPurchase", () => {
    vi.spyOn(BasketPurchase, "fromDTO").mockReturnValueOnce(
      new BasketPurchase(
        basketPurchaseData.storeId,
        basketPurchaseData.products,
        basketPurchaseData.price,
        basketPurchaseData.purchaseId
      )
    );
    const cartPurchase = CartPurchase.fromDTO({
      purchaseId: "purchaseId",
      userId: "userId",
      storeIdToBasketPurchases: new Map<string, BasketPurchaseDTO>([
        [
          "storeId",
          {
            storeId: "storeId",
            products: new Map<string, ProductPurchaseDTO>([
              ["productId", productPurchaseData],
            ]),
            price: 1,
            purchaseId: "purchaseId",
          },
        ],
      ]),
      totalPrice: 1,
    });
    expect(cartPurchase).toEqual({
      purchaseId: "purchaseId",
      userId: "userId",
      storeIdToBasketPurchases: new Map<string, BasketPurchase>([
        [
          "storeId",
          new BasketPurchase(
            basketPurchaseData.storeId,
            basketPurchaseData.products,
            basketPurchaseData.price,
            basketPurchaseData.purchaseId
          ),
        ],
      ]),
      totalPrice: 1,
    });
  });
});
