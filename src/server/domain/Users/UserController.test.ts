import { describe ,afterEach, beforeEach , expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import {
  createMockControllers,
} from "../_createControllers";
//* Vitest Docs: https://vitest.dev/api
// userController.addUser({id: "123456", name: "username"});
// const storeId = storeController.createStore("123456", "storeName");
// const productId = storeController.addProductToStore("123456", storeId, { name: "productName", price: 10, quantity: 10});
const controllers = createMockControllers("Users"); 
let userId = randomUUID();
let productId = "";
beforeEach(() => {
  controllers.Users.addUser(userId);
});
afterEach(()=> {
  controllers.Users.removeUser(userId);
}); 
describe("add product", () => {
  it("should test the add product functionality ", () => {
    
    const sizeBefore = controllers.Users.getCart(userId).storeIdToBasket.size;
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockReturnValueOnce(true);
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockReturnValue(
      storeId
    );
    controllers.Users.addProductToCart(userId, productId, 5);
    const sizeAfter = controllers.Users.getCart(userId).storeIdToBasket.size;
    expect(sizeBefore).toBe(0);
    expect(sizeAfter).toBe(sizeBefore + 1);
    expect(
      controllers.Users.getCart(userId).storeIdToBasket.get(storeId)?.products
        .length
    ).toBe(1);
    expect(
      controllers.Users.getCart(userId).storeIdToBasket.get(storeId)
        ?.products[0]?.quantity
    ).toBe(5);
  });
  it("should test edge cases in add product functionality ", () => {
    const storeId = randomUUID();
    productId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockReturnValue(
      storeId
    );
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockReturnValueOnce(true);
    expect(() =>
      controllers.Users.addProductToCart("Blabla", productId, 10)
    ).toThrow("User not found");
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockReturnValueOnce(false);
    expect(() =>
      controllers.Users.addProductToCart(userId, productId, 100)
    ).toThrow("store don't have such amount of product");
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockReturnValueOnce(true);
    expect(() =>
      controllers.Users.addProductToCart(userId, productId, -10)
    ).toThrow("Quantity cannot be negative");
  });
});

describe("remove product", () => {
  it("should test the remove product functionality ", () => {
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockReturnValue(
      true
    );
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockReturnValue(
      storeId
    );
    controllers.Users.addProductToCart(userId, productId, 5);
    const productId2 = randomUUID();
    controllers.Users.addProductToCart(userId, productId2, 5);
    controllers.Users.removeProductFromCart(userId, productId);
    expect(
      controllers.Users.getCart(userId)
        .storeIdToBasket.get(storeId)
        ?.products.filter((p) => p.storeProductId === productId).length
    ).toBe(0);
    expect(
      controllers.Users.getCart(userId)
        .storeIdToBasket.get(storeId)
        ?.products.filter((p) => p.storeProductId === productId2).length
    ).toBe(1);
  });
  it("should test edge cases in remove product functionality ", () => {
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockReturnValue(
      storeId
    );
    expect(() =>
      controllers.Users.removeProductFromCart("Blabla", productId)
    ).toThrow("User not found");
    expect(() =>
      controllers.Users.removeProductFromCart(userId, productId)
    ).toThrow("Basket not found");
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockReturnValue(
      true
    );
    controllers.Users.addProductToCart(userId, productId, 5);
    const productId2 = randomUUID();
    expect(() =>
      controllers.Users.removeProductFromCart(userId, productId2)
    ).toThrow("Product not found");
  });
});

describe("edit product quantity", () => {
  it("should test the edit product quantity functionality ", () => {
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockReturnValue(
      true
    );
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockReturnValue(
      storeId
    );
    const withoutEditQuantity = 5;
    controllers.Users.addProductToCart(userId, productId, withoutEditQuantity);
    const productId2 = randomUUID();
    controllers.Users.addProductToCart(userId, productId2, withoutEditQuantity);
    const editQuantity = 17;
    controllers.Users.editProductQuantityInCart(
      userId,
      productId,
      editQuantity
    );
    expect(
      controllers.Users.getCart(userId)
        .storeIdToBasket.get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(editQuantity);
    expect(
      controllers.Users.getCart(userId)
        .storeIdToBasket.get(storeId)
        ?.products.filter((p) => p.storeProductId !== productId)[0]?.quantity
    ).toBe(withoutEditQuantity);
  });
  it("should test edge cases in edit product quantity functionality ", () => {
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockReturnValue(
      storeId
    );
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockReturnValueOnce(true);
    expect(() =>
      controllers.Users.editProductQuantityInCart("Blabla", productId, 10)
    ).toThrow("User not found");
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockReturnValueOnce(false);
    expect(() =>
      controllers.Users.editProductQuantityInCart(userId, productId, 100)
    ).toThrow("store don't have such amount of product");
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockReturnValueOnce(true);
    expect(() =>
      controllers.Users.editProductQuantityInCart(userId, productId, 10)
    ).toThrow("Basket not found");
    const productId2 = randomUUID();
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockReturnValueOnce(true);
    controllers.Users.addProductToCart(userId, productId2, 5); //we don't really add the product to the cart
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockReturnValueOnce(true);
    expect(() =>
      controllers.Users.editProductQuantityInCart(userId, productId, 10)
    ).toThrow("Product not found");
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockReturnValueOnce(true);
    expect(() =>
      controllers.Users.editProductQuantityInCart(userId, productId, -10)
    ).toThrow("Quantity cannot be negative");
  });
});

describe("purchase cart", () => {
  it("should test the purchase cart functionality ", () => {
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockReturnValue(
      true
    );
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockReturnValue(
      storeId
    );
    const withoutEditQuantity = 5;
    controllers.Users.addProductToCart(userId, productId, withoutEditQuantity);
    const price = 100;
    vi.spyOn(controllers.Stores, "getCartPrice").mockReturnValueOnce(price);
    vi.spyOn(controllers.PurchasesHistory, "purchaseCart").mockReturnValue();
    const notificationSizeBefore =
      controllers.Users.getNotifications(userId).length;
    controllers.Users.purchaseCart(userId, "credit card");
    const notificationSizeAfter =
      controllers.Users.getNotifications(userId).length;
    expect(notificationSizeAfter).toBe(notificationSizeBefore + 1);
    expect(controllers.Users.getCart(userId).storeIdToBasket.size).toBe(0);
    expect(
      controllers.Users.getNotifications(userId).filter(
        (n) => n.Type === "purchase"
      ).length
    ).toBe(1);
  });
  it("should test edge cases in edit product quantity functionality ", () => {
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockReturnValue(
      storeId
    );
    vi.spyOn(controllers.Stores, "getCartPrice").mockReturnValueOnce(100);
    vi.spyOn(controllers.PurchasesHistory, "purchaseCart").mockReturnValue();
    expect(() =>
      controllers.Users.purchaseCart("Blabla", "credit card")
    ).toThrow("User not found");
  });
});

describe("get unread notifications", () => {
  it("should test the get unread notifications functionality ", () => {
    const notificationSizeBefore =
      controllers.Users.getNotifications(userId).length;
    const notificationId = controllers.Users.addNotification(
      userId,
      "test",
      "test"
    );
    const notificationSizeAfter =
      controllers.Users.getNotifications(userId).length;
    expect(notificationSizeAfter).toBe(notificationSizeBefore + 1);
    expect(controllers.Users.getUnreadNotifications(userId).length).toBe(1);
    controllers.Users.readNotification(userId, notificationId);
    expect(controllers.Users.getUnreadNotifications(userId).length).toBe(0);
    expect(controllers.Users.getNotifications(userId).length).toBe(1);
  });
  it("should test edge cases in get unread notifications functionality ", () => {
    userId = randomUUID();
    productId = randomUUID();
    controllers.Users.addUser(userId);
    expect(() => controllers.Users.getUnreadNotifications("Blabla")).toThrow(
      "User not found"
    );
  })});
  describe("register", () => {
    it("should test the register functionality ", () => {
      const password = "1234";
      const email = "email";
      const MemberId = randomUUID();
      vi.spyOn(controllers.Auth, "register").mockReturnValueOnce(MemberId);
      expect(
        controllers.Users.register(email, password) === MemberId
      ).toBe(true);
      expect(controllers.Users.getCart(MemberId).storeIdToBasket.size).toBe(0);
    expect(controllers.Users.Controllers.Users.isUserExist(MemberId)).toBe(true);
    });
    it("should test edge cases in register functionality ", () => {
      const password = "1234";
      const email = "email";
      const MemberId = randomUUID();
      vi.spyOn(controllers.Auth, "register").mockReturnValueOnce(MemberId);
      expect(
        controllers.Users.register(email, password)).toBe(MemberId);
      expect(() => controllers.Users.register(email, password)).toThrow();  
    });
  });
  describe("login", () => {
    it("should test the login functionality ", () => {
      const password = "1234";
      const email = "email";
      const MemberId = randomUUID();
      vi.spyOn(controllers.Auth, "register").mockReturnValueOnce(MemberId);
      controllers.Users.register(email, password);
      vi.spyOn(controllers.Auth, "login").mockReturnValueOnce(MemberId);
      expect(controllers.Users.login(userId, email, password) ).toBe(MemberId);
    });
    it("should test edge cases in login functionality ", () => {
      const password = "1234";
      const email = "email";
      const MemberId = randomUUID();
      vi.spyOn(controllers.Auth, "login").mockReturnValueOnce(MemberId);
      expect(() => controllers.Users.login(userId, email, password)).toThrow();
      vi.spyOn(controllers.Auth, "register").mockReturnValueOnce(MemberId);
      controllers.Users.register(email, password);
      expect(() => controllers.Users.login(userId, "1234", password)).toThrow();
      expect(() => controllers.Users.login(userId, email, "notPass")).toThrow();
      vi.spyOn(controllers.Auth, "login").mockReturnValueOnce(MemberId);
      const mem = controllers.Users.login(userId, email, password);
      expect(() => controllers.Users.login(mem, email, password)).toThrow();
    });    
  });

  describe("logout", () => {
    it("should test the logout functionality ", () => {
      
      const password = "1234";
      const email = "email";
      const MemberId = randomUUID();
      vi.spyOn(controllers.Auth, "register").mockReturnValueOnce(MemberId);
      controllers.Users.register(email, password);
      vi.spyOn(controllers.Auth, "login").mockReturnValueOnce(MemberId);
      controllers.Users.login(userId, email, password);
      const guestId = randomUUID();
      vi.spyOn(controllers.Auth, "logout").mockReturnValueOnce(guestId);
      expect(controllers.Users.logout(MemberId)).toBe(guestId);
      expect(guestId).not.toBe(MemberId);
    });
    it("should test edge cases in logout functionality ", () => {
      expect(() => controllers.Users.logout("blabla")).toThrow();
    });
  });