import { describe, expect, it, vi } from "vitest";
import { PurchasesHistoryController } from "./PurchasesHistoryController";
import { ProductReviewArgs, ProductReview } from "./ProductReview";
import { Repos, createRepos } from "./HasRepos";
import { Review } from "./Review";
import { ProductPurchase } from "./ProductPurchaseHistory";
import { BasketPurchase } from "./BasketPurchaseHistory";
import { CartPurchase } from "./CartPurchaseHistory";
import { ProductPurchaseRepo } from "~/DomainLayer/PurchasesHistory/PurchasesHistory/ProductPurchaseHistoryRepo";
import exp from "constants";
import { BasketProductDTO } from "../Users/BasketProduct";
import { BasketDTO } from "../Users/Basket";
import { CartPurchaseRepo } from "./PurchasesHistory/CartPurchaseHistoryRepo";
import { ProductReviewRepo } from "./PurchasesHistory/ProductReviewsRepo";
import { ReviewRepo } from "./PurchasesHistory/ReviewRepo";
import { BasketPurchaseRepo } from "./PurchasesHistory/BasketPurchaseHistoryRepo";

const reviewData = {
  rating: 5,
  id: "id",
  createdAt: new Date(),
  userId: "userId",
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
  userId: "userId",
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
  userId: "userId",
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
  it("✅adds product purchase review", () => {
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
        "userId",
        "purchaseId",
        "productId",
        5,
        "title",
        "description"
      )
    ).not.toThrow();
  });

  // try to review the same product twice in the same purchase
  it("❎adds two product purchase reviews", () => {
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
        "userId",
        "purchaseId",
        "productId",
        5,
        "title",
        "description"
      )
    ).toThrow();
  });

  // try to review a product that doesn't exist in the purchase
  it("❎adds product purchase review to a product that doesn't exist in the purchase", () => {
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
        "userId",
        "purchaseId",
        "productId2",
        5,
        "title",
        "description"
      )
    ).toThrow();
  });

  // try to add a review to a purchase that doesn't exist
  it("❎adds product purchase review to a purchase that doesn't exist", () => {
    const productReview = createProductReview();
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();
    purchasesHistoryController.addPurchase(cartPurchase);
    expect(() =>
      purchasesHistoryController.addProductPurchaseReview(
        "userId",
        "purchaseId2",
        "productId",
        5,
        "title",
        "description"
      )
    ).toThrow();
  });
});

// add store purchase review
describe("addStorePurchaseReview", () => {
  it("✅adds store purchase review", () => {
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();
    purchasesHistoryController.addPurchase(cartPurchase);
    vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
      false
    );
    vi.spyOn(BasketPurchaseRepo.prototype, "hasPurchase").mockReturnValue(true);
    expect(() =>
      purchasesHistoryController.addStorePurchaseReview(
        "userId",
        "purchaseId",
        "storeId",
        5
      )
    ).not.toThrow();
  });
  it("❎ adds two store purchase reviews", () => {
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();
    purchasesHistoryController.addPurchase(cartPurchase);
    purchasesHistoryController.addStorePurchaseReview(
      "userId",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
      true
    );
    expect(() =>
      purchasesHistoryController.addStorePurchaseReview(
        "userId",
        "purchaseId",
        "storeId",
        5
      )
    ).toThrow();
  });
  it("❎No such store", () => {
    const productPurchase = createProductPurchase();
    const productReview = createProductReview();
    const purchasesHistoryController = new PurchasesHistoryController();
    vi.spyOn(BasketPurchaseRepo.prototype, "hasPurchase").mockReturnValue(
      false
    );
    expect(() =>
      purchasesHistoryController.addStorePurchaseReview(
        "userId",
        "storeId",
        "purchaseId",
        5
      )
    ).toThrow();
  });
});

