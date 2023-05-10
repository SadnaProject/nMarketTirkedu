import { Cart } from "./Cart";
import { describe, expect, it } from "vitest";
describe("addProduct", () => {
  it("should add a product to the basket", () => {
    const cart = new Cart();
    const productId = "1";
    const storeId = "1";
    const quantity = 1;
    cart.addProduct(productId, storeId, quantity);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(1);
    expect(cart.DTO.storeIdToBasket.get(storeId)?.products.length).toBe(1);
    cart.addProduct(productId, storeId, quantity + 1);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(quantity + 1);
  });
  it("should override the quantity if the product already exists in the basket", () => {
    const cart = new Cart();
    const productId = "1";
    const storeId = "1";
    expect(() => cart.addProduct(productId, storeId, -1)).toThrow();
  });
});
describe("removeProduct", () => {
  it("should remove a product from the basket", () => {
    const cart = new Cart();
    const productId = "1";
    const storeId = "1";
    const quantity = 1;
    cart.addProduct(productId, storeId, quantity);
    cart.removeProduct(productId, storeId);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId).length
    ).toBe(0);
  });
  it("should throw an error if the product is not in the basket", () => {
    const cart = new Cart();
    const productId = "1";
    const storeId = "1";
    const quantity = 1;
    cart.addProduct(productId, storeId, quantity);
    const productId2 = "2";
    expect(() => cart.removeProduct(productId2, storeId)).toThrow();
  });
});
describe("editProductQuantity", () => {
  it("should edit the quantity of a product in the basket", () => {
    const cart = new Cart();
    const productId = "1";
    const storeId = "1";
    const quantity = 1;
    cart.addProduct(productId, storeId, quantity);
    cart.editProductQuantity(productId, storeId, quantity + 1);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(quantity + 1);
    cart.editProductQuantity(productId, storeId, quantity);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(quantity);
    cart.editProductQuantity(productId, storeId, 0);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId).length
    ).toBe(0);
  });
  it("should remove the product from the basket if the quantity is below 0", () => {
    const cart = new Cart();
    const productId = "1";
    const storeId = "1";
    const quantity = 1;
    cart.addProduct(productId, storeId, quantity);
    expect(() => cart.editProductQuantity(productId, storeId, -1)).toThrow();
  });
});
