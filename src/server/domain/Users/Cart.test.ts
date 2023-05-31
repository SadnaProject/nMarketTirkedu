import { Cart } from "./Cart";
import { beforeEach, describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { getDB } from "server/helpers/_Transactional";
import { resetDB } from "server/helpers/_Transactional";
beforeEach(async () => {
  await resetDB();
  await getDB().user.create({
    data: {
      id: "1",
    },
  });
  await getDB().cart.create({
    data: {
      userId: "1",
    },
  });
});
describe("addProduct", () => {
  it("should add a product to the basket", async () => {
    const cart = new Cart("1");
    const productId = "1";
    const storeId = "1";
    const quantity = 1;
    await cart.addProduct(productId, storeId, quantity);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(1);
    expect(cart.DTO.storeIdToBasket.get(storeId)?.products.length).toBe(1);
    await cart.addProduct(productId, storeId, quantity + 1);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(quantity + 1);
  });
  it("should override the quantity if the product already exists in the basket", async () => {
    const cart = new Cart("1");
    const productId = "1";
    const storeId = "1";
    await expect(() => cart.addProduct(productId, storeId, -1)).rejects.toThrow(
      "Quantity cannot be negative"
    );
  });
});
describe("removeProduct", () => {
  it("should remove a product from the basket", async () => {
    const cart = new Cart("1");
    const productId = "1";
    const storeId = "1";
    const quantity = 1;
    await cart.addProduct(productId, storeId, quantity);
    await cart.removeProduct(productId, storeId);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId).length
    ).toBe(0);
  });
  it("should throw an error if the product is not in the basket", async () => {
    const cart = new Cart("1");
    const productId = "1";
    const storeId = "1";
    const quantity = 1;
    await cart.addProduct(productId, storeId, quantity);
    const productId2 = "2";
    await expect(() => cart.removeProduct(productId2, storeId)).rejects.toThrow(
      "Product not found"
    );
  });
});
describe("editProductQuantity", () => {
  it("should edit the quantity of a product in the basket", async () => {
    const cart = new Cart("1");
    const productId = "1";
    const storeId = "1";
    const quantity = 1;
    await cart.addProduct(productId, storeId, quantity);
    await cart.editProductQuantity(productId, storeId, quantity + 1);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(quantity + 1);
    await cart.editProductQuantity(productId, storeId, quantity);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(quantity);
    await cart.editProductQuantity(productId, storeId, 0);
    expect(
      cart.DTO.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId).length
    ).toBe(0);
  });
  it("should remove the product from the basket if the quantity is below 0", async () => {
    const cart = new Cart("1");
    const productId = "1";
    const storeId = "1";
    const quantity = 1;
    await cart.addProduct(productId, storeId, quantity);
    await expect(() =>
      cart.editProductQuantity(productId, storeId, -1)
    ).rejects.toThrow("Quantity cannot be negative");
  });
});
