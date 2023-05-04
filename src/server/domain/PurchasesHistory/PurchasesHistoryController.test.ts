import { describe, expect, it, vi, beforeEach } from "vitest";
import { PurchasesHistoryController } from "./PurchasesHistoryController";
import { ProductReview } from "./ProductReview";
import { type Repos, createRepos, createMockRepos } from "./_HasRepos";
import { Review } from "./Review";
import { ProductPurchase } from "./ProductPurchaseHistory";
import { BasketPurchase } from "./BasketPurchaseHistory";
import { CartPurchase } from "./CartPurchaseHistory";
import { ProductPurchaseRepo } from "./PurchasesHistory/ProductPurchaseHistoryRepo";
import { type BasketDTO } from "../Users/Basket";
import { CartPurchaseRepo } from "./PurchasesHistory/CartPurchaseHistoryRepo";
import { ProductReviewRepo } from "./PurchasesHistory/ProductReviewsRepo";
import { ReviewRepo } from "./PurchasesHistory/ReviewRepo";
import { BasketPurchaseRepo } from "./PurchasesHistory/BasketPurchaseHistoryRepo";
import { JobsController } from "../Jobs/JobsController";
import { itUnitIntegration } from "../_mock";
import { type Controllers } from "../_HasController";
import { createMockControllers } from "../_createControllers";
import { AuthController } from "../Auth/AuthController";
import { PaymentAdapter } from "./PaymentAdaptor";

const reviewData = {
  rating: 5,
  id: "id",
  createdAt: new Date(),
  userId: "admin",
  purchaseId: "purchaseId",
  productId: "productId",
};
const productReviewData = {
  title: "title",
  description: "description",
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
  creditCard: "creditCard",
};

let repos: Repos;
let controllers: Controllers;

beforeEach(() => {
  repos = createMockRepos();
  controllers = createMockControllers("PurchasesHistory");
});

const createReview = (repos: Repos = createRepos()) =>
  new Review(reviewData).initRepos(repos);
const createProductReview = (repos: Repos = createRepos()) =>
  new ProductReview(productReviewData).initRepos(repos);
const createProductPurchase = (repos: Repos = createRepos()) =>
  new ProductPurchase(productPurchaseData).initRepos(repos);
const createBasketPurchase = (repos: Repos = createRepos()) =>
  new BasketPurchase(
    basketPurchaseData.storeId,
    basketPurchaseData.products,
    basketPurchaseData.price,
    basketPurchaseData.purchaseId
  ).initRepos(repos);
const createCartPurchase = (repos: Repos = createRepos()) =>
  new CartPurchase(
    cartPurchaseData.userId,
    cartPurchaseData.purchaseId,
    cartPurchaseData.storeIdToBasketPurchases,
    cartPurchaseData.totalPrice
  ).initRepos(repos);

// add product purchase review
describe("addProductPurchaseReview", () => {
  itUnitIntegration("✅adds product purchase review", () => {
    const productReview = createProductReview();
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();
    vi.spyOn(CartPurchaseRepo.prototype, "getPurchaseById").mockReturnValue(
      cartPurchase
    );
    vi.spyOn(
      ProductReviewRepo.prototype,
      "doesProductReviewExist"
    ).mockReturnValue(false);
    vi.spyOn(
      ProductPurchaseRepo.prototype,
      "getProductsPurchaseById"
    ).mockReturnValue([createProductPurchase()]);
    purchasesHistoryController.addPurchase(cartPurchase);
    expect(() =>
      purchasesHistoryController.addProductPurchaseReview(
        "admin",
        "purchaseId",
        "productId",
        5,
        "title",
        "description"
      )
    ).not.toThrow();
  });

  // try to review the same product twice in the same purchase
  itUnitIntegration("❎adds two product purchase reviews", () => {
    const productReview = createProductReview();
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();
    purchasesHistoryController.addPurchase(cartPurchase);
    purchasesHistoryController.addProductPurchaseReview(
      productReview.UserId,
      productReview.PurchaseId,
      productReview.ProductId!,
      productReview.Rating,
      productReview.Title,
      productReview.Description
    );
    vi.spyOn(
      ProductReviewRepo.prototype,
      "doesProductReviewExist"
    ).mockReturnValue(true);
    expect(() =>
      purchasesHistoryController.addProductPurchaseReview(
        "admin",
        "purchaseId",
        "productId",
        5,
        "title",
        "description"
      )
    ).toThrow();
  });

  // try to review a product that doesn't exist in the purchase
  itUnitIntegration(
    "❎adds product purchase review to a product that doesn't exist in the purchase",
    () => {
      const productReview = createProductReview();
      const cartPurchase = createCartPurchase();
      const purchasesHistoryController = new PurchasesHistoryController();
      purchasesHistoryController.addPurchase(cartPurchase);
      vi.spyOn(
        ProductPurchaseRepo.prototype,
        "getProductsPurchaseById"
      ).mockReturnValue([]);
      expect(() =>
        purchasesHistoryController.addProductPurchaseReview(
          "admin",
          "purchaseId",
          "productId2",
          5,
          "title",
          "description"
        )
      ).toThrow();
    }
  );

  // try to add a review to a purchase that doesn't exist
  itUnitIntegration(
    "❎adds product purchase review to a purchase that doesn't exist",
    () => {
      const productReview = createProductReview();
      const cartPurchase = createCartPurchase();
      const purchasesHistoryController = new PurchasesHistoryController();
      purchasesHistoryController.addPurchase(cartPurchase);
      expect(() =>
        purchasesHistoryController.addProductPurchaseReview(
          "admin",
          "purchaseId2",
          "productId",
          5,
          "title",
          "description"
        )
      ).toThrow();
    }
  );
});

