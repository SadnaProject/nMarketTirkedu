import { describe, expect, it, vi, beforeEach } from "vitest";
import { ProductReview } from "./ProductReview";
import {
  type Repos,
  createMockRepos,
  createTestRepos,
} from "./helpers/_HasRepos";
import {
  ProductPurchase,
  type ProductPurchaseDTO,
} from "./ProductPurchaseHistory";
import { BasketPurchase } from "./BasketPurchaseHistory";
import { CartPurchase } from "./CartPurchaseHistory";
import { ProductPurchaseRepo } from "server/data/PurchasesHistory/ProductPurchaseHistoryRepo";
import { CartPurchaseRepo } from "server/data/PurchasesHistory/CartPurchaseHistoryRepo";
import { ProductReviewRepo } from "server/data/PurchasesHistory/ProductReviewsRepo";
import { getDB, resetDB } from "server/helpers/_Transactional";
import {
  createMockControllers,
  createTestControllers,
} from "../helpers/_createControllers";
import { itUnitIntegration } from "../helpers/_mock";
import { BasketPurchaseRepo } from "../../data/PurchasesHistory/BasketPurchaseHistoryRepo";
import { JobsController } from "../Jobs/JobsController";
import { type Controllers } from "../helpers/_HasController";
import { ReviewRepo } from "server/data/PurchasesHistory/ReviewRepo";
import { Review } from "./Review";
import { PaymentAdapter, type PaymentDetails } from "./PaymentAdaptor";
import { TRPCError } from "@trpc/server";
import { type BasketDTO } from "../Users/Basket";
import { DeliveryAdaptor, type DeliveryDetails } from "./DeliveryAdaptor";
import { fa } from "@faker-js/faker";
import { fail } from "assert";
import { StoresController } from "../Stores/StoresController";
import { get } from "http";

const reviewData = {
  rating: 5,
  createdAt: new Date(),
  userId: "admin",
  purchaseId: "purchaseId",
  storeId: "storeId",
};
const productReviewData = {
  title: "title",
  description: "description",
  productId: "productId",
  ...reviewData,
};
const productPurchaseData = {
  id: "id",
  createdAt: new Date(),
  userId: "admin",
  purchaseId: "purchaseId",
  productId: "productId",
  quantity: 1,
  price: 1,
};
const basketPurchaseData = {
  //products : Map<string, ProductPurchase>, price: number
  storeId: "storeId",
  products: new Map<string, ProductPurchase>([
    ["productId", new ProductPurchase(productPurchaseData)],
  ]),
  price: 1,
  purchaseId: "purchaseId",
};
const cartPurchaseData = {
  //storeIdToBasketPurchases: Map<string, BasketPurchase>, totalPrice: number
  purchaseId: "purchaseId",
  userId: "admin",
  storeIdToBasketPurchases: new Map<string, BasketPurchase>([
    [
      "storeId",
      new BasketPurchase(
        basketPurchaseData.storeId,
        basketPurchaseData.products,
        basketPurchaseData.price,
        basketPurchaseData.purchaseId
      ),
    ],
  ]),
  totalPrice: 1,
};

let repos: Repos;
let controllers: Controllers;

beforeEach(async () => {
  await resetDB();
  await getDB().user.create({
    data: {
      id: "admin",
    },
  });
  repos = createMockRepos();
  controllers = createMockControllers("PurchasesHistory");
});

describe("addProductPurchaseReview", () => {
  it("✅adds product purchase review", () => {
    expect(true).toBe(true);
  });
});

