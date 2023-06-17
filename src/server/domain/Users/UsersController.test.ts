import { beforeEach, describe, afterEach, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import {
  createMockControllers,
  createTestControllers,
} from "../helpers/_createControllers";
import { itUnitIntegration } from "../helpers/_mock";
import { resetDB } from "server/helpers/_Transactional";
import { createMockRepos, type createTestRepos } from "./helpers/_HasRepos";
import { createPromise } from "server/data/Stores/helpers/_data";
beforeEach(async () => {
  await resetDB();
});
//* Vitest Docs: https://vitest.dev/api
// userController.addUser({id: "123456", name: "username"});
// const storeId = storeController.createStore("123456", "storeName");
// const productId = storeController.addProductToStore("123456", storeId, { name: "productName", price: 10, quantity: 10});
let controllers: ReturnType<typeof createTestControllers>;
let repos: ReturnType<typeof createTestRepos>;
let userId = randomUUID();
let productId = "";

// beforeAll(() => {
//   controllers = createTestControllers("integration", "Users");
//   const adminId = controllers.Auth.register("admin", "admin");
//   controllers.Jobs.setInitialAdmin(adminId);
// });
afterEach(async () => {
  await resetDB();
});
describe("add product", () => {
  it("should test the add product functionality ", async () => {
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);

    const sizeBefore = (await controllers.Users.getCart(userId)).storeIdToBasket
      .size;
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockResolvedValueOnce(true);
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockResolvedValue(
      storeId
    );
    await controllers.Users.addProductToCart(userId, productId, 5);
    const sizeAfter = (await controllers.Users.getCart(userId)).storeIdToBasket
      .size;
    expect(sizeBefore).toBe(0);
    expect(sizeAfter).toBe(sizeBefore + 1);
    expect(
      (await controllers.Users.getCart(userId)).storeIdToBasket.get(storeId)
        ?.products.length
    ).toBe(1);
    expect(
      (await controllers.Users.getCart(userId)).storeIdToBasket.get(storeId)
        ?.products[0]?.quantity
    ).toBe(5);
  });
  it("should test edge cases in add product functionality ", async () => {
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);
    const storeId = randomUUID();
    productId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockResolvedValue(
      storeId
    );
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockResolvedValueOnce(true);
    await expect(() =>
      controllers.Users.addProductToCart("Blabla", productId, 10)
    ).rejects.toThrow("User not found");
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockResolvedValueOnce(false);
    await expect(() =>
      controllers.Users.addProductToCart(userId, productId, 100)
    ).rejects.toThrow("store doesn't have such amount of product");
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockResolvedValueOnce(true);
    await expect(() =>
      controllers.Users.addProductToCart(userId, productId, -10)
    ).rejects.toThrow("Quantity cannot be negative");
  });
});

describe("remove product", () => {
  it("should test the remove product functionality ", async () => {
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockResolvedValue(
      true
    );
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockResolvedValue(
      storeId
    );
    await controllers.Users.addProductToCart(userId, productId, 5);
    const productId2 = randomUUID();
    await controllers.Users.addProductToCart(userId, productId2, 5);
    await controllers.Users.removeProductFromCart(userId, productId);
    expect(
      (await controllers.Users.getCart(userId)).storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId).length
    ).toBe(0);
    expect(
      (await controllers.Users.getCart(userId)).storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId2).length
    ).toBe(1);
  });
  it("should test edge cases in remove product functionality ", async () => {
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockResolvedValue(
      storeId
    );
    await expect(() =>
      controllers.Users.removeProductFromCart("Blabla", productId)
    ).rejects.toThrow("User not found");
    await expect(() =>
      controllers.Users.removeProductFromCart(userId, productId)
    ).rejects.toThrow("Product not found");
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockResolvedValue(
      true
    );
    await controllers.Users.addProductToCart(userId, productId, 5);
    const productId2 = randomUUID();
    await expect(() =>
      controllers.Users.removeProductFromCart(userId, productId2)
    ).rejects.toThrow("Product not found");
  });
});

