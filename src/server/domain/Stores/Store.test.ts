import { describe, expect, it, vi } from "vitest";
import { Store } from "./Store";
import { createMockRepos, createTestRepos } from "./_HasRepos";
import { type BasketDTO } from "../Users/Basket";
import { ZodError } from "zod";
import { StoreProduct } from "./StoreProduct";
import {
  createCompositeConditionArgs,
  createCompositeDiscountArgs,
  createLiteralConditionArgs,
  createPromise,
  createSimpleDiscountArgs,
  createStore,
  createStoreWithProduct,
  createTimeConditionArgs,
  generateProductArgs,
  generateStoreName,
} from "./_data";
import { itUnitIntegration } from "../_mock";
import {
  createMockControllers,
  createTestControllers,
} from "../_createControllers";

async function generateForDiscountAndConstraintTests(testType: string) {
  const controllers = createTestControllers(testType, "Stores");
  vi.spyOn(controllers.PurchasesHistory, "getReviewsByProduct").mockReturnValue(
    { avgRating: 0, reviews: [] }
  );
  const productData = generateProductArgs();
  productData.name = "Milk";
  productData.category = "Food";
  const repos = createTestRepos(testType);
  vi.spyOn(controllers.PurchasesHistory, "getReviewsByProduct").mockReturnValue(
    { avgRating: 0, reviews: [] }
  );
  const { store, product } = await createStoreWithProduct(
    productData,
    repos,
    controllers
  );
  productData.quantity = 5;
  const product2Data = generateProductArgs();
  product2Data.name = "Meat";
  product2Data.category = "Meat";
  const product1BasketQuantity = 55;
  const product2BasketQuantity = 23;
  vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce(
    createPromise("aaa")
  );
  const product2Id = await store.createProduct(product2Data);
  const product2 = StoreProduct.fromDTO(
    { ...product2Data, id: product2Id, rating: 0 },
    controllers,
    repos
  );
  const basket: BasketDTO = {
    storeId: store.Id,
    products: [
      { quantity: product1BasketQuantity, storeProductId: product.Id },
      { quantity: product2BasketQuantity, storeProductId: product2Id },
    ],
  };
  vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce(
    createPromise([product, product2])
  );
  vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(createPromise(store));
  vi.spyOn(repos.Products, "getProductById").mockImplementation((id) => {
    if (id === product.Id) return createPromise(product);
    else return createPromise(product2);
  });
  const price = await store.getBasketPrice("", basket);
  return {
    price,
    product,
    product2,
    store,
    basket,
    product1BasketQuantity,
    product2BasketQuantity,
  };
}
describe("constructor", () => {
  itUnitIntegration("✅creates a store", (testType) => {
    const storeName = generateStoreName();
    const controllers = createTestControllers(testType, "Stores");
    const repos = createTestRepos(testType);
    const store = createStore(storeName, repos, controllers);
    expect(store.Name).toBe(storeName);
    expect(store.IsActive()).toBe(true);
  });

  itUnitIntegration("❎gets empty name", () => {
    expect(() => new Store("")).toThrow(ZodError);
  });
});

