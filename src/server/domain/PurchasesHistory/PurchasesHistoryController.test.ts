import { describe, expect, it, vi, beforeEach } from "vitest";
import { PurchasesHistoryController } from "./PurchasesHistoryController";
import { ProductReview } from "./ProductReview";
import { type Repos, createRepos, createMockRepos } from "./_HasRepos";
import { ProductPurchase } from "./ProductPurchaseHistory";
import { BasketPurchase } from "./BasketPurchaseHistory";
import { CartPurchase } from "./CartPurchaseHistory";
import { ProductPurchaseRepo } from "./PurchasesHistory/ProductPurchaseHistoryRepo";
import { CartPurchaseRepo } from "./PurchasesHistory/CartPurchaseHistoryRepo";
import { ProductReviewRepo } from "./PurchasesHistory/ProductReviewsRepo";
import { itUnitIntegration } from "../_mock";
import { type Controllers } from "../_HasController";
import { createMockControllers } from "../_createControllers";
import { getDB, resetDB } from "../_Transactional";
import { ReviewRepo } from "./PurchasesHistory/ReviewRepo";
import { BasketPurchaseRepo } from "./PurchasesHistory/BasketPurchaseHistoryRepo";
import { JobsController } from "../Jobs/JobsController";
import { fa } from "@faker-js/faker";
import { Review } from "./Review";
import { BasketDTO } from "../Users/Basket";
import { PaymentDetails } from "./PaymentAdaptor";
import { DeliveryDetails } from "./DeliveryAdaptor";

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

// add product purchase review
// describe("addProductPurchaseReview", () => {
//   itUnitIntegration("✅adds product purchase review", async () => {
//     const productReview = new ProductReview(productReviewData);
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );
//     vi.spyOn(CartPurchaseRepo.prototype, "getPurchaseById").mockReturnValue(
//       Promise.resolve(cartPurchase)
//     );
//     vi.spyOn(
//       ProductReviewRepo.prototype,
//       "doesProductReviewExist"
//     ).mockReturnValue(Promise.resolve(false));
//     vi.spyOn(
//       ProductPurchaseRepo.prototype,
//       "getProductsPurchaseById"
//     ).mockReturnValue(
//       Promise.resolve([new ProductPurchase(productPurchaseData)])
//     );
//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     expect(() =>
//       controllers.PurchasesHistory.addProductPurchaseReview(
//         "admin",
//         "purchaseId",
//         "productId",
//         5,
//         "title",
//         "description",
//         "storeId"
//       )
//     ).not.toThrow();
//   });

//   // try to review the same product twice in the same purchase
//   itUnitIntegration("❎adds two product purchase reviews", async () => {
//     const productReview = new ProductReview(productReviewData);
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );

//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     await controllers.PurchasesHistory.addProductPurchaseReview(
//       productReview.UserId,
//       productReview.PurchaseId,
//       productReview.ProductId,
//       productReview.Rating,
//       productReview.Title,
//       productReview.Description,
//       productReview.StoreId
//     );
//     vi.spyOn(
//       ProductReviewRepo.prototype,
//       "doesProductReviewExist"
//     ).mockReturnValue(Promise.resolve(true));
//     await expect(() =>
//       controllers.PurchasesHistory.addProductPurchaseReview(
//         "admin",
//         "purchaseId",
//         "productId",
//         5,
//         "title",
//         "description",
//         "storeId"
//       )
//     ).rejects.toThrow();
//   });

//   // try to review a product that doesn't exist in the purchase
//   itUnitIntegration(
//     "❎adds product purchase review to a product that doesn't exist in the purchase",
//     async () => {
//       const productReview = new ProductReview(productReviewData);
//       const cartPurchase = new CartPurchase(
//         cartPurchaseData.userId,
//         cartPurchaseData.purchaseId,
//         cartPurchaseData.storeIdToBasketPurchases,
//         cartPurchaseData.totalPrice
//       );
//       await controllers.PurchasesHistory.addPurchase(cartPurchase);
//       vi.spyOn(
//         ProductPurchaseRepo.prototype,
//         "getProductsPurchaseById"
//       ).mockReturnValue(Promise.resolve([]));
//       await expect(async () =>
//         controllers.PurchasesHistory.addProductPurchaseReview(
//           "admin",
//           "purchaseId",
//           "productId2",
//           5,
//           "title",
//           "description",
//           "storeId"
//         )
//       ).rejects.toThrow();
//     }
//   );