// add store purchase review
describe("addStorePurchaseReview", () => {
  itUnitIntegration("✅adds store purchase review", () => {
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();
    purchasesHistoryController.addPurchase(cartPurchase);
    vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
      false
    );
    vi.spyOn(BasketPurchaseRepo.prototype, "hasPurchase").mockReturnValue(true);
    expect(() =>
      purchasesHistoryController.addStorePurchaseReview(
        "admin",
        "purchaseId",
        "storeId",
        5
      )
    ).not.toThrow();
  });
  itUnitIntegration("❎ adds two store purchase reviews", () => {
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();
    purchasesHistoryController.addPurchase(cartPurchase);
    purchasesHistoryController.addStorePurchaseReview(
      "admin",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
      true
    );
    expect(() =>
      purchasesHistoryController.addStorePurchaseReview(
        "admin",
        "purchaseId",
        "storeId",
        5
      )
    ).toThrow();
  });
  itUnitIntegration("❎No such store", () => {
    const productPurchase = createProductPurchase();
    const productReview = createProductReview();
    const purchasesHistoryController = new PurchasesHistoryController();
    vi.spyOn(BasketPurchaseRepo.prototype, "hasPurchase").mockReturnValue(
      false
    );
    expect(() =>
      purchasesHistoryController.addStorePurchaseReview(
        "admin",
        "storeId",
        "purchaseId",
        5
      )
    ).toThrow();
  });
});

describe("getCartPurchaseByUserId", () => {
  it("✅gets cart purchase", () => {
    controllers.PurchasesHistory.initRepos(repos);
    const cartPurchase = createCartPurchase(repos);
    const purchasesHistoryController = new PurchasesHistoryController(repos);
    purchasesHistoryController.initControllers(controllers);
    vi.spyOn(AuthController.prototype, "register").mockReturnValue("admin");
    const userId = purchasesHistoryController.Controllers.Auth.register(
      "admin",
      "admin"
    );
    vi.spyOn(JobsController.prototype, "setInitialAdmin").mockReturnValue();
    purchasesHistoryController.Controllers.Jobs.setInitialAdmin(userId);
    vi.spyOn(CartPurchaseRepo.prototype, "addCartPurchase").mockReturnValue();
    vi.spyOn(
      BasketPurchaseRepo.prototype,
      "addBasketPurchase"
    ).mockReturnValue();
    vi.spyOn(
      ProductPurchaseRepo.prototype,
      "addProductPurchase"
    ).mockReturnValue();
    vi.spyOn(
      CartPurchaseRepo.prototype,
      "doesPurchaseExist"
    ).mockReturnValueOnce(false);
    purchasesHistoryController.addPurchase(cartPurchase);
    vi.spyOn(JobsController.prototype, "isSystemAdmin").mockReturnValue(true);
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      true
    );
    vi.spyOn(CartPurchaseRepo.prototype, "getPurchasesByUser").mockReturnValue([
      cartPurchase,
    ]);
    expect(
      purchasesHistoryController.getPurchasesByUser(
        "admin",
        cartPurchase.UserId
      )
    ).toStrictEqual([cartPurchase.ToDTO()]);
  });
  it("❎gets undefined cart purchase", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    purchasesHistoryController.initControllers(controllers);
    vi.spyOn(AuthController.prototype, "register").mockReturnValue("admin");
    const userId = purchasesHistoryController.Controllers.Auth.register(
      "admin",
      "admin"
    );
    vi.spyOn(JobsController.prototype, "setInitialAdmin").mockReturnValue();
    purchasesHistoryController.Controllers.Jobs.setInitialAdmin(userId);
    vi.spyOn(JobsController.prototype, "isSystemAdmin").mockReturnValue(true);
    expect(
      purchasesHistoryController.getPurchasesByUser("admin", "admin")
    ).toStrictEqual([]);
  });
  itUnitIntegration("❎try to get purchases when not an admin", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    vi.spyOn(JobsController.prototype, "isSystemAdmin").mockReturnValue(false);
    expect(() =>
      purchasesHistoryController.getPurchasesByUser("admin", "admin")
    ).toThrow();
  });
});