// add product purchase review
describe("addProductPurchaseReview", () => {
  itUnitIntegration("✅adds product purchase review", async () => {
    const productReview = new ProductReview(productReviewData);
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );
    vi.spyOn(CartPurchaseRepo.prototype, "getPurchaseById").mockReturnValue(
      Promise.resolve(cartPurchase)
    );
    vi.spyOn(
      ProductReviewRepo.prototype,
      "doesProductReviewExist"
    ).mockReturnValue(Promise.resolve(false));
    vi.spyOn(
      ProductPurchaseRepo.prototype,
      "getProductsPurchaseById"
    ).mockReturnValue(
      Promise.resolve([new ProductPurchase(productPurchaseData)])
    );
    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    expect(() =>
      controllers.PurchasesHistory.addProductPurchaseReview(
        "admin",
        "purchaseId",
        "productId",
        5,
        "title",
        "description",
        "storeId"
      )
    ).not.toThrow();
  });

  // try to review the same product twice in the same purchase
  itUnitIntegration("❎adds two product purchase reviews", async () => {
    // todo - fix test. it uses mock controller for integration test, and does not add product (notice Unhandled Rejection in console)
    const productReview = new ProductReview(productReviewData);
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );

    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    await controllers.PurchasesHistory.addProductPurchaseReview(
      productReview.UserId,
      productReview.PurchaseId,
      productReview.ProductId,
      productReview.Rating,
      productReview.Title,
      productReview.Description,
      productReview.StoreId
    );
    vi.spyOn(
      ProductReviewRepo.prototype,
      "doesProductReviewExist"
    ).mockReturnValue(Promise.resolve(true));
    // if any other throw is thrown, the test will fail
    await expect(() =>
      controllers.PurchasesHistory.addProductPurchaseReview(
        "admin",
        "purchaseId",
        "productId",
        5,
        "title",
        "description",
        "storeId"
      )
    ).rejects.toThrow(
      "Product already reviewed, please try again with a different purchase"
    );
  });

  // try to review a product that doesn't exist in the purchase
  itUnitIntegration(
    "❎adds product purchase review to a product that doesn't exist in the purchase",
    async () => {
      const productReview = new ProductReview(productReviewData);
      const cartPurchase = new CartPurchase(
        cartPurchaseData.userId,
        cartPurchaseData.purchaseId,
        cartPurchaseData.storeIdToBasketPurchases,
        cartPurchaseData.totalPrice
      );
      await controllers.PurchasesHistory.addPurchase(cartPurchase);
      vi.spyOn(
        ProductPurchaseRepo.prototype,
        "getProductsPurchaseById"
      ).mockReturnValue(Promise.resolve([]));
      await expect(async () =>
        controllers.PurchasesHistory.addProductPurchaseReview(
          "admin",
          "purchaseId",
          "productId2",
          5,
          "title",
          "description",
          "storeId"
        )
      ).rejects.toThrow("Product not found in purchase");
    }
  );

  // try to add a review to a purchase that doesn't exist
  itUnitIntegration(
    "❎adds product purchase review to a purchase that doesn't exist",
    async () => {
      const productReview = new ProductReview(productReviewData);
      const cartPurchase = new CartPurchase(
        cartPurchaseData.userId,
        cartPurchaseData.purchaseId,
        cartPurchaseData.storeIdToBasketPurchases,
        cartPurchaseData.totalPrice
      );
      await controllers.PurchasesHistory.addPurchase(cartPurchase);
      await expect(() =>
        controllers.PurchasesHistory.addProductPurchaseReview(
          "admin",
          "purchaseId2",
          "productId",
          5,
          "title",
          "description",
          "storeId"
        )
      ).rejects.toThrow("Product not found in purchase");
    }
  );
});

// add store purchase review
describe("addStorePurchaseReview", () => {
  itUnitIntegration("✅adds store purchase review", async () => {
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );
    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
      Promise.resolve(false)
    );
    vi.spyOn(BasketPurchaseRepo.prototype, "hasPurchase").mockReturnValue(
      Promise.resolve(true)
    );
    expect(
      async () =>
        await controllers.PurchasesHistory.addStorePurchaseReview(
          "admin",
          "purchaseId",
          "storeId",
          5
        )
    ).not.toThrow();
  });
  itUnitIntegration("❎ adds two store purchase reviews", async () => {
    // todo - fix test. it uses mock controller for integration test, and maybe there are other problems... (notice Unhandled Rejection in console)
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );
    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    await controllers.PurchasesHistory.addStorePurchaseReview(
      "admin",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
      Promise.resolve(true)
    );
    await expect(() =>
      controllers.PurchasesHistory.addStorePurchaseReview(
        "admin",
        "purchaseId",
        "storeId",
        5
      )
    ).rejects.toThrow(
      "Store already reviewed, please try again with a different purchase"
    );
  });
  itUnitIntegration("❎No such store", async () => {
    vi.spyOn(BasketPurchaseRepo.prototype, "hasPurchase").mockReturnValue(
      Promise.resolve(false)
    );
    await expect(() =>
      controllers.PurchasesHistory.addStorePurchaseReview(
        "admin",
        "storeId",
        "purchaseId",
        5
      )
    ).rejects.toThrow("Purchase not found");
  });
});