//   // try to add a review to a purchase that doesn't exist
//   itUnitIntegration(
//     "❎adds product purchase review to a purchase that doesn't exist",
//     async () => {
//       const productReview = new ProductReview(productReviewData);
//       const cartPurchase = new CartPurchase(
//         cartPurchaseData.userId,
//         cartPurchaseData.purchaseId,
//         cartPurchaseData.storeIdToBasketPurchases,
//         cartPurchaseData.totalPrice
//       );
//       await controllers.PurchasesHistory.addPurchase(cartPurchase);
//       await expect(() =>
//         controllers.PurchasesHistory.addProductPurchaseReview(
//           "admin",
//           "purchaseId2",
//           "productId",
//           5,
//           "title",
//           "description",
//           "storeId"
//         )
//       ).rejects.toThrow();
//     }
//   );
// });

// add store purchase review
// describe("addStorePurchaseReview", () => {
//   itUnitIntegration("✅adds store purchase review", async () => {
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );
//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
//       Promise.resolve(false)
//     );
//     vi.spyOn(BasketPurchaseRepo.prototype, "hasPurchase").mockReturnValue(Promise.resolve(true));
//     expect(async () =>
//       await controllers.PurchasesHistory.addStorePurchaseReview(
//         "admin",
//         "purchaseId",
//         "storeId",
//         5
//       )
//     ).not.toThrow();
//   });
//   itUnitIntegration("❎ adds two store purchase reviews", async () => {
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );
//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     await controllers.PurchasesHistory.addStorePurchaseReview(
//       "admin",
//       "purchaseId",
//       "storeId",
//       5
//     );
//     vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
//       Promise.resolve(true)
//     );
//     await expect(() =>
//       controllers.PurchasesHistory.addStorePurchaseReview(
//         "admin",
//         "purchaseId",
//         "storeId",
//         5
//       )
//     ).rejects.toThrow();
//   });
//   itUnitIntegration("❎No such store", async () => {
//     vi.spyOn(BasketPurchaseRepo.prototype, "hasPurchase").mockReturnValue(
//       Promise.resolve(false)
//     );
//     await expect(() =>
//       controllers.PurchasesHistory.addStorePurchaseReview(
//         "admin",
//         "storeId",
//         "purchaseId",
//         5
//       )
//     ).rejects.toThrow();
//   });
// });

// describe("getCartPurchaseByUserId", () => {
//   it("✅gets cart purchase", async () => {
//     controllers.PurchasesHistory.initRepos(repos);
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );
//     vi.spyOn(controllers.Auth, "register").mockReturnValue(
//       Promise.resolve("admin")
//     );
//     const userId = await controllers.Auth.register("admin", "admin");
//     vi.spyOn(controllers.Jobs, "setInitialAdmin").mockReturnValue(
//       Promise.resolve()
//     );
//     await controllers.Jobs.setInitialAdmin(userId);
//     vi.spyOn(CartPurchaseRepo.prototype, "addCartPurchase").mockReturnValue(
//       Promise.resolve()
//     );
//     vi.spyOn(BasketPurchaseRepo.prototype, "addBasketPurchase").mockReturnValue(
//       Promise.resolve()
//     );
//     vi.spyOn(
//       ProductPurchaseRepo.prototype,
//       "addProductPurchase"
//     ).mockReturnValue(Promise.resolve());
//     vi.spyOn(
//       CartPurchaseRepo.prototype,
//       "doesPurchaseExist"
//     ).mockReturnValueOnce(Promise.resolve(false));
//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     vi.spyOn(JobsController.prototype, "isSystemAdmin").mockReturnValue(true);
//     vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
//       Promise.resolve(true)
//     );
//     vi.spyOn(CartPurchaseRepo.prototype, "getPurchasesByUser").mockReturnValue(
//       Promise.resolve([cartPurchase])
//     );
//     expect(
//       await controllers.PurchasesHistory.getPurchasesByUser(
//         "admin",
//         cartPurchase.UserId
//       )
//     ).toStrictEqual([cartPurchase.ToDTO()]);
//   });