describe("getCartPurchaseByPurchaseId", () => {
  itUnitIntegration("✅gets cart purchase", () => {
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();

    purchasesHistoryController.addPurchase(cartPurchase);
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      true
    );
    expect(
      purchasesHistoryController.getPurchase(cartPurchase.PurchaseId)
    ).toStrictEqual(cartPurchase.ToDTO());
  });
  itUnitIntegration("❎gets undefined cart purchase", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(() =>
      purchasesHistoryController.getPurchase("purchaseId")
    ).toThrow();
  });
});

// test add purchase
describe("addPurchase", () => {
  itUnitIntegration("✅adds purchase", () => {
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();
    purchasesHistoryController.addPurchase(cartPurchase);
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      true
    );
    expect(
      purchasesHistoryController.getPurchase(cartPurchase.PurchaseId)
    ).toStrictEqual(cartPurchase.ToDTO());
  });

  itUnitIntegration("❎ add two purchases with same id", () => {
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();

    purchasesHistoryController.addPurchase(cartPurchase);
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      true
    );
    expect(() =>
      purchasesHistoryController.addPurchase(cartPurchase)
    ).toThrow();
  });
});

// test get reviews by product id
describe("getReviewsByProductId", () => {
  itUnitIntegration("✅gets reviews by product id", () => {
    const productReview = createProductReview();
    const purchasesHistoryController = new PurchasesHistoryController();
    const cartPurchase = createCartPurchase();
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      false
    );
    purchasesHistoryController.addPurchase(cartPurchase);
    purchasesHistoryController.addProductPurchaseReview(
      "admin",
      "purchaseId",
      "productId",
      5,
      "title",
      "description"
    );

    expect(
      purchasesHistoryController.getReviewsByProduct("productId").reviews.length
    ).toBe(1);
    expect(
      purchasesHistoryController.getReviewsByProduct("productId").avgRating
    ).toBe(5);
  });
  itUnitIntegration("❎gets undefined reviews by product id", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(
      purchasesHistoryController.getReviewsByProduct("productId").reviews
    ).toStrictEqual([]);
  });
});

// test get reviews by store id
describe("getReviewsByStore", () => {
  itUnitIntegration("✅gets reviews by store id", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    const cartPurchase = createCartPurchase();
    purchasesHistoryController.addPurchase(cartPurchase);
    purchasesHistoryController.addStorePurchaseReview(
      "admin",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "getAllStoreReviews").mockReturnValue([
      createReview(),
    ]);
    expect(purchasesHistoryController.getReviewsByStore("storeId")).toBe(1);
  });
  itUnitIntegration("❎gets undefined reviews by store id", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(
      purchasesHistoryController.getReviewsByStore("storeId")
    ).toStrictEqual(0);
  });

  itUnitIntegration("❎try and review a store twice", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    const cartPurchase = createCartPurchase();
    purchasesHistoryController.addPurchase(cartPurchase);
    purchasesHistoryController.addStorePurchaseReview(
      "admin",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
      true
    );
    expect(() =>
      purchasesHistoryController.addStorePurchaseReview(
        "admin",
        "purchaseId",
        "storeId",
        5
      )
    ).toThrow();
  });
});

