import { expect, vi, describe, it } from "vitest";
import { BasketPurchase, BasketPurchaseDTO } from "./BasketPurchaseHistory";
import { ProductPurchase, ProductPurchaseDTO } from "./ProductPurchaseHistory";
import { BasketProduct } from "../Users/BasketProduct";
import { StoresController } from "../Stores/StoresController";
import { CartPurchase } from "./CartPurchaseHistory";
import { BasketDTO } from "../Users/Basket";
import { ProductReview } from "./ProductReview";

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
  it("should create a product purchase", () => {
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
  it("should create a product purchase DTO from a basket product DTO", () => {
    vi.spyOn(StoresController.prototype, "getProductPrice").mockReturnValue(1);
    const productPurchaseDTO =
      ProductPurchase.ProductPurchaseDTOFromBasketProductDTO(
        {
          storeProductId: "productId",
          quantity: 1,
        },
        "purchaseId"
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
  it("should return a DTO", () => {
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
  it("should set the review", () => {
    const productPurchase = new ProductPurchase(productPurchaseData);
    const date = new Date();
    const review = new ProductReview({
      title: "title",
      description: "description",
      rating: 1,
      id: "id",
      createdAt: date,
      userId: "userId",
      purchaseId: "purchaseId",
      productId: "productId",
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