//   it("❎gets undefined cart purchase", async () => {
//     vi.spyOn(controllers.Auth, "register").mockReturnValue(
//       Promise.resolve("admin")
//     );
//     const userId = await controllers.Auth.register("admin", "admin");
//     vi.spyOn(JobsController.prototype, "setInitialAdmin").mockReturnValue(
//       Promise.resolve()
//     );
//     await controllers.Jobs.setInitialAdmin(userId);
//     vi.spyOn(JobsController.prototype, "isSystemAdmin").mockReturnValue(
//       Promise.resolve(true)
//     );
//     expect(
//       await controllers.PurchasesHistory.getPurchasesByUser("admin", "admin")
//     ).toStrictEqual([]);
//   });

//   itUnitIntegration("❎try to get purchases when not an admin", async () => {
//     vi.spyOn(JobsController.prototype, "isSystemAdmin").mockReturnValue(
//       Promise.resolve(false)
//     );
//     await expect(() =>
//       controllers.PurchasesHistory.getPurchasesByUser("admin", "admin")
//     ).rejects.toThrow();
//   });
// });

// describe("getCartPurchaseByPurchaseId", () => {
//   itUnitIntegration("✅gets cart purchase", async () => {
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );

//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
//       Promise.resolve(true)
//     );
//     expect(
//       await controllers.PurchasesHistory.getPurchase(cartPurchase.PurchaseId)
//     ).toStrictEqual(cartPurchase.ToDTO());
//   });
//   itUnitIntegration("❎gets undefined cart purchase", async () => {
//     await expect(() =>
//       controllers.PurchasesHistory.getPurchase("purchaseId")
//     ).rejects.toThrow();
//   });
// });

// // test add purchase
// describe("addPurchase", () => {
//   itUnitIntegration("✅adds purchase", async () => {
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );
//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
//       Promise.resolve(true)
//     );
//     expect(
//       await controllers.PurchasesHistory.getPurchase(cartPurchase.PurchaseId)
//     ).toStrictEqual(cartPurchase.ToDTO());
//   });

//   itUnitIntegration("❎ add two purchases with same id", async () => {
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );

//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
//       Promise.resolve(true)
//     );
//     await expect(() =>
//       controllers.PurchasesHistory.addPurchase(cartPurchase)
//     ).rejects.toThrow();
//   });
// });

// // test get reviews by product id
// describe("getReviewsByProductId", () => {
//   itUnitIntegration("✅gets reviews by product id", async () => {
//     const productReview = new ProductReview(productReviewData);
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );
//     vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
//       Promise.resolve(false)
//     );
//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     await controllers.PurchasesHistory.addProductPurchaseReview(
//       "admin",
//       "purchaseId",
//       "productId",
//       5,
//       "title",
//       "description",
//       "storeId"
//     );
//     const reviews = await controllers.PurchasesHistory.getReviewsByProduct(
//       "productId"
//     );
//     expect(reviews.reviews.length).toBe(1);
//     expect(reviews.avgRating).toBe(5);
//   });
//   itUnitIntegration("❎gets undefined reviews by product id", async () => {
//     const reviews = await controllers.PurchasesHistory.getReviewsByProduct(
//       "productId"
//     );
//     expect(reviews.reviews).toStrictEqual([]);
//   });
// });

// test get reviews by store id
// describe("getReviewsByStore", () => {
//   itUnitIntegration("✅gets reviews by store id", async () => {
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );
//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     await controllers.PurchasesHistory.addStorePurchaseReview(
//       "admin",
//       "purchaseId",
//       "storeId",
//       5
//     );
//     vi.spyOn(ReviewRepo.prototype, "getAllStoreReviews").mockReturnValue(
//       Promise.resolve([new Review(reviewData)])
//     );
//     expect(await controllers.PurchasesHistory.getReviewsByStore("storeId")).toBe(1);
//   });
//   itUnitIntegration("❎gets undefined reviews by store id", async () => {
//     expect(
//       await controllers.PurchasesHistory.getReviewsByStore("storeId")
//     ).toStrictEqual(0);
//   });

//   itUnitIntegration("❎try and review a store twice", async () => {
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );
//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     await controllers.PurchasesHistory.addStorePurchaseReview(
//       "admin",
//       "purchaseId",
//       "storeId",
//       5
//     );
//     vi.spyOn(ReviewRepo.prototype, "doesStoreReviewExist").mockReturnValue(
//       Promise.resolve(true)
//     );
//     await expect(() =>
//       controllers.PurchasesHistory.addStorePurchaseReview(
//         "admin",
//         "purchaseId",
//         "storeId",
//         5
//       )
//     ).rejects.toThrow();
//   });
// });