describe("edit product quantity", () => {
  it("should test the edit product quantity functionality ", async () => {
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockResolvedValue(
      true
    );
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockResolvedValue(
      storeId
    );
    const withoutEditQuantity = 5;
    await controllers.Users.addProductToCart(
      userId,
      productId,
      withoutEditQuantity
    );
    const productId2 = randomUUID();
    await controllers.Users.addProductToCart(
      userId,
      productId2,
      withoutEditQuantity
    );
    const editQuantity = 17;
    await controllers.Users.editProductQuantityInCart(
      userId,
      productId,
      editQuantity
    );
    expect(
      (await controllers.Users.getCart(userId)).storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId === productId)[0]?.quantity
    ).toBe(editQuantity);
    expect(
      (await controllers.Users.getCart(userId)).storeIdToBasket
        .get(storeId)
        ?.products.filter((p) => p.storeProductId !== productId)[0]?.quantity
    ).toBe(withoutEditQuantity);
  });
  it("should test edge cases in edit product quantity functionality ", async () => {
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockResolvedValue(
      storeId
    );
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockResolvedValueOnce(true);
    await expect(() =>
      controllers.Users.editProductQuantityInCart("Blabla", productId, 10)
    ).rejects.toThrow("User not found");
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockResolvedValueOnce(false);
    await expect(() =>
      controllers.Users.editProductQuantityInCart(userId, productId, 100)
    ).rejects.toThrow("store doesn't have such amount of product");
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockResolvedValueOnce(true);
    await expect(() =>
      controllers.Users.editProductQuantityInCart(userId, productId, 10)
    ).rejects.toThrow("The requested basket not found");
    const productId2 = randomUUID();
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockResolvedValueOnce(true);
    await controllers.Users.addProductToCart(userId, productId2, 5); //we don't really add the product to the cart
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockResolvedValueOnce(true);
    await expect(() =>
      controllers.Users.editProductQuantityInCart(userId, productId, 10)
    ).rejects.toThrow("Product not found");
    vi.spyOn(
      controllers.Stores,
      "isProductQuantityInStock"
    ).mockResolvedValueOnce(true);
    await expect(() =>
      controllers.Users.editProductQuantityInCart(userId, productId, -10)
    ).rejects.toThrow("Quantity cannot be negative");
  });
});

describe("purchase cart", () => {
  it("should test the purchase cart functionality ", async () => {
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockResolvedValue(
      true
    );
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockResolvedValue(
      storeId
    );
    const withoutEditQuantity = 5;
    await controllers.Users.addProductToCart(
      userId,
      productId,
      withoutEditQuantity
    );
    const price = 100;
    vi.spyOn(controllers.Stores, "getCartPrice").mockResolvedValueOnce(price);
    vi.spyOn(controllers.PurchasesHistory, "purchaseCart").mockResolvedValue({
      paymentTransactionId: 15,
      deliveryTransactionId: 15,
    });
    const notificationSizeBefore = (
      await controllers.Users.getNotifications(userId)
    ).length;
    await controllers.Users.purchaseCart(
      userId,
      {
        number: "123456789",
        ccv: "149",
        holder: "buya",
        id: "111111111",
        month: "3",
        year: "2024",
      },
      { address: "", city: "", country: "", name: "", zip: "" }
    );
    const notificationSizeAfter = (
      await controllers.Users.getNotifications(userId)
    ).length;
    expect(notificationSizeAfter).toBe(notificationSizeBefore + 1);
    expect((await controllers.Users.getCart(userId)).storeIdToBasket.size).toBe(
      0
    );
    expect(
      (await controllers.Users.getNotifications(userId)).filter(
        (n) => n.Type === "purchase"
      ).length
    ).toBe(1);
  });
  it("should test edge cases in edit product quantity functionality ", async () => {
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);
    const storeId = randomUUID();
    vi.spyOn(controllers.Stores, "getStoreIdByProductId").mockResolvedValue(
      storeId
    );
    vi.spyOn(controllers.Stores, "getCartPrice").mockResolvedValueOnce(100);
    vi.spyOn(controllers.PurchasesHistory, "purchaseCart").mockResolvedValue({
      paymentTransactionId: 15,
      deliveryTransactionId: 15,
    });
    await expect(() =>
      controllers.Users.purchaseCart(
        "Blabla",
        {
          number: "123456789",
          ccv: "",
          holder: "",
          id: "",
          month: "",
          year: "",
        },
        { address: "", city: "", country: "", name: "", zip: "" }
      )
    ).rejects.toThrow("User not found");
  });
});