describe("getCartPurchaseByUserId", () => {
  itUnitIntegration("✅gets cart purchase", async (testType) => {
    controllers = createTestControllers(testType, "PurchasesHistory");
    repos = createTestRepos(testType);
    controllers.PurchasesHistory.initRepos(repos);
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );
    await getDB().store.create({
      data: {
        id: "storeId",
        name: "storeName",
        isActive: true,
      },
    });
    await getDB().storeProduct.create({
      data: {
        id: "productId",
        storeId: "storeId",
        name: "name",
        price: 1,
        quantity: 1,
        category: "category",
        description: "description",
      },
    });

    // mock isSystemAdmin
    vi.spyOn(controllers.Auth, "register").mockReturnValue(
      Promise.resolve("admin")
    );
    const userId = await controllers.Auth.register("admin", "admin");
    vi.spyOn(controllers.Jobs, "setInitialAdmin").mockReturnValue(
      Promise.resolve()
    );
    await controllers.Jobs.setInitialAdmin("admin");
    vi.spyOn(CartPurchaseRepo.prototype, "addCartPurchase").mockReturnValue(
      Promise.resolve()
    );
    vi.spyOn(BasketPurchaseRepo.prototype, "addBasketPurchase").mockReturnValue(
      Promise.resolve()
    );
    vi.spyOn(
      ProductPurchaseRepo.prototype,
      "addProductPurchase"
    ).mockReturnValue(Promise.resolve());
    vi.spyOn(
      CartPurchaseRepo.prototype,
      "doesPurchaseExist"
    ).mockReturnValueOnce(Promise.resolve(false));
    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    vi.spyOn(JobsController.prototype, "isSystemAdmin").mockReturnValue(
      Promise.resolve(true)
    );
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      Promise.resolve(true)
    );
    vi.spyOn(CartPurchaseRepo.prototype, "getPurchasesByUser").mockReturnValue(
      Promise.resolve([cartPurchase])
    );
    vi.spyOn(StoresController.prototype, "getStoreNameById").mockReturnValue(
      Promise.resolve("storeName")
    );
    // Error: Test code needs to be fixed - function getProductById should be mocked
    vi.spyOn(StoresController.prototype, "getProductById").mockReturnValue(
      Promise.resolve({
        id: "id",
        name: "name",
        quantity: 1,
        price: 1,
        category: "category",
        description: "description",
        rating: 1,
      })
    );
    const testCart = cartPurchase.ToDTO();
    // for every basket in testCart, set the basket name
    testCart.storeIdToBasketPurchases.forEach((basket) => {
      basket.storeName = "storeName";
    });
    // for every basket in testCart, set the basket products names
    testCart.storeIdToBasketPurchases.forEach((basket) => {
      basket.products.forEach((product) => {
        product.name = "name";
        product.description = "description";
      });
    });
    expect(
      await controllers.PurchasesHistory.getPurchasesByUser("admin", "admin")
    ).toStrictEqual([testCart]);
  });

  it("❎gets undefined cart purchase", async () => {
    vi.spyOn(controllers.Auth, "register").mockReturnValue(
      Promise.resolve("admin")
    );
    const userId = await controllers.Auth.register("admin", "admin");
    vi.spyOn(JobsController.prototype, "setInitialAdmin").mockReturnValue(
      Promise.resolve()
    );
    await controllers.Jobs.setInitialAdmin(userId);
    vi.spyOn(JobsController.prototype, "isSystemAdmin").mockReturnValue(
      Promise.resolve(true)
    );
    expect(
      await controllers.PurchasesHistory.getPurchasesByUser("admin", "admin")
    ).toStrictEqual([]);
  });

  itUnitIntegration(
    "❎try to get purchases when not an admin",
    async (testType) => {
      repos = createTestRepos(testType);
      controllers = createTestControllers(testType, "PurchasesHistory");
      vi.spyOn(JobsController.prototype, "isSystemAdmin").mockReturnValue(
        Promise.resolve(false)
      );
      vi.spyOn(controllers.Jobs, "isSystemAdmin").mockReturnValue(
        Promise.resolve(false)
      );
      await expect(() =>
        controllers.PurchasesHistory.getPurchasesByUser("admin", "admin")
      ).rejects.toThrow(
        "User is not a system admin, and therefore cannot view other users' purchases"
      );
    }
  );
});