// test get purchase by store id
describe("getPurchasesByStore", () => {
  itUnitIntegration("✅gets purchases by store id", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    const cartPurchase = createCartPurchase();
    purchasesHistoryController.addPurchase(cartPurchase);
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      true
    );
    expect(
      purchasesHistoryController.getPurchasesByStore("storeId").length
    ).toBe(1);
  });
  itUnitIntegration("❎gets undefined purchases by store id", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(
      purchasesHistoryController.getPurchasesByStore("storeId").length
    ).toBe(0);
  });
});

// test getStoreRating
describe("getStoreRating", () => {
  itUnitIntegration("✅gets store rating", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    const cartPurchase = createCartPurchase();
    purchasesHistoryController.addPurchase(cartPurchase);
    purchasesHistoryController.addStorePurchaseReview(
      "admin",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "getAllStoreReviews").mockReturnValue([
      createReview(),
    ]);
    expect(purchasesHistoryController.getStoreRating("storeId")).toBe(5);
  });
  itUnitIntegration("❎gets undefined store rating", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(purchasesHistoryController.getStoreRating("storeId")).toBe(0);
  });
});

describe("PurchaseCart", () => {
  it("✅purchase cart", () => {
    const cartPurchase = createCartPurchase();
    const basketDTO = {
      storeId: "storeId",
      products: [
        {
          storeProductId: "productId",
          quantity: 1,
        },
      ],
    };
    const StoreIDToBasketMap = new Map<string, BasketDTO>();
    StoreIDToBasketMap.set("storeId", basketDTO);
    const cartDTO = {
      storeIdToBasket: StoreIDToBasketMap,
    };
    // spy on storeproductrepo getProductById
    const purchasesHistoryController = new PurchasesHistoryController();
    vi.spyOn(CartPurchase, "CartPurchaseDTOfromCartDTO").mockReturnValue(
      cartPurchase.ToDTO()
    );
    vi.spyOn(CartPurchase, "fromDTO").mockReturnValue(cartPurchase);
    purchasesHistoryController.purchaseCart("admin", cartDTO, 1, {
      number: "316586",
    });

    expect(
      purchasesHistoryController.getPurchase(cartPurchase.PurchaseId)
    ).toStrictEqual(cartPurchase.ToDTO());
  });
  it("❎purchase adaptor returns false", () => {
    const cartPurchase = createCartPurchase();
    const basketDTO = {
      storeId: "storeId",
      products: [
        {
          storeProductId: "productId",
          quantity: 1,
        },
      ],
    };
    const StoreIDToBasketMap = new Map<string, BasketDTO>();
    StoreIDToBasketMap.set("storeId", basketDTO);
    const cartDTO = {
      storeIdToBasket: StoreIDToBasketMap,
    };
    // spy on storeproductrepo getProductById
    vi.spyOn(PaymentAdapter, "pay").mockReturnValue(false);
    const purchasesHistoryController = new PurchasesHistoryController();
    vi.spyOn(CartPurchase, "CartPurchaseDTOfromCartDTO").mockReturnValue(
      cartPurchase.ToDTO()
    );
    vi.spyOn(CartPurchase, "fromDTO").mockReturnValue(cartPurchase);
    expect(() =>
      purchasesHistoryController.purchaseCart("admin", cartDTO, 1, {
        number: "316586",
      })
    ).toThrow();
    
  });
  it("❎purchase cart with no cart", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    const cartPurchase = createCartPurchase();
    const basketDTO = {
      storeId: "storeId",
      products: [
        {
          storeProductId: "productId",
          quantity: 1,
        },
      ],
    };
    const StoreIDToBasketMap = new Map<string, BasketDTO>();
    StoreIDToBasketMap.set("storeId", basketDTO);
    const cartDTO = {
      storeIdToBasket: StoreIDToBasketMap,
    };
    vi.spyOn(CartPurchase, "CartPurchaseDTOfromCartDTO").mockReturnValue(
      cartPurchase.ToDTO()
    );
    vi.spyOn(CartPurchase, "fromDTO").mockReturnValue(cartPurchase);
    purchasesHistoryController.purchaseCart("admin", cartDTO, 1, {
      number: "316586",
    });

    expect(() =>
      purchasesHistoryController.purchaseCart("admin", cartDTO, 1, {
        number: "316586",
      })
    ).toThrow();
  });
});