describe("get unread notifications", () => {
  itUnitIntegration(
    "should test the get unread notifications functionality ",
    async (testType) => {
      controllers = createTestControllers(testType, "Users");
      await controllers.Users.addUser(userId);
      const notificationSizeBefore = (
        await controllers.Users.getNotifications(userId)
      ).length;
      const notificationId = await controllers.Users.addNotification(
        userId,
        "test",
        "test",
        false
      );
      const notificationSizeAfter = (
        await controllers.Users.getNotifications(userId)
      ).length;
      expect(notificationSizeAfter).toBe(notificationSizeBefore + 1);
      expect(
        (await controllers.Users.getUnreadNotifications(userId)).length
      ).toBe(1);
      await controllers.Users.readNotification(userId, notificationId);
      expect(
        (await controllers.Users.getUnreadNotifications(userId)).length
      ).toBe(0);
      expect((await controllers.Users.getNotifications(userId)).length).toBe(1);
    }
  );
  itUnitIntegration(
    "should test edge cases in get unread notifications functionality ",
    async (testType) => {
      controllers = createTestControllers(testType, "Users");
      await controllers.Users.addUser(userId);
      userId = randomUUID();
      productId = randomUUID();
      await controllers.Users.addUser(userId);
      await expect(() =>
        controllers.Users.getUnreadNotifications("Blabla")
      ).rejects.toThrow("User not found");
    }
  );
});
describe("register", () => {
  it("should test the register functionality ", async () => {
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);
    const password = "1234";
    const email = "email";
    const MemberId = randomUUID();
    vi.spyOn(controllers.Auth, "register").mockResolvedValueOnce(MemberId);
    expect(
      (await controllers.Users.register(email, password)) === MemberId
    ).toBe(true);
    expect(
      (await controllers.Users.getCart(MemberId)).storeIdToBasket.size
    ).toBe(0);
    expect(
      await controllers.Users.Controllers.Users.isUserExist(MemberId)
    ).toBe(true);
  });
  it("should test edge cases in register functionality ", async () => {
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);
    const password = "1234";
    const email = "email";
    const MemberId = randomUUID();
    vi.spyOn(controllers.Auth, "register").mockResolvedValue(MemberId);
    expect(await controllers.Users.register(email, password)).toBe(MemberId);
    await expect(() =>
      controllers.Users.register(email, password)
    ).rejects.toThrow(TRPCError);
  });
});
describe("login", () => {
  it("should test the login functionality ", async () => {
    controllers = createMockControllers("Users");
    repos = createMockRepos("Users");
    await controllers.Users.addUser(userId);
    const password = "1234";
    const email = "email";
    const MemberId = randomUUID();
    vi.spyOn(controllers.Auth, "register").mockResolvedValue(MemberId);
    vi.spyOn(repos.Users, "removeUser").mockImplementation(async (id) => {
      await createPromise(id);
    });

    await controllers.Users.register(email, password);
    vi.spyOn(controllers.Auth, "login").mockResolvedValueOnce(MemberId);
    expect(await controllers.Users.login(userId, email, password)).toBe(
      MemberId
    );
  });
  /*it("should test edge cases in login functionality ", async () => {
    vi.spyOn(repos.Users, "removeUser").mockImplementation(async (id) => {
      await createPromise(id);
    });
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);
    const password = "1234";
    const email = "email";
    const MemberId = randomUUID();
    vi.spyOn(controllers.Auth, "login").mockImplementation(() => {
      throw new TRPCError({ code: "BAD_REQUEST" });
    });
    await expect(() =>
      controllers.Users.login(userId, email, password)
    ).rejects.toThrow(TRPCError);
    vi.spyOn(controllers.Auth, "register").mockResolvedValue(MemberId);
    await controllers.Users.register(email, password);
    await expect(() =>
      controllers.Users.login(userId, "1234", password)
    ).rejects.toThrow(TRPCError);
    await expect(() =>
      controllers.Users.login(userId, email, "notPass")
    ).rejects.toThrow(TRPCError);
    vi.spyOn(controllers.Auth, "login").mockResolvedValue(MemberId);
    const mem = await controllers.Users.login(userId, email, password);
    expect(await controllers.Users.login(mem, email, password)).toBe(MemberId);
  });*/
});

