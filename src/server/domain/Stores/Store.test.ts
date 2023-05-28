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
import { StoresRepo } from "./Repos/StoresRepo";
import { DiscountPolicy } from "./DiscountPolicy/DiscountPolicy";
import { ConstraintPolicy } from "./PurchasePolicy/ConstraintPolicy";

async function generateForDiscountAndConstraintTests(testType: string) {
  const controllers = createTestControllers(testType, "Stores");
  vi.spyOn(controllers.PurchasesHistory, "getReviewsByProduct").mockReturnValue(
    createPromise({ avgRating: 0, reviews: [] })
  );
  const productData = generateProductArgs();
  productData.name = "Milk";
  productData.category = "Food";
  const repos = createTestRepos(testType);
  vi.spyOn(controllers.PurchasesHistory, "getReviewsByProduct").mockReturnValue(
    createPromise({ avgRating: 0, reviews: [] })
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
  vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(
    createPromise({
      id: store.Id,
      name: store.Name,
      isActive: store.IsActive(),
    })
  );
  vi.spyOn(repos.Products, "getStoreIdByProductId").mockReturnValue(
    createPromise(store.Id)
  );
  vi.spyOn(repos.Products, "addProduct").mockReturnValue(createPromise("aaa"));
  const product2Id = await store.createProduct(product2Data);

  const product2 = StoreProduct.fromDTO(
    { ...product2Data, id: product2Id, rating: 0 },
    controllers,
    repos
  );
  const basket: BasketDTO = {
    storeId: store.Id,
    products: [
      {
        quantity: product1BasketQuantity,
        storeProductId: product.Id,
        storeId: store.Id,
        userId: "1",
      },
      {
        quantity: product2BasketQuantity,
        storeProductId: product2Id,
        storeId: store.Id,
        userId: "1",
      },
    ],
    userId: "1",
  };
  const productDAO = {
    category: productData.category,
    description: productData.description,
    name: productData.name,
    price: productData.price,
    quantity: productData.quantity,
    id: product.Id,
    storeId: (await product.getStore()).Id,
  };
  const productDAO2 = {
    category: product2Data.category,
    description: product2Data.description,
    name: product2Data.name,
    price: product2Data.price,
    quantity: product2Data.quantity,
    id: product2.Id,
    storeId: (await product2.getStore()).Id,
  };

  vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce(
    createPromise([productDAO, productDAO2])
  );
  vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(
    createPromise({ id: store.Id, name: store.Name, isActive: true })
  );
  vi.spyOn(repos.Products, "getProductById").mockImplementation((id) => {
    if (id === product.Id) return createPromise(productDAO);
    else return createPromise(productDAO2);
  });
  vi.spyOn(repos.Products, "getSpecialPrices").mockReturnValue(
    createPromise(new Map<string, number>())
  );
  vi.spyOn(StoresRepo.prototype, "addDiscount").mockReturnValue(
    createPromise("1")
  );
  vi.spyOn(StoresRepo.prototype, "removeDiscount").mockReturnValue(
    new Promise((resolve) => {
      resolve();
    })
  );
  vi.spyOn(StoresRepo.prototype, "addConstraint").mockReturnValue(
    createPromise("1")
  );
  vi.spyOn(StoresRepo.prototype, "removeConstraint").mockReturnValue(
    new Promise((resolve) => {
      resolve();
    })
  );
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
  itUnitIntegration("✅creates a store", async (testType) => {
    const storeName = generateStoreName();
    const controllers = createTestControllers(testType, "Stores");
    const repos = createTestRepos(testType);
    const store = await createStore(storeName, repos, controllers);
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
    const store = await createStore(storeName, repos, controllers);
    vi.spyOn(repos.Products, "addProduct").mockReturnValue(
      createPromise("aaa")
    );
    vi.spyOn(repos.Stores, "getDiscounts").mockReturnValue(
      createPromise(new DiscountPolicy(store.Id))
    );
    vi.spyOn(repos.Stores, "getConstraints").mockReturnValue(
      createPromise(new ConstraintPolicy(store.Id))
    );
    vi.spyOn(repos.Products, "getSpecialPrices").mockReturnValue(
      createPromise(new Map<string, number>())
    );
    const productData = generateProductArgs();
    const productId = await store.createProduct(productData);
    const product = StoreProduct.fromDTO(
      { ...productData, id: productId, rating: 0 },
      controllers,
      repos
    );
    vi.spyOn(repos.Products, "getStoreIdByProductId").mockReturnValue(
      createPromise(store.Id)
    );
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(
      createPromise({ id: store.Id, name: store.Name, isActive: true })
    );

    const productDAO = {
      category: productData.category,
      description: productData.description,
      name: productData.name,
      price: productData.price,
      quantity: productData.quantity,
      id: productId,
      storeId: (await product.getStore()).Id,
    };
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValue(
      createPromise([productDAO])
    );
    vi.spyOn(
      controllers.PurchasesHistory,
      "getReviewsByProduct"
    ).mockReturnValue(createPromise({ avgRating: 0, reviews: [] }));
    const products = await store.getProducts();
    expect(products.length).toBe(1);
    expect(products[0]).toEqual({
      ...productData,
      rating: 0,
      id: productId,
    });
  });

  it("❎fails in productRepo", async () => {
    const storeName = generateStoreName();
    const repos = createMockRepos();
    const controllers = createMockControllers("Stores");
    const store = await createStore(storeName, repos, controllers);
    vi.spyOn(repos.Stores, "deleteStore").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    await repos.Stores.deleteStore(store.Id);
    vi.spyOn(repos.Products, "addProduct").mockImplementationOnce(() => {
      throw new Error();
    });
    const productData = generateProductArgs();
    await expect(
      async () => await store.createProduct(productData)
    ).rejects.toThrow();
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
        {
          quantity: productData.quantity,
          storeProductId: product.Id,
          storeId: store.Id,
          userId: "1",
        },
      ],
      userId: "1",
    };
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(
      createPromise({
        id: store.Id,
        name: store.Name,
        isActive: store.IsActive(),
      })
    );
    const productDAO = {
      category: productData.category,
      description: productData.description,
      name: productData.name,
      price: productData.price,
      quantity: productData.quantity,
      id: product.Id,
      storeId: (await product.getStore()).Id,
    };
    vi.spyOn(repos.Products, "getProductById").mockReturnValue(
      createPromise(productDAO)
    );
    expect(await store.getBasketPrice("", basket)).toBe(
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
    vi.spyOn(StoresRepo.prototype, "getStoreById").mockReturnValue(
      createPromise({
        id: store.Id,
        name: store.Name,
        isActive: store.IsActive(),
      })
    );
    vi.spyOn(StoresRepo.prototype, "addDiscount").mockReturnValue(
      createPromise("1")
    );
    vi.spyOn(StoresRepo.prototype, "removeDiscount").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
    vi.spyOn(StoresRepo.prototype, "getDiscounts").mockReturnValue(
      createPromise(store.DiscountPolicy)
    );
    const firstPrice = await store.getBasketPrice("", basket);
    let suppose =
      product.Price * product1BasketQuantity +
      product2.Price * product2BasketQuantity;
    expect(firstPrice).toBe(suppose);
    const discountId = await store.addDiscount(
      createSimpleDiscountArgs(
        product.Name,
        15,
        "product",
        createLiteralConditionArgs(product.Name, 1, "Product", "AtLeast")
      )
    );

    const priceWithDiscount = await store.getBasketPrice("", basket);
    suppose =
      product.Price * product1BasketQuantity * (85 / 100) +
      product2.Price * product2BasketQuantity;
    expect(priceWithDiscount).toBe(suppose);
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
    vi.spyOn(StoresRepo.prototype, "getStoreById").mockReturnValue(
      createPromise({
        id: store.Id,
        name: store.Name,
        isActive: store.IsActive(),
      })
    );
    vi.spyOn(StoresRepo.prototype, "addDiscount").mockReturnValue(
      createPromise("1")
    );
    vi.spyOn(StoresRepo.prototype, "removeDiscount").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
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
    vi.spyOn(StoresRepo.prototype, "getStoreById").mockReturnValue(
      createPromise({
        id: store.Id,
        name: store.Name,
        isActive: store.IsActive(),
      })
    );
    vi.spyOn(StoresRepo.prototype, "addDiscount").mockReturnValue(
      createPromise("1")
    );
    vi.spyOn(StoresRepo.prototype, "removeDiscount").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
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
    vi.spyOn(StoresRepo.prototype, "getStoreById").mockReturnValue(
      createPromise({
        id: store.Id,
        name: store.Name,
        isActive: store.IsActive(),
      })
    );
    vi.spyOn(StoresRepo.prototype, "addDiscount").mockReturnValue(
      createPromise("1")
    );
    vi.spyOn(StoresRepo.prototype, "removeDiscount").mockReturnValue(
      new Promise((resolve) => {
        resolve();
      })
    );
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
      vi.spyOn(StoresRepo.prototype, "getStoreById").mockReturnValue(
        createPromise({
          id: store.Id,
          name: store.Name,
          isActive: store.IsActive(),
        })
      );
      vi.spyOn(StoresRepo.prototype, "addDiscount").mockReturnValue(
        createPromise("1")
      );
      vi.spyOn(StoresRepo.prototype, "removeDiscount").mockReturnValue(
        new Promise((resolve) => {
          resolve();
        })
      );
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
      vi.spyOn(StoresRepo.prototype, "addDiscount").mockReturnValue(
        createPromise("1")
      );
      vi.spyOn(StoresRepo.prototype, "removeDiscount").mockReturnValue(
        new Promise((resolve) => {
          resolve();
        })
      );
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
      const discountId1 = await store.addDiscount({
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
      const constraintId2 = await store.addConstraint(
        createCompositeConditionArgs(
          "Implies",
          createLiteralConditionArgs("", 1, "Store", "AtLeast"),
          createLiteralConditionArgs("", 1, "Store", "AtMost")
        )
      );
      expect(await store.checkIfBasketFulfillsPolicy(basket)).toBe(false);
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
      const constraintId = await store.addConstraint(
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
