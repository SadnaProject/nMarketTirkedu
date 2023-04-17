import { expect, vi, describe, it } from "vitest";
import {
  BasketPurchase,
  type BasketPurchaseDTO,
} from "./BasketPurchaseHistory";
import {
  ProductPurchase,
  type ProductPurchaseDTO,
} from "./ProductPurchaseHistory";
import { BasketProduct } from "../Users/BasketProduct";
import { StoresController } from "../Stores/StoresController";
import { itUnitIntegration } from "../_mock";

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

describe("constructor", () => {
  itUnitIntegration("should create a BasketPurchase", () => {
    const products = new Map<string, ProductPurchase>([
      ["productId", new ProductPurchase(productPurchaseData)],
    ]);
    const basketPurchase = new BasketPurchase(
      "storeId",
      products,
      1,
      "purchaseId"
    );
    expect(basketPurchase).toEqual(basketPurchaseData);
  });
});

describe("ToDTO", () => {
  itUnitIntegration("should return a DTO", () => {
    const products = new Map<string, ProductPurchase>([
      ["productId", new ProductPurchase(productPurchaseData)],
    ]);
    const basketPurchase = new BasketPurchase(
      "storeId",
      products,
      1,
      "purchaseId"
    );
    //mock productPurchase.ToDTO()
    vi.spyOn(ProductPurchase.prototype, "ToDTO").mockReturnValueOnce({
      purchaseId: "purchaseId",
      productId: "productId",
      quantity: 1,
      price: 1,
    });
    const dto = basketPurchase.ToDTO();
    expect(dto).toEqual(basketPurchaseData);
  });
});

describe("FromDTO", () => {
  itUnitIntegration("should return a BasketPurchase", () => {
    vi.spyOn(ProductPurchase, "fromDTO").mockReturnValueOnce(
      new ProductPurchase(productPurchaseData)
    );
    const basketPurchaseDTO: BasketPurchaseDTO = {
      storeId: "storeId",
      products: new Map<string, ProductPurchaseDTO>([
        ["productId", productPurchaseData],
      ]),
      price: 1,
      purchaseId: "purchaseId",
    };
    const basketPurchase = BasketPurchase.fromDTO(basketPurchaseDTO);
    expect(basketPurchase).toEqual(basketPurchaseData);
  });
});

describe("BasketPurchaseDTOFromBasketDTO", () => {
  it("should return a BasketPurchaseDTO", () => {
    const basketProductDTO = {
      storeProductId: "productId",
      quantity: 1,
    };
    const basketDTO = {
      storeId: "storeId",
      products: [basketProductDTO],
    };
    vi.spyOn(
      ProductPurchase,
      "ProductPurchaseDTOFromBasketProductDTO"
    ).mockReturnValueOnce({
      purchaseId: "purchaseId",
      productId: "productId",
      quantity: 1,
      price: 1,
    });
    vi.spyOn(StoresController.prototype, "getBasketPrice").mockReturnValueOnce(
      1
    );
    const basketPurchaseDTO = BasketPurchase.BasketPurchaseDTOFromBasketDTO(
      basketDTO,
      "purchaseId",
      "userId"
    );
    expect(basketPurchaseDTO).toEqual({
      purchaseId: "purchaseId",
      storeId: "storeId",
      products: new Map<string, ProductPurchaseDTO>([
        [
          "productId",
          {
            purchaseId: "purchaseId",
            productId: "productId",
            quantity: 1,
            price: 1,
          },
        ],
      ]),
      price: 1,
    });
  });
});