describe("createProduct", () => {
  itUnitIntegration("✅creates a product", async (testType) => {
    const controllers = createTestControllers(testType, "Stores");
    const repos = createTestRepos(testType);
    const storeName = generateStoreName();
    const store = createStore(storeName, repos, controllers);
    vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce(
      new Promise((resolve) => resolve("aaaaaa"))
    );
    const productData = generateProductArgs();
    const productId = await store.createProduct(productData);
    const product = StoreProduct.fromDTO(
      { ...productData, id: productId, rating: 0 },
      controllers,
      repos
    );
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValue(
      new Promise((resolve) => resolve([product]))
    );
    vi.spyOn(
      controllers.PurchasesHistory,
      "getReviewsByProduct"
    ).mockReturnValue({ avgRating: 0, reviews: [] });
    const products = await store.getProducts();
    expect(products.length).toBe(1);
    expect(products[0]).toEqual({
      ...productData,
      rating: 0,
      id: productId,
    });
  });

  it("❎fails in productRepo", () => {
    const storeName = generateStoreName();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const store = createStore(storeName, repos, controllers);
    vi.spyOn(repos.Products, "addProduct").mockImplementationOnce(() => {
      throw new Error("addProduct failed");
    });
    const productData = generateProductArgs();
    expect(() => store.createProduct(productData)).toThrow("addProduct failed");
  });
});
describe("get basket price", () => {
  itUnitIntegration("✅gets basket price", async (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const controllers = createTestControllers(testType, "Stores");
    const { store, product } = await createStoreWithProduct(
      productData,
      repos,
      controllers
    );
    const basket: BasketDTO = {
      storeId: store.Id,
      products: [
        { quantity: productData.quantity, storeProductId: product.Id },
      ],
    };
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(
      createPromise(store)
    );
    vi.spyOn(repos.Products, "getProductById").mockReturnValue(
      createPromise(product)
    );
    expect(store.getBasketPrice("", basket)).toBe(
      product.Price * productData.quantity
    );
  });
});
describe("Discounts", () => {
  itUnitIntegration("add simple product discount", async (testType) => {
    const {
      price,
      product,
      product2,
      store,
      basket,
      product1BasketQuantity,
      product2BasketQuantity,
    } = await generateForDiscountAndConstraintTests(testType);

    expect(store.getBasketPrice("", basket)).toBe(
      product.Price * product1BasketQuantity +
        product2.Price * product2BasketQuantity
    );
    const discountId = await store.addDiscount(
      createSimpleDiscountArgs(
        product.Name,
        15,
        "product",
        createLiteralConditionArgs(product.Name, 1, "Product", "AtLeast")
      )
    );
    const priceWithDiscount = await store.getBasketPrice("", basket);
    expect(priceWithDiscount).toBe(
      product.Price * product1BasketQuantity * (85 / 100) +
        product2.Price * product2BasketQuantity
    );
    await store.removeDiscount(discountId);
    expect(await store.getBasketPrice("", basket)).toBe(price);
  });
  itUnitIntegration("add simple category discount", async (testType) => {
    const {
      price,
      product,
      product2,
      store,
      basket,
      product1BasketQuantity,
      product2BasketQuantity,
    } = await generateForDiscountAndConstraintTests(testType);

    const discountId = await store.addDiscount(
      createSimpleDiscountArgs(
        product.Category,
        15,
        "category",
        createLiteralConditionArgs(product.Category, 1, "Category", "AtLeast")
      )
    );
    const priceWithDiscount = await store.getBasketPrice("", basket);
    expect(priceWithDiscount).toBe(
      product.Price * product1BasketQuantity * (85 / 100) +
        product2.Price * product2BasketQuantity
    );
    await store.removeDiscount(discountId);
    expect(await store.getBasketPrice("", basket)).toBe(price);
  });
  itUnitIntegration("add simple price discount", async (testType) => {
    const {
      price,
      product,
      product2,
      store,
      basket,
      product1BasketQuantity,
      product2BasketQuantity,
    } = await generateForDiscountAndConstraintTests(testType);

    const discountId = await store.addDiscount(
      createSimpleDiscountArgs(
        product.Category,
        15,
        "category",
        createLiteralConditionArgs(
          product.Category,
          price - 5,
          "Price",
          "AtLeast"
        )
      )
    );
    const priceWithDiscount = await store.getBasketPrice("", basket);
    expect(priceWithDiscount).toBe(
      product.Price * product1BasketQuantity * (85 / 100) +
        product2.Price * product2BasketQuantity
    );
    await store.removeDiscount(discountId);
    expect(await store.getBasketPrice("", basket)).toBe(price);
    const discountId1 = await store.addDiscount(
      createSimpleDiscountArgs(
        product.Category,
        15,
        "category",
        createLiteralConditionArgs(
          product.Category,
          price - 5,
          "Price",
          "AtMost"
        )
      )
    );
    const priceWithDiscount1 = await store.getBasketPrice("", basket);
    expect(priceWithDiscount1).toBe(price);
    await store.removeDiscount(discountId1);
    expect(await store.getBasketPrice("", basket)).toBe(price);
  });
  itUnitIntegration("add simple basket discount", async (testType) => {
    const {
      price,
      product,
      product2,
      store,
      basket,
      product1BasketQuantity,
      product2BasketQuantity,
    } = await generateForDiscountAndConstraintTests(testType);

    const discountId = await store.addDiscount(
      createSimpleDiscountArgs(
        product.Category,
        15,
        "store",
        createLiteralConditionArgs(product.Category, 1, "Store", "AtLeast")
      )
    );
    const priceWithDiscount = await store.getBasketPrice("", basket);
    expect(priceWithDiscount).toBe(
      product.Price * product1BasketQuantity * (85 / 100) +
        product2.Price * product2BasketQuantity * (85 / 100)
    );
    await store.removeDiscount(discountId);
    expect(await store.getBasketPrice("", basket)).toBe(price);
  });
  itUnitIntegration(
    "add max discount with simple condition",
    async (testType) => {
      const {
        price,
        product,
        product2,
        store,
        basket,
        product1BasketQuantity,
        product2BasketQuantity,
      } = await generateForDiscountAndConstraintTests(testType);

      const discountId = await store.addDiscount(
        createCompositeDiscountArgs(
          createSimpleDiscountArgs(
            product.Category,
            15,
            "category",
            createLiteralConditionArgs(product.Category, 1, "Store", "AtLeast")
          ),
          createSimpleDiscountArgs(
            product.Category,
            15,
            "store",
            createLiteralConditionArgs(product.Category, 1, "Store", "AtLeast")
          ),
          "Max"
        )
      );
      const priceWithDiscount = await store.getBasketPrice("", basket);
      expect(priceWithDiscount).toBe(
        product.Price * product1BasketQuantity * (85 / 100) +
          product2.Price * product2BasketQuantity * (85 / 100)
      );
      await store.removeDiscount(discountId);
      expect(await store.getBasketPrice("", basket)).toBe(price);
    }
  );
  itUnitIntegration(
    "add compose ADD discount with simple condition",
    async (testType) => {
      const {
        price,
        product,
        product2,
        store,
        basket,
        product1BasketQuantity,
        product2BasketQuantity,
      } = await generateForDiscountAndConstraintTests(testType);
      const discountId = await store.addDiscount(
        createCompositeDiscountArgs(
          createSimpleDiscountArgs(
            product.Category,
            15,
            "category",
            createLiteralConditionArgs(product.Category, 1, "Store", "AtLeast")
          ),
          createSimpleDiscountArgs(
            product.Category,
            15,
            "store",
            createLiteralConditionArgs(product.Category, 1, "Store", "AtLeast")
          ),
          "Add"
        )
      );
      const priceWithDiscount = await store.getBasketPrice("", basket);
      expect(priceWithDiscount).toBe(
        product.Price * product1BasketQuantity * (70 / 100) +
          product2.Price * product2BasketQuantity * (85 / 100)
      );
      await store.removeDiscount(discountId);
      expect(await store.getBasketPrice("", basket)).toBe(price);
    }
  );
  itUnitIntegration(
    "add compose discount with And condition",
    async (testType) => {
      const {
        price,
        product,
        product2,
        store,
        basket,
        product1BasketQuantity,
        product2BasketQuantity,
      } = await generateForDiscountAndConstraintTests(testType);

      const discountId = await store.addDiscount(
        createCompositeDiscountArgs(
          createSimpleDiscountArgs(
            product.Category,
            15,
            "category",
            createCompositeConditionArgs(
              "And",
              createLiteralConditionArgs(
                product.Category,
                1,
                "Store",
                "AtLeast"
              ),
              createLiteralConditionArgs(product.Category, 1, "Store", "AtMost")
            )
          ),
          createSimpleDiscountArgs(
            product.Category,
            15,
            "store",
            createLiteralConditionArgs(product.Category, 1, "Store", "AtLeast")
          ),
          "Add"
        )
      );
      const priceWithDiscount = await store.getBasketPrice("", basket);
      expect(priceWithDiscount).toBe(
        product.Price * product1BasketQuantity * (85 / 100) +
          product2.Price * product2BasketQuantity * (85 / 100)
      );
      await store.removeDiscount(discountId);
      expect(await store.getBasketPrice("", basket)).toBe(price);
    }
  );
  itUnitIntegration(
    "add compose MAX discount with compose logic implies condition",
    async (testType) => {
      const {
        price,
        product,
        product2,
        store,
        basket,
        product1BasketQuantity,
        product2BasketQuantity,
      } = await generateForDiscountAndConstraintTests(testType);
      const discountId = await store.addDiscount({
        type: "Add",
        left: {
          condition: {
            type: "Composite",
            subType: "And",
            left: {
              type: "Literal",
              subType: "Product",
              amount: 1,
              conditionType: "AtLeast",
              searchFor: product.Name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 70,
              conditionType: "AtMost",
              searchFor: product.Name,
            },
          },
          amount: 15,
          discountOn: "product",
          searchFor: product.Name,
          type: "Simple",
        },
        right: {
          condition: {
            type: "Composite",
            subType: "And",
            left: {
              type: "Literal",
              subType: "Product",
              amount: 1,
              conditionType: "AtLeast",
              searchFor: product.Name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 70,
              conditionType: "AtMost",
              searchFor: product.Name,
            },
          },
          amount: 25,
          discountOn: "product",
          searchFor: product.Name,
          type: "Simple",
        },
      });
      const priceWithDiscount = await store.getBasketPrice("", basket);
      expect(priceWithDiscount).toBe(
        product.Price * product1BasketQuantity * (60 / 100) +
          product2.Price * product2BasketQuantity
      );
      await store.removeDiscount(discountId);
      expect(await store.getBasketPrice("", basket)).toBe(price);
      const discountId1 =await store.addDiscount({
        type: "Add",
        left: {
          condition: {
            type: "Composite",
            subType: "And",
            left: {
              type: "Literal",
              subType: "Product",
              amount: 1,
              conditionType: "AtLeast",
              searchFor: product.Name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 70,
              conditionType: "AtMost",
              searchFor: product.Name,
            },
          },
          amount: 15,
          discountOn: "product",
          searchFor: product.Name,
          type: "Simple",
        },
        right: {
          condition: {
            type: "Composite",
            subType: "And",
            left: {
              type: "Literal",
              subType: "Product",
              amount: 1,
              conditionType: "AtLeast",
              searchFor: product.Name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 2,
              conditionType: "AtMost",
              searchFor: product.Name,
            },
          },
          amount: 25,
          discountOn: "product",
          searchFor: product.Name,
          type: "Simple",
        },
      });
      const priceWithDiscount1 = await store.getBasketPrice("", basket);
      expect(priceWithDiscount1).toBe(
        product.Price * product1BasketQuantity * (85 / 100) +
          product2.Price * product2BasketQuantity
      );
      await store.removeDiscount(discountId1);
      expect(await store.getBasketPrice("", basket)).toBe(price);
    }
  );
});
describe("Constraint tests", () => {
  itUnitIntegration(
    "add simple constraint to store and check if it works",
    async (testType) => {
      const {
        price,
        product,
        product2,
        store,
        basket,
        product1BasketQuantity,
        product2BasketQuantity,
      } = await generateForDiscountAndConstraintTests(testType);
      const constraintId = await store.addConstraint(
        createLiteralConditionArgs("", 1, "Store", "AtMost")
      );
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(false);
      await store.removeConstraint(constraintId);
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(true);
    }
  );
  itUnitIntegration(
    "add composite AND constraint to store and check if it works",
    async (testType) => {
      const {
        price,
        product,
        product2,
        store,
        basket,
        product1BasketQuantity,
        product2BasketQuantity,
      } = await generateForDiscountAndConstraintTests(testType);
      const constraintId = await store.addConstraint(
        createCompositeConditionArgs(
          "And",
          createLiteralConditionArgs("", 1, "Store", "AtLeast"),
          createLiteralConditionArgs("", 1, "Store", "AtMost")
        )
      );
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(false);
      await store.removeConstraint(constraintId);
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(true);
    }
  );
  itUnitIntegration(
    "add composite implies constraint to store and check if it works",
    async (testType) => {
      const {
        price,
        product,
        product2,
        store,
        basket,
        product1BasketQuantity,
        product2BasketQuantity,
      } = await generateForDiscountAndConstraintTests(testType);
      const constraintId = await store.addConstraint(
        createCompositeConditionArgs(
          "Implies",
          createLiteralConditionArgs("", 1, "Store", "AtMost"),
          createLiteralConditionArgs("", 1, "Store", "AtLeast")
        )
      );
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(true);
      const constraintId2 =await store.addConstraint(
        createCompositeConditionArgs(
          "Implies",
          createLiteralConditionArgs("", 1, "Store", "AtLeast"),
          createLiteralConditionArgs("", 1, "Store", "AtMost")
        )
      );
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(false);
      await store.removeConstraint(constraintId2);
      await store.removeConstraint(constraintId);
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(true);
    }
  );
  itUnitIntegration(
    "add composite xor constraint to store and check if it works",
   async (testType) => {
      const {
        price,
        product,
        product2,
        store,
        basket,
        product1BasketQuantity,
        product2BasketQuantity,
      } = await generateForDiscountAndConstraintTests(testType);
      const constraintId = await store.addConstraint(
        createCompositeConditionArgs(
          "Xor",
          createLiteralConditionArgs("", 1, "Store", "AtMost"),
          createLiteralConditionArgs("", 1, "Store", "AtLeast")
        )
      );
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(true);
      const constraintId2 = await store.addConstraint(
        createCompositeConditionArgs(
          "Xor",
          createLiteralConditionArgs("", 1, "Store", "AtLeast"),
          createLiteralConditionArgs("", 5, "Store", "AtLeast")
        )
      );
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(false);
      await store.removeConstraint(constraintId2);
      await store.removeConstraint(constraintId);
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(true);
    }
  );
  itUnitIntegration(
    "add composite or constraint to store and check if it works",
    async (testType) => {
      const {
        price,
        product,
        product2,
        store,
        basket,
        product1BasketQuantity,
        product2BasketQuantity,
      } = await generateForDiscountAndConstraintTests(testType);
      const constraintId = await store.addConstraint(
        createCompositeConditionArgs(
          "Or",
          createLiteralConditionArgs("", 1, "Store", "AtMost"),
          createLiteralConditionArgs("", 1, "Store", "AtLeast")
        )
      );
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(true);
      const constraintId2 = await store.addConstraint(
        createCompositeConditionArgs(
          "Or",
          createLiteralConditionArgs("", 1, "Store", "AtMost"),
          createLiteralConditionArgs("NO_SUCH_PRODUCT", 5, "Product", "AtLeast")
        )
      );
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(false);
      await store.removeConstraint(constraintId2);
      await store.removeConstraint(constraintId);
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(true);
    }
  );
  itUnitIntegration(
    "add time constraint to store and check if it works",
   async (testType) => {
      const {
        price,
        product,
        product2,
        store,
        basket,
        product1BasketQuantity,
        product2BasketQuantity,
      } = await generateForDiscountAndConstraintTests(testType);
      const date = new Date();
      const constraintId =await store.addConstraint(
        createTimeConditionArgs(
          "After",
          date.getFullYear() + 1,
          undefined,
          undefined,
          undefined
        )
      );
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(false);
      await store.removeConstraint(constraintId);
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(true);
    }
  );
});
