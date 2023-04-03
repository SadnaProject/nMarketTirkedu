import { describe, expect, it, vi } from "vitest";
import { UserController } from "./UserController";
import { StoreController } from "../Store/StoreController";

//* Vitest Docs: https://vitest.dev/api
const userController = new UserController();
const storeController = new StoreController();
userController.addUser({id: "123456", name: "username"});
const storeId = storeController.createStore("123456", "storeName");
const productId = storeController.addProductToStore("123456", storeId, { name: "productName", price: 10, quantity: 10}); 
const user ="123456";

describe("add product to cart", () => {
    it("mock", () => {
        userController.addProductToCart(user, productId, 1, storeId);
        expect(userController.getCart(user).storeIdToBasket.size).toBe(1);
  });
});