describe("logout", () => {
  it("should test the logout functionality ", async () => {
    controllers = createMockControllers("Users");
    await controllers.Users.addUser(userId);
    const password = "1234";
    const email = "email";
    const MemberId = randomUUID();
    vi.spyOn(controllers.Auth, "register").mockResolvedValue(MemberId);
    await controllers.Users.register(email, password);
    vi.spyOn(controllers.Auth, "login").mockResolvedValue(MemberId);
    await controllers.Users.login(userId, email, password);
    const guestId = randomUUID();
    vi.spyOn(controllers.Auth, "logout").mockResolvedValue(guestId);
    expect(await controllers.Users.logout(MemberId)).toBe(guestId);
    expect(guestId).not.toBe(MemberId);
  });
  itUnitIntegration(
    "should test edge cases in logout functionality ",
    async (testType) => {
      controllers = createTestControllers(testType, "Users");
      const guestId = randomUUID();
      vi.spyOn(controllers.Auth, "logout").mockImplementation(() => {
        throw new TRPCError({ code: "BAD_REQUEST" });
      });
      await controllers.Users.addUser(userId);
      await expect(() => controllers.Users.logout("blabla")).rejects.toThrow(
        TRPCError
      );
    }
  );
});

describe("remove member", () => {
  itUnitIntegration("✅removes member ", async (testType) => {
    testType = "integration";
    controllers = createTestControllers(testType, "Users");
    await controllers.Users.addUser(userId);
    const password = "1234";
    const email = "email@gmail.com";
    // const MemberId = randomUUID();
    const AdminId = await controllers.Auth.register("admin", "admin");
    await controllers.Jobs.setInitialAdmin(AdminId);
    expect(true).toBe(true);
    const guestId = await controllers.Users.startSession();
    await controllers.Users.register(email, password);
    //log the user in then check if the user exists, then remove the user and check if the user exists
    const MemberId = await controllers.Users.login(guestId, email, password);
    expect(await controllers.Users.isUserExist(MemberId)).toBe(true);
    await controllers.Users.removeMember(AdminId, MemberId);
    expect(await controllers.Users.isUserExist(MemberId)).toBe(false);
  });
  //a test that fails because the user is not an admin
  itUnitIntegration(
    "❌fails to remove member because asking user is not an admin",
    async (testType) => {
      testType = "integration";
      controllers = createTestControllers(testType, "Users");
      await controllers.Users.addUser(userId);
      const password = "1234";
      const email = "email@gmail.com";
      // const MemberId = randomUUID();
      const AdminId = await controllers.Auth.register("admin", "admin");
      await controllers.Jobs.setInitialAdmin(AdminId);
      // expect(true).toBe(true);
      const guestId = await controllers.Users.startSession();
      await controllers.Users.register(email, password);
      const MemberId = await controllers.Users.login(guestId, email, password);
      expect(await controllers.Users.isUserExist(MemberId)).toBe(true);
      await expect(() =>
        controllers.Users.removeMember(MemberId, MemberId)
      ).rejects.toThrow();
    }
  );
  //a test that fails because the user to remove is not a member
  itUnitIntegration(
    "❌fails to remove member because user to remove is not a member",
    async (testType) => {
      testType = "integration";
      controllers = createTestControllers(testType, "Users");
      await controllers.Users.addUser(userId);
      const password = "1234";
      const email = "email@gmail.com";
      // const MemberId = randomUUID();
      const AdminId = await controllers.Auth.register("admin", "admin");
      await controllers.Jobs.setInitialAdmin(AdminId);
      // expect(true).toBe(true);
      const guestId = await controllers.Users.startSession();
      await expect(
        async () => await controllers.Users.removeMember(AdminId, guestId)
      ).rejects.toThrow(TRPCError);
    }
  );
});
