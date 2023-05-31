import { beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "crypto";
import { User } from "./User";
import { Notification } from "./Notification";
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
    const user = new User(id);
    const productId = randomUUID();
    const quantity = 1;
    const storeId = randomUUID();
    await user.addProductToCart(productId, quantity, storeId);
    expect(user.Cart.storeIdToBasket.get(storeId)?.products.length).toBe(1);
    expect(
      user.Cart.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(quantity);
    await user.addProductToCart(productId, quantity + 1, storeId);
    expect(
      user.Cart.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
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
    const user = new User(id);
    const productId = randomUUID();
    const quantity = 1;
    const storeId = randomUUID();
    await user.addProductToCart(productId, quantity, storeId);
    await expect(() =>
      user.addProductToCart(productId, -1, storeId)
    ).rejects.toThrow("Quantity cannot be negative");
  });
});
describe("removeProduct", () => {
  it("should remove a product from the basket", async () => {
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
    const user = new User(id);
    const productId = randomUUID();
    const quantity = 1;
    const storeId = randomUUID();
    await user.addProductToCart(productId, quantity, storeId);
    await user.removeProductFromCart(productId, storeId);
    expect(
      user.Cart.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId).length
    ).toBe(0);
  });
  it("should throw an error if the product is not in the basket", async () => {
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
    const user = new User(id);
    const productId = randomUUID();
    const quantity = 1;
    const storeId = randomUUID();
    await user.addProductToCart(productId, quantity, storeId);
    await expect(() =>
      user.removeProductFromCart(randomUUID(), storeId)
    ).rejects.toThrow("Product not found");
  });
});
describe("editProductQuantity", () => {
  it("should edit the quantity of a product in the basket", async () => {
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
    const user = new User(id);
    const productId = randomUUID();
    const quantity = 1;
    const storeId = randomUUID();
    await user.addProductToCart(productId, quantity, storeId);
    await user.editProductQuantityInCart(productId, storeId, quantity + 1);
    expect(
      user.Cart.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(quantity + 1);
    await user.editProductQuantityInCart(productId, storeId, quantity);
    expect(
      user.Cart.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(quantity);
    await user.editProductQuantityInCart(productId, storeId, 0);
    expect(
      user.Cart.storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId).length
    ).toBe(0);
  });
  it("should remove the product from the basket if the quantity is below 0", async () => {
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
    const user = new User(id);
    const productId = randomUUID();
    const quantity = 1;
    const storeId = randomUUID();
    await user.addProductToCart(productId, quantity, storeId);
    await expect(() =>
      user.editProductQuantityInCart(productId, storeId, -1)
    ).rejects.toThrow("Quantity cannot be negative");
  });
});
describe("addNotification", () => {
  it("should add a notification to the user", async () => {
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
    const user = new User(id);
    await user.addNotification(new Notification("test", "test"));
    expect(user.Notifications.length).toBe(1);
  });
});
describe("readNotification", () => {
  it("should read a notification", async () => {
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
    const user = new User(id);
    const notification = new Notification("test", "test");
    const notificationId = notification.Id;
    await user.addNotification(notification);
    await user.readNotification(notificationId);
    expect(
      user.Notifications.filter((n) => n.Id === notificationId)[0]?.IsRead
    ).toBe(true);
  });
  it("should throw an error if the notification is not found", async () => {
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
    const user = new User(id);
    const notificationId = randomUUID();
    await expect(() => user.readNotification(notificationId)).rejects.toThrow(
      TRPCError
    );
  });
});
