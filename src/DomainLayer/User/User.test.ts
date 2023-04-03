import { describe, expect, it, vi } from "vitest";
import { UserController } from "./UserController";
import { StoreController } from "../Store/StoreController";

//* Vitest Docs: https://vitest.dev/api
const userController = new UserController();
const storeController = new StoreController();
// userController.addUser({id: "123456", name: "username"});
// const storeId = storeController.createStore("123456", "storeName");
// const productId = storeController.addProductToStore("123456", storeId, { name: "productName", price: 10, quantity: 10}); 
const user ="123456";
const product = { name: "productName", price: 10, quantity: 10};
const storeId = "123456";

  describe("test name", () => {
    it("should throw an error because not all function implemented", async () => {
      await expect(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        userController.addProductToCart(user, "productId", 1, storeId);
      }).rejects.toThrow();
    });
  });
  