// // test get purchase by store id
// describe("getPurchasesByStore", () => {
//   itUnitIntegration("✅gets purchases by store id", async () => {
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );
//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     vi.spyOn(CartPurchaseRepo.prototype, "doesPurchaseExist").mockReturnValue(
//       Promise.resolve(true)
//     );
//     const purchases = await controllers.PurchasesHistory.getPurchasesByStore(
//       "storeId"
//     );
//     expect(purchases.length).toBe(1);
//   });
//   itUnitIntegration("❎gets undefined purchases by store id", async () => {
//     const purchases = await controllers.PurchasesHistory.getPurchasesByStore(
//       "storeId"
//     );
//     expect(purchases.length).toBe(0);
//   });
// });

// // test getStoreRating
// describe("getStoreRating", () => {
//   itUnitIntegration("✅gets store rating", async () => {
//     const cartPurchase = new CartPurchase(
//       cartPurchaseData.userId,
//       cartPurchaseData.purchaseId,
//       cartPurchaseData.storeIdToBasketPurchases,
//       cartPurchaseData.totalPrice
//     );
//     await controllers.PurchasesHistory.addPurchase(cartPurchase);
//     await controllers.PurchasesHistory.addStorePurchaseReview(
//       "admin",
//       "purchaseId",
//       "storeId",
//       5
//     );
//     vi.spyOn(ReviewRepo.prototype, "getAllStoreReviews").mockReturnValue(
//       Promise.resolve([new Review(reviewData)])
//     );
//     expect(await controllers.PurchasesHistory.getStoreRating("storeId")).toBe(5);
//   });
//   itUnitIntegration("❎gets undefined store rating", async () => {
//     expect(await controllers.PurchasesHistory.getStoreRating("storeId")).toBe(0);
//   });
// });

describe("PurchaseCart", () => {
  it("✅purchase cart", async () => {
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

    // spy on storeproductrepo getProductById
    vi.spyOn(
      controllers.PurchasesHistory,
      "CartPurchaseDTOfromCartDTO"
    ).mockReturnValue(Promise.resolve(cartPurchase.ToDTO()));
    vi.spyOn(CartPurchase, "fromDTO").mockReturnValue(cartPurchase);
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
      number: "316586",
      month: "1",
      year: "2024",
      holder: "admin",
      ccv: "123",
      id: "13513532",
    };

    const deliveryDetails: DeliveryDetails = {
      name: "admin",
      address: "admin",
      city: "admin",
      country: "admin",
      zip: "admin",
    };
    const cartDTO = {
      purchaseId: "purchaseId",
      userId: "userId",
      storeIdToBasket: StoreIDToBasketMap,
      totalPrice: 1,
    };

    await controllers.PurchasesHistory.purchaseCart(
      "admin",
      cartDTO,
      1,
      paymentDetails,
      deliveryDetails
    );

    expect(
      controllers.PurchasesHistory.getPurchase(cartPurchase.PurchaseId)
    ).toStrictEqual(cartPurchase.ToDTO());
  });
  
  it("❎purchase adaptor returns false", () => {
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
    vi.spyOn(
      controllers.PurchasesHistory,
      "CartPurchaseDTOfromCartDTO"
    ).mockReturnValue(cartPurchase.ToDTO());
    vi.spyOn(CartPurchase, "fromDTO").mockReturnValue(cartPurchase);
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockReturnValue(
      true
    );
    vi.spyOn(controllers.Stores, "decreaseProductQuantity").mockReturnValue();
    expect(() =>
      controllers.PurchasesHistory.purchaseCart("admin", cartDTO, 1, {
        number: "316586",
      })
    ).toThrow();
  });
  it("❎purchase cart with no cart", () => {
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
    vi.spyOn(
      controllers.PurchasesHistory,
      "CartPurchaseDTOfromCartDTO"
    ).mockReturnValue(Promise.resolve(cartPurchase.ToDTO()));
    vi.spyOn(CartPurchase, "fromDTO").mockReturnValue(cartPurchase);
    vi.spyOn(controllers.Stores, "isProductQuantityInStock").mockReturnValue(
      true
    );
    vi.spyOn(controllers.Stores, "decreaseProductQuantity").mockReturnValue();
    controllers.PurchasesHistory.purchaseCart("admin", cartDTO, 1, {
      number: "316586",
    });

    expect(() =>
      controllers.PurchasesHistory.purchaseCart("admin", cartDTO, 1, {
        number: "316586",
      })
    ).toThrow();
  });
});