describe("getCartPurchaseByPurchaseId", () => {
  itUnitIntegration("✅gets cart purchase", async (testType) => {
    repos = createTestRepos(testType);
    controllers = createTestControllers(testType, "PurchasesHistory");
    await getDB().store.create({
      data: {
        id: "storeId",
        name: "storeName",
        isActive: true,
      },
    });
    await getDB().storeProduct.create({
      data: {
        id: "productId",
        storeId: "storeId",
        name: "name",
        price: 1,
        quantity: 1,
        category: "category",
        description: "description",
      },
    });

    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );
    // Test code needs to be fixed - function getProductById should be mocked
    vi.spyOn(StoresController.prototype, "getProductById").mockReturnValue(
      Promise.resolve({
        id: "id",
        name: "name",
        quantity: 1,
        price: 1,
        category: "category",
        description: "description",
        rating: 1,
      })
    );
    vi.spyOn(StoresController.prototype, "getStoreNameById").mockReturnValue(
      Promise.resolve("storeName")
    );
    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      Promise.resolve(true)
    );
    const testCart = cartPurchase.ToDTO();
    // for every basket in testCart, set the basket name
    testCart.storeIdToBasketPurchases.forEach((basket) => {
      basket.storeName = "storeName";
    });
    // for every basket in testCart, set the basket products names
    testCart.storeIdToBasketPurchases.forEach((basket) => {
      basket.products.forEach((product) => {
        product.name = "name";
        product.description = "description";
      });
    });
    expect(
      await controllers.PurchasesHistory.getPurchase(cartPurchase.PurchaseId)
    ).toStrictEqual(testCart);
  });
  itUnitIntegration("❎gets undefined cart purchase", async () => {
    await expect(() =>
      controllers.PurchasesHistory.getPurchase("purchaseId")
    ).rejects.toThrow("Purchase not found");
  });
});

// test add purchase
describe("addPurchase", () => {
  itUnitIntegration("✅adds purchase", async (testType) => {
    repos = createTestRepos(testType);
    controllers = createTestControllers(testType, "PurchasesHistory");
    await getDB().store.create({
      data: {
        id: "storeId",
        name: "storeName",
        isActive: true,
      },
    });
    await getDB().storeProduct.create({
      data: {
        id: "productId",
        storeId: "storeId",
        name: "name",
        price: 1,
        quantity: 1,
        category: "category",
        description: "description",
      },
    });
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );
    vi.spyOn(StoresController.prototype, "getStoreNameById").mockReturnValue(
      Promise.resolve("storeName")
    );
    vi.spyOn(StoresController.prototype, "getProductById").mockReturnValue(
      Promise.resolve({
        id: "id",
        name: "name",
        quantity: 1,
        price: 1,
        category: "category",
        description: "description",
        rating: 1,
      })
    );
    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      Promise.resolve(true)
    );
    const testCart = cartPurchase.ToDTO();
    // for every basket in testCart, set the basket name
    testCart.storeIdToBasketPurchases.forEach((basket) => {
      basket.storeName = "storeName";
    });
    // for every basket in testCart, set the basket products names
    testCart.storeIdToBasketPurchases.forEach((basket) => {
      basket.products.forEach((product) => {
        product.name = "name";
        product.description = "description";
      });
    });
    expect(
      await controllers.PurchasesHistory.getPurchase(cartPurchase.PurchaseId)
    ).toStrictEqual(testCart);
  });

  itUnitIntegration("❎ add two purchases with same id", async () => {
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );

    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      Promise.resolve(true)
    );
    await expect(() =>
      controllers.PurchasesHistory.addPurchase(cartPurchase)
    ).rejects.toThrow(
      "Purchase with same id already exists, please try again with a different cart"
    );
  });
});

// test get reviews by product id
describe("getReviewsByProductId", () => {
  itUnitIntegration("✅gets reviews by product id", async () => {
    const productReview = new ProductReview(productReviewData);
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      Promise.resolve(false)
    );
    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    await controllers.PurchasesHistory.addProductPurchaseReview(
      "admin",
      "purchaseId",
      "productId",
      5,
      "title",
      "description",
      "storeId"
    );
    const reviews = await controllers.PurchasesHistory.getReviewsByProduct(
      "productId"
    );
    expect(reviews.reviews.length).toBe(1);
    expect(reviews.avgRating).toBe(5);
  });
  itUnitIntegration("❎gets undefined reviews by product id", async () => {
    const reviews = await controllers.PurchasesHistory.getReviewsByProduct(
      "productId"
    );
    expect(reviews.reviews).toStrictEqual([]);
  });
});