describe("getCartPurchaseByUserId", () => {
  it("✅gets cart purchase", () => {
    const cartPurchase = createCartPurchase();
    const purchasesHistoryController = new PurchasesHistoryController();
    purchasesHistoryController.addPurchase(cartPurchase);

    expect(
      purchasesHistoryController.getPurchasesByUser(cartPurchase.UserId)
    ).toStrictEqual([cartPurchase.ToDTO()]);
  });
  it("❎gets undefined cart purchase", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(
      purchasesHistoryController.getPurchasesByUser("userId")
    ).toStrictEqual([]);
  });
});

describe("getCartPurchaseByPurchaseId", () => {
  it("✅gets cart purchase", () => {
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
  it("❎gets undefined cart purchase", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(() =>
      purchasesHistoryController.getPurchase("purchaseId")
    ).toThrow();
  });
});

// test add purchase
describe("addPurchase", () => {
  it("✅adds purchase", () => {
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

  it("❎ add two purchases with same id", () => {
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
  it("✅gets reviews by product id", () => {
    const productReview = createProductReview();
    const purchasesHistoryController = new PurchasesHistoryController();
    const cartPurchase = createCartPurchase();
    vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
      false
    );
    purchasesHistoryController.addPurchase(cartPurchase);
    purchasesHistoryController.addProductPurchaseReview(
      "userId",
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
  it("❎gets undefined reviews by product id", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(
      purchasesHistoryController.getReviewsByProduct("productId").reviews
    ).toStrictEqual([]);
  });
});

// test get reviews by store id
describe("getReviewsByStore", () => {
  it("✅gets reviews by store id", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    const cartPurchase = createCartPurchase();
    purchasesHistoryController.addPurchase(cartPurchase);
    purchasesHistoryController.addStorePurchaseReview(
      "userId",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "getAllStoreReviews").mockReturnValue([
      createReview(),
    ]);
    expect(purchasesHistoryController.getReviewsByStore("storeId")).toBe(1);
  });
  it("❎gets undefined reviews by store id", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(
      purchasesHistoryController.getReviewsByStore("storeId")
    ).toStrictEqual(0);
  });

  it("❎try and review a store twice", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    const cartPurchase = createCartPurchase();
    purchasesHistoryController.addPurchase(cartPurchase);
    purchasesHistoryController.addStorePurchaseReview(
      "userId",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
      true
    );
    expect(() =>
      purchasesHistoryController.addStorePurchaseReview(
        "userId",
        "purchaseId",
        "storeId",
        5
      )
    ).toThrow();
  });
});

// test get purchase by store id
describe("getPurchasesByStore", () => {
  it("✅gets purchases by store id", () => {
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
  it("❎gets undefined purchases by store id", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    expect(
      purchasesHistoryController.getPurchasesByStore("storeId").length
    ).toBe(0);
  });
});

// test getStoreRating
describe("getStoreRating", () => {
  it("✅gets store rating", () => {
    const purchasesHistoryController = new PurchasesHistoryController();
    const cartPurchase = createCartPurchase();
    purchasesHistoryController.addPurchase(cartPurchase);
    purchasesHistoryController.addStorePurchaseReview(
      "userId",
      "purchaseId",
      "storeId",
      5
    );
    vi.spyOn(ReviewRepo.prototype, "getAllStoreReviews").mockReturnValue([
      createReview(),
    ]);
    expect(purchasesHistoryController.getStoreRating("storeId")).toBe(5);
  });
  it("❎gets undefined store rating", () => {
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
    purchasesHistoryController.purchaseCart("userId", cartDTO, 1, "creditCard");

    expect(
      purchasesHistoryController.getPurchase(cartPurchase.PurchaseId)
    ).toStrictEqual(cartPurchase.ToDTO());
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
    purchasesHistoryController.purchaseCart("userId", cartDTO, 1, "creditCard");

    expect(() =>
      purchasesHistoryController.purchaseCart(
        "userId",
        cartDTO,
        1,
        "creditCard"
      )
    ).toThrow();
  });
});
