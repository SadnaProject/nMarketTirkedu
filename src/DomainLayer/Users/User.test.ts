import { describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { StoresController } from "../Stores/StoresController";
import { AuthController } from "../Auth/AuthController";
import { JobsController } from "../Jobs/JobsController";
import { PurchasesHistoryController } from "../PurchasesHistory/PurchasesHistoryController";
import { UsersController } from "./UsersController";
//* Vitest Docs: https://vitest.dev/api
// userController.addUser({id: "123456", name: "username"});
// const storeId = storeController.createStore("123456", "storeName");
// const productId = storeController.addProductToStore("123456", storeId, { name: "productName", price: 10, quantity: 10}); 
const storesController = new StoresController();
const authController = new AuthController();
const jobsController = new JobsController();
const purchasesHistoryController = new PurchasesHistoryController();
const usersController = new UsersController();

const controllers = {
  Stores: storesController,
  Auth: authController,
  Jobs: jobsController,
  PurchasesHistory: purchasesHistoryController,
  Users: usersController,
};

storesController.initControllers(controllers);
authController.initControllers(controllers);
jobsController.initControllers(controllers);
purchasesHistoryController.initControllers(controllers);
usersController.initControllers(controllers);
const userId =randomUUID();
const productId = randomUUID();
controllers.Users.addUser(userId, "username");
describe("add product", () => {
    it("should test the add product functionality ",  () => {
      const sizeBefore = controllers.Users.getCart(userId).storeIdToBasket.size;
      vi.spyOn(controllers.Stores,"isProductQuantityInStock").mockReturnValueOnce(true);
      const storeId = randomUUID();
      vi.spyOn(controllers.Stores,"getStoreIdByProductId").mockReturnValueOnce(storeId);
      controllers.Users.addProductToCart(userId, productId, 5);
      const sizeAfter = controllers.Users.getCart(userId).storeIdToBasket.size;
      expect(sizeBefore).toBe(0);
      expect(sizeAfter).toBe(sizeBefore + 1);
      expect(controllers.Users.getCart(userId).storeIdToBasket.get(storeId)?.products.length).toBe(1);
      expect(controllers.Users.getCart(userId).storeIdToBasket.get(storeId)?.products[0]?.quantity).toBe(5);
    });
    it("should test edge cases in add product functionality ",  () => {
      const storeId = randomUUID();
      vi.spyOn(controllers.Stores,"getStoreIdByProductId").mockReturnValue(storeId);
      vi.spyOn(controllers.Stores,"isProductQuantityInStock").mockReturnValueOnce(true);
      expect(()=>controllers.Users.addProductToCart("Blabla",productId,10)).toThrow("User not found");
      vi.spyOn(controllers.Stores,"isProductQuantityInStock").mockReturnValueOnce(false);
      expect(()=>controllers.Users.addProductToCart(userId,productId,100)).toThrow("store don't have such amount of product");
      vi.spyOn(controllers.Stores,"isProductQuantityInStock").mockReturnValueOnce(true);
      expect(()=>controllers.Users.addProductToCart(userId,productId,-10)).toThrow("Quantity cannot be negative");
    });
  });
  