// test get reviews by store id
describe("getReviewsByStore", () => {
  itUnitIntegration("✅gets reviews by store id", async () => {
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );
    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    await controllers.PurchasesHistory.addStorePurchaseReview(
      "admin",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "getAllStoreReviews").mockReturnValue(
      Promise.resolve([new Review(reviewData)])
    );
    expect(
      await controllers.PurchasesHistory.getReviewsByStore("storeId")
    ).toBe(1);
  });
  itUnitIntegration("❎gets undefined reviews by store id", async () => {
    expect(
      await controllers.PurchasesHistory.getReviewsByStore("storeId")
    ).toStrictEqual(0);
  });

  itUnitIntegration("❎try and review a store twice", async () => {
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );
    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    await controllers.PurchasesHistory.addStorePurchaseReview(
      "admin",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
      Promise.resolve(true)
    );
    await expect(() =>
      controllers.PurchasesHistory.addStorePurchaseReview(
        "admin",
        "purchaseId",
        "storeId",
        5
      )
    ).rejects.toThrow(
      "Store already reviewed, please try again with a different purchase"
    );
  });
});

// test get purchase by store id
describe("getPurchasesByStore", () => {
  itUnitIntegration("✅gets purchases by store id", async (testType) => {
    repos = createTestRepos(testType);
    controllers = createTestControllers(testType, "PurchasesHistory");
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );
    vi.spyOn(StoresController.prototype, "getStoreNameById").mockReturnValue(
      Promise.resolve("storeName")
    );
    vi.spyOn(StoresController.prototype, "getProductById").mockReturnValue(
      Promise.resolve({
        id: "id",
        name: "name",
        quantity: 1,
        price: 1,
        category: "category",
        description: "description",
        rating: 1,
      })
    );
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      Promise.resolve(false)
    );
    const testCart = cartPurchase.ToDTO();
    await getDB().store.create({
      data: {
        id: "storeId",
        name: "storeName",
        isActive: true,
      },
    });
    await getDB().storeProduct.create({
      data: {
        id: "productId",
        storeId: "storeId",
        name: "name",
        price: 1,
        quantity: 1,
        category: "category",
        description: "description",
      },
    });
    // for every basket in testCart, set the basket name
    testCart.storeIdToBasketPurchases.forEach((basket) => {
      basket.storeName = "storeName";
    });
    // for every basket in testCart, set the basket products names
    testCart.storeIdToBasketPurchases.forEach((basket) => {
      basket.products.forEach((product) => {
        product.name = "name";
        product.description = "description";
      });
    });
    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      Promise.resolve(true)
    );
    const purchases = await controllers.PurchasesHistory.getPurchasesByStore(
      "storeId"
    );
    expect(purchases.length).toBe(1);
  });
  itUnitIntegration("❎gets undefined purchases by store id", async () => {
    const purchases = await controllers.PurchasesHistory.getPurchasesByStore(
      "storeId"
    );
    expect(purchases.length).toBe(0);
  });
});

// test getStoreRating
describe("getStoreRating", () => {
  itUnitIntegration("✅gets store rating", async () => {
    const cartPurchase = new CartPurchase(
      cartPurchaseData.userId,
      cartPurchaseData.purchaseId,
      cartPurchaseData.storeIdToBasketPurchases,
      cartPurchaseData.totalPrice
    );
    await controllers.PurchasesHistory.addPurchase(cartPurchase);
    await controllers.PurchasesHistory.addStorePurchaseReview(
      "admin",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "getAllStoreReviews").mockReturnValue(
      Promise.resolve([new Review(reviewData)])
    );
    expect(await controllers.PurchasesHistory.getStoreRating("storeId")).toBe(
      5
    );
  });
  itUnitIntegration("❎gets undefined store rating", async () => {
    expect(await controllers.PurchasesHistory.getStoreRating("storeId")).toBe(
      0
    );
  });
});

