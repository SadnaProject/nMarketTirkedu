import { expect, vi, describe, it } from "vitest";
import { ProductPurchase } from "./ProductPurchaseHistory";
import { ProductReview } from "./ProductReview";
import { itUnitIntegration } from "../helpers/_mock";
import {
  createMockControllers,
  type createTestControllers,
} from "../helpers/_createControllers";
import { createPromise } from "../../data/Stores/helpers/_data";

let controllers: ReturnType<typeof createTestControllers>;
const productPurchaseData = {
  id: "id",
  createdAt: new Date(),
  userId: "userId",
  purchaseId: "purchaseId",
  productId: "productId",
  quantity: 1,
  price: 1,
};

describe("constructor", () => {
  itUnitIntegration("should create a product purchase", (testType) => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    expect(productPurchase).toEqual({
      purchaseId: productPurchaseData.purchaseId,
      productId: productPurchaseData.productId,
      quantity: productPurchaseData.quantity,
      price: productPurchaseData.price,
    });
  });
});

describe("ProductPurchaseDTOFromBasketProductDTO", () => {
  it("should create a product purchase DTO from a basket product DTO", async () => {
    // add product to store
    controllers = createMockControllers("PurchasesHistory");
    vi.spyOn(controllers.Stores, "getProductPrice").mockReturnValue(
      createPromise(1)
    );
    const productPurchaseDTO =
      await controllers.PurchasesHistory.ProductPurchaseDTOFromBasketProductDTO(
        {
          storeProductId: "productId",
          quantity: 1,
          storeId: "storeId",
          userId: "userId",
        },
        "purchaseId",
        "userId"
      );
    expect(productPurchaseDTO).toEqual({
      purchaseId: "purchaseId",
      productId: "productId",
      quantity: 1,
      price: 1,
    });
  });
});

describe("ToDTO", () => {
  itUnitIntegration("should return a DTO", () => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    const dto = productPurchase.ToDTO();
    expect(dto).toEqual({
      purchaseId: productPurchaseData.purchaseId,
      productId: productPurchaseData.productId,
      quantity: productPurchaseData.quantity,
      price: productPurchaseData.price,
    });
  });
});

describe("setReview", () => {
  itUnitIntegration("should set the review", () => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    const date = new Date();
    const review = new ProductReview({
      title: "title",
      description: "description",
      rating: 1,
      createdAt: date,
      userId: "userId",
      purchaseId: "purchaseId",
      productId: "productId",
      storeId: "storeId",
    });
    productPurchase.setReview(review);
    expect(productPurchase).toEqual({
      purchaseId: productPurchaseData.purchaseId,
      productId: productPurchaseData.productId,
      quantity: productPurchaseData.quantity,
      price: productPurchaseData.price,
      review: review,
    });
  });
});
