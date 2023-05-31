import { describe, afterEach, beforeEach, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { Basket } from "./Basket";
import { TRPCError } from "@trpc/server";
import { resetDB } from "server/helpers/_Transactional";
import { dbGlobal } from "server/data/helpers/db";
import { getDB } from "server/helpers/_Transactional";
beforeEach(async () => {
  await resetDB();
});
describe("addProduct", () => {
  it("should add a product to the basket", async () => {
    const id = randomUUID();
    await getDB().user.create({
      data: {
        id: id,
      },
    });
    await getDB().cart.create({
      data: {
        userId: id,
      },
    });
    await getDB().store.create({
      data: {
        name: "s",
        id: id,
        isActive: true,
      },
    });
    const basket = new Basket(id, id);
    const productId = randomUUID();
    const quantity = 1;
    await basket.addProduct(productId, quantity);
    expect;
    expect(
      basket.DTO.products.filter((p) => p.storeProductId === productId)[0]
        ?.quantity
    ).toBe(1);
    expect(basket.DTO.products.length).toBe(1);
    await basket.addProduct(productId, quantity + 1);
    expect(
      basket.DTO.products.filter((p) => p.storeProductId === productId)[0]
        ?.quantity
    ).toBe(quantity + 1);
  });
  it("should override the quantity if the product already exists in the basket", async () => {
    const id = randomUUID();
    await getDB().user.create({
      data: {
        id: id,
      },
    });
    await getDB().cart.create({
      data: {
        userId: id,
      },
    });
    await getDB().store.create({
      data: {
        name: "s",
        id: id,
        isActive: true,
      },
    });
    const basket = new Basket(id, id);
    const productId = randomUUID();
    await expect(() => basket.addProduct(productId, -1)).rejects.toThrow(
      "Quantity cannot be negative"
    );
    expect(basket.DTO.products.length).toBe(0);
  });
});
describe("removeProduct", () => {
  it("should remove a product from the basket", async () => {
    const basket = new Basket(randomUUID(), randomUUID());
    const productId = randomUUID();
    const quantity = 1;
    await basket.addProduct(productId, quantity);
    await basket.removeProduct(productId);
    expect(
      basket.DTO.products.filter((p) => p.storeProductId === productId).length
    ).toBe(0);
  });
  it("should throw an error if the product is not in the basket", async () => {
    const basket = new Basket(randomUUID(), randomUUID());
    const productId = randomUUID();
    const quantity = 1;
    await basket.addProduct(productId, quantity);
    await expect(() => basket.removeProduct(randomUUID())).rejects.toThrow(
      "Product not found"
    );
    expect(basket.DTO.products.length).toBe(1);
  });
});
describe("editProductQuantity", () => {
  it("should edit the quantity of a product in the basket", async () => {
    const basket = new Basket(randomUUID(), randomUUID());
    const productId = randomUUID();
    const quantity = 1;
    await basket.addProduct(productId, quantity);
    await basket.editProductQuantity(productId, quantity + 1);
    expect(
      basket.DTO.products.filter((p) => p.storeProductId === productId)[0]
        ?.quantity
    ).toBe(quantity + 1);
    await basket.editProductQuantity(productId, quantity);
    expect(
      basket.DTO.products.filter((p) => p.storeProductId === productId)[0]
        ?.quantity
    ).toBe(quantity);
    await basket.editProductQuantity(productId, 0);
    expect(
      basket.DTO.products.filter((p) => p.storeProductId === productId).length
    ).toBe(0);
  });
  it("should remove the product from the basket if the quantity is below 0", async () => {
    const basket = new Basket(randomUUID(), randomUUID());
    const productId = randomUUID();
    const quantity = 1;
    await basket.addProduct(productId, quantity);
    await expect(() =>
      basket.editProductQuantity(productId, -1)
    ).rejects.toThrow("Quantity cannot be negative");
    expect(
      basket.DTO.products.filter((p) => p.storeProductId === productId)[0]
        ?.quantity
    ).toBe(quantity);
  });
  it("should throw an error if the product is not in the basket", async () => {
    const basket = new Basket(randomUUID(), randomUUID());
    const productId = randomUUID();
    const quantity = 1;
    await basket.addProduct(productId, quantity);
    await expect(() =>
      basket.editProductQuantity(randomUUID(), quantity)
    ).rejects.toThrow("Product not found");
  });
});