describe("PurchaseCart", () => {
  itUnitIntegration("✅purchase cart", async (testType) => {
    repos = createTestRepos(testType); //TODO external services dosn't work
    controllers = createTestControllers(testType, "PurchasesHistory");
    const basketDTO = {
      storeId: "storeId",
      purchaseId: "purchaseId",
      price: 1,
      products: [
        {
          storeProductId: "productId",
          quantity: 1,
          storeId: "storeId",
          userId: "admin",
        },
      ],
      userId: "admin",
    };
    // Test code needs to be fixed - function getStoreNameById should be mocked
    vi.spyOn(StoresController.prototype, "getStoreNameById").mockReturnValue(
      Promise.resolve("storeName")
    );
    vi.spyOn(StoresController.prototype, "getProductById").mockReturnValue(
      Promise.resolve({
        id: "id",
        name: "name",
        quantity: 1,
        price: 1,
        category: "category",
        description: "description",
        rating: 1,
      })
    );
    const StoreIDToBasketMap = new Map<string, BasketDTO>();
    StoreIDToBasketMap.set("storeId", basketDTO);

    const StoreIDToBasketMap2 = new Map<string, BasketPurchase>();
    const productIdToProductPurchaseDTO = new Map<string, ProductPurchaseDTO>();
    productIdToProductPurchaseDTO.set("productId", {
      purchaseId: "purchaseId",
      productId: "productId",
      quantity: 1,
      price: 1,
    });

    const basket = BasketPurchase.fromDTO({
      storeId: "storeId",
      purchaseId: "purchaseId",
      price: 1,
      products: productIdToProductPurchaseDTO,
    });
    StoreIDToBasketMap2.set("storeId", basket);
    const cartPurchase = new CartPurchase(
      "admin",
      "purchaseId",
      StoreIDToBasketMap2,
      1
    );

    // spy on storeproductrepo getProductById
    vi.spyOn(
      controllers.PurchasesHistory,
      "CartPurchaseDTOfromCartDTO"
    ).mockReturnValue(Promise.resolve(cartPurchase.ToDTO()));
    vi.spyOn(CartPurchase, "fromDTO").mockReturnValue(cartPurchase);
    vi.spyOn(PaymentAdapter, "handShake").mockReturnValue(Promise.resolve());
    vi.spyOn(PaymentAdapter, "pay").mockReturnValue(Promise.resolve(123));
    vi.spyOn(DeliveryAdaptor, "handShake").mockReturnValue(Promise.resolve());
    vi.spyOn(DeliveryAdaptor, "supply").mockReturnValue(Promise.resolve(1412));
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockReturnValue(
      Promise.resolve(true)
    );
    vi.spyOn(controllers.Stores, "decreaseProductQuantity").mockReturnValue(
      Promise.resolve()
    );
    vi.spyOn(
      controllers.Stores,
      "checkIfBasketSatisfiesStoreConstraints"
    ).mockReturnValue(Promise.resolve(true));

    const paymentDetails: PaymentDetails = {
      number: "123",
      month: "3",
      year: "2023",
      holder: "admin",
      ccv: "986",
      id: "123456789",
    };

    const deliveryDetails: DeliveryDetails = {
      name: "admin",
      address: "admin",
      city: "admin",
      country: "admin",
      zip: "admin",
    };
    const cartDTO = {
      // purchaseId: "purchaseId",
      userId: "admin",
      storeIdToBasket: StoreIDToBasketMap,
      totalPrice: 1,
    };
    await getDB().store.create({
      data: {
        id: "storeId",
        name: "storeName",
        isActive: true,
      },
    });
    await getDB().cart.create({
      data: {
        userId: "admin",
        baskets: {
          create: {
            storeId: "storeId",
          },
        },
      },
    });
    await getDB().storeProduct.create({
      data: {
        id: "productId",
        storeId: "storeId",
        name: "name",
        price: 1,
        quantity: 1,
        category: "category",
        description: "description",
      },
    });

    await controllers.PurchasesHistory.purchaseCart(
      "admin",
      cartDTO,
      1,
      paymentDetails,
      deliveryDetails
    );
    const purchase = (
      await controllers.PurchasesHistory.getMyPurchases("admin")
    )[0];
    if (!purchase) {
      fail();
    } else {
      expect(purchase.userId).toBe("admin");
      expect(purchase.storeIdToBasketPurchases.size).toBe(1);
      expect(purchase.totalPrice).toBe(1);
      expect(purchase.storeIdToBasketPurchases.get("storeId")?.storeId).toBe(
        "storeId"
      );
    }
  });

  it("❎purchase adaptor returns false", async () => {
    const cartPurchase = new CartPurchase(
      "userId",
      "purchaseId",
      new Map<string, BasketPurchase>(),
      1
    );
    const basketDTO = {
      storeId: "storeId",
      products: [
        {
          storeProductId: "productId",
          quantity: 1,
          storeId: "storeId",
          userId: "userId",
        },
      ],
      userId: "userId",
    };
    const StoreIDToBasketMap = new Map<string, BasketDTO>();
    StoreIDToBasketMap.set("storeId", basketDTO);
    const cartDTO = {
      purchaseId: "purchaseId",
      userId: "userId",
      storeIdToBasket: StoreIDToBasketMap,
      totalPrice: 1,
    };
    // spy on storeproductrepo getProductById
    vi.spyOn(
      controllers.PurchasesHistory,
      "CartPurchaseDTOfromCartDTO"
    ).mockReturnValue(Promise.resolve(cartPurchase.ToDTO()));
    vi.spyOn(PaymentAdapter, "pay").mockImplementation(() => {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "payment failed",
      });
    });
    await getDB().store.create({
      data: {
        id: "storeId",
        name: "storeName",
        isActive: true,
      },
    });

    vi.spyOn(CartPurchase, "fromDTO").mockReturnValue(cartPurchase);
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockReturnValue(
      Promise.resolve(true)
    );
    const paymentDetails: PaymentDetails = {
      number: "123",
      month: "3",
      year: "2023",
      holder: "admin",
      ccv: "986",
      id: "123456789",
    };

    const deliveryDetails: DeliveryDetails = {
      name: "admin",
      address: "admin",
      city: "admin",
      country: "admin",
      zip: "admin",
    };
    vi.spyOn(controllers.Stores, "decreaseProductQuantity").mockReturnValue(
      Promise.resolve()
    );
    await expect(() =>
      controllers.PurchasesHistory.purchaseCart(
        "admin",
        cartDTO,
        1,
        paymentDetails,
        deliveryDetails
      )
    ).rejects.toThrow();
  });
  it("❎purchase cart with no cart", async () => {
    const cartPurchase = new CartPurchase(
      "userId",
      "purchaseId",
      new Map<string, BasketPurchase>(),
      1
    );
    const basketDTO = {
      storeId: "storeId",
      products: [
        {
          storeProductId: "productId",
          quantity: 1,
          storeId: "storeId",
          userId: "userId",
        },
      ],
      userId: "userId",
    };
    const StoreIDToBasketMap = new Map<string, BasketDTO>();
    StoreIDToBasketMap.set("storeId", basketDTO);
    const cartDTO = {
      purchaseId: "purchaseId",
      userId: "userId",
      storeIdToBasket: StoreIDToBasketMap,
      totalPrice: 1,
    };
    vi.spyOn(
      controllers.Stores,
      "checkIfBasketSatisfiesStoreConstraints"
    ).mockReturnValue(Promise.resolve(true));
    vi.spyOn(
      controllers.PurchasesHistory,
      "CartPurchaseDTOfromCartDTO"
    ).mockReturnValue(Promise.resolve(cartPurchase.ToDTO()));
    vi.spyOn(CartPurchase, "fromDTO").mockReturnValue(cartPurchase);
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockReturnValue(
      Promise.resolve(true)
    );
    const paymentDetails: PaymentDetails = {
      number: "123",
      month: "3",
      year: "2023",
      holder: "admin",
      ccv: "986",
      id: "123456789",
    };

    const deliveryDetails: DeliveryDetails = {
      name: "admin",
      address: "admin",
      city: "admin",
      country: "admin",
      zip: "admin",
    };
    vi.spyOn(controllers.Stores, "decreaseProductQuantity").mockReturnValue(
      Promise.resolve()
    );
    await controllers.PurchasesHistory.purchaseCart(
      "admin",
      cartDTO,
      1,
      paymentDetails,
      deliveryDetails
    );

    await expect(() =>
      controllers.PurchasesHistory.purchaseCart(
        "admin",
        cartDTO,
        1,
        paymentDetails,
        deliveryDetails
      )
    ).rejects.toThrow();
  });
});
