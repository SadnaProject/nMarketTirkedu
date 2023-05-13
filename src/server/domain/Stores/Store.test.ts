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
  createSimpleDiscountArgs,
  createStore,
  createStoreWithProduct,
  generateProductArgs,
  generateStoreName,
} from "./_data";
import { itUnitIntegration } from "../_mock";
function generateForDiscountTest(testType: string) {
  const productData = generateProductArgs();
  productData.name = "Milk";
  productData.category = "Food";
  const repos = createTestRepos(testType);
  const { store, product } = createStoreWithProduct(productData, repos);
  productData.quantity = 5;
  const product2Data = generateProductArgs();
  product2Data.name = "Meat";
  product2Data.category = "Meat";
  const product1BasketQuantity = 55;
  const product2BasketQuantity = 23;
  vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
  const product2Id = store.createProduct(productData);
  const product2 = StoreProduct.fromDTO(
    { ...productData, id: product2Id },
    repos
  );
  const basket: BasketDTO = {
    storeId: store.Id,
    products: [
      { quantity: product1BasketQuantity, storeProductId: product.Id },
      { quantity: product2BasketQuantity, storeProductId: product2Id },
    ],
  };
  vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
    product,
    product2,
  ]);
  vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
  vi.spyOn(repos.Products, "getProductById").mockImplementation((id) => {
    if (id === product.Id) return product;
    else return product2;
  });
  const price = store.getBasketPrice(basket);
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
  itUnitIntegration("✅creates a store", () => {
    const storeName = generateStoreName();
    const store = createStore(storeName);
    expect(store.Name).toBe(storeName);
    expect(store.IsActive).toBe(true);
  });

  itUnitIntegration("❎gets empty name", () => {
    expect(() => new Store("")).toThrow(ZodError);
  });
});

describe("createProduct", () => {
  itUnitIntegration("✅creates a product", (testType) => {
    const repos = createTestRepos(testType);
    const storeName = generateStoreName();
    const store = createStore(storeName, repos);
    vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
    const productData = generateProductArgs();
    const productId = store.createProduct(productData);
    const product = StoreProduct.fromDTO(
      { ...productData, id: productId },
      repos
    );
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValue([product]);
    expect(store.Products.length).toBe(1);
    expect(store.Products[0]).toEqual({ ...productData, id: productId });
  });

  it("❎fails in productRepo", () => {
    const storeName = generateStoreName();
    const repos = createMockRepos();
    const store = createStore(storeName, repos);
    vi.spyOn(repos.Products, "addProduct").mockImplementationOnce(() => {
      throw new Error("addProduct failed");
    });
    const productData = generateProductArgs();
    expect(() => store.createProduct(productData)).toThrow("addProduct failed");
  });
});
describe("get basket price", () => {
  itUnitIntegration("✅gets basket price", (testType) => {
    const productData = generateProductArgs();
    const repos = createTestRepos(testType);
    const { store, product } = createStoreWithProduct(productData, repos);
    const basket: BasketDTO = {
      storeId: store.Id,
      products: [
        { quantity: productData.quantity, storeProductId: product.Id },
      ],
    };
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
      product,
    ]);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValueOnce(store);
    vi.spyOn(repos.Products, "getProductById").mockReturnValueOnce(product);
    expect(store.getBasketPrice(basket)).toBe(
      product.Price * productData.quantity
    );
  });
});
describe("Discounts", () => {
  itUnitIntegration("add simple product discount", (testType) => {
    const productData = generateProductArgs();
    productData.name = "Milk";
    productData.category = "Food";
    const repos = createTestRepos(testType);
    const { store, product } = createStoreWithProduct(productData, repos);
    const product2Data = generateProductArgs();
    product2Data.name = "Meat";
    product2Data.category = "Meat";
    vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
    const product2Id = store.createProduct(productData);
    const product2 = StoreProduct.fromDTO(
      { ...productData, id: product2Id },
      repos
    );
    const product1Quantity = 55;
    const product2Quantity = 23;
    const basket: BasketDTO = {
      storeId: store.Id,
      products: [
        { quantity: product1Quantity, storeProductId: product.Id },
        { quantity: product2Quantity, storeProductId: product2Id },
      ],
    };
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
      product,
      product2,
    ]);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
    vi.spyOn(repos.Products, "getProductById").mockImplementation((id) => {
      if (id === product.Id) return product;
      else return product2;
    });
    const price = store.getBasketPrice(basket);
    const discountId = store.addDiscount(
      createSimpleDiscountArgs(
        productData.name,
        15,
        "product",
        createLiteralConditionArgs(productData.name, 1, "Product", "AtLeast")
      )
    );
    const priceWithDiscount = store.getBasketPrice(basket);
    expect(priceWithDiscount).toBe(
      product.Price * productData.quantity * (85 / 100) +
        product2.Price * product2Data.quantity
    );
    store.removeDiscount(discountId);
    expect(store.getBasketPrice(basket)).toBe(price);
  });
  itUnitIntegration("add simple category discount", (testType) => {
    const {
      price,
      product,
      product2,
      store,
      basket,
      product1BasketQuantity,
      product2BasketQuantity,
    } = generateForDiscountTest(testType);

    const discountId = store.addDiscount(
      createSimpleDiscountArgs(
        product.Category,
        15,
        "category",
        createLiteralConditionArgs(product.Category, 1, "Category", "AtLeast")
      )
    );
    const priceWithDiscount = store.getBasketPrice(basket);
    expect(priceWithDiscount).toBe(
      product.Price * product1BasketQuantity * (85 / 100) +
        product2.Price * product2BasketQuantity
    );
    store.removeDiscount(discountId);
    expect(store.getBasketPrice(basket)).toBe(price);
  });
  itUnitIntegration("add simple price discount", (testType) => {
    const productData = generateProductArgs();
    productData.name = "Milk";
    productData.category = "Food";
    const repos = createTestRepos(testType);
    const { store, product } = createStoreWithProduct(productData, repos);
    productData.quantity = 5;
    const product2Data = generateProductArgs();
    product2Data.name = "Meat";
    product2Data.category = "Meat";
    vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
    const product2Id = store.createProduct(productData);
    const product2 = StoreProduct.fromDTO(
      { ...productData, id: product2Id },
      repos
    );
    const basket: BasketDTO = {
      storeId: store.Id,
      products: [
        { quantity: productData.quantity, storeProductId: product.Id },
        { quantity: product2Data.quantity, storeProductId: product2Id },
      ],
    };
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
      product,
      product2,
    ]);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
    vi.spyOn(repos.Products, "getProductById").mockImplementation((id) => {
      if (id === product.Id) return product;
      else return product2;
    });
    const price = store.getBasketPrice(basket);
    const discountId = store.addDiscount(
      createSimpleDiscountArgs(
        productData.category,
        15,
        "category",
        createLiteralConditionArgs(
          productData.category,
          price - 5,
          "Price",
          "AtLeast"
        )
      )
    );
    const priceWithDiscount = store.getBasketPrice(basket);
    expect(priceWithDiscount).toBe(
      product.Price * productData.quantity * (85 / 100) +
        product2.Price * product2Data.quantity
    );
    store.removeDiscount(discountId);
    expect(store.getBasketPrice(basket)).toBe(price);
    const discountId1 = store.addDiscount(
      createSimpleDiscountArgs(
        productData.category,
        15,
        "category",
        createLiteralConditionArgs(
          productData.category,
          price - 5,
          "Price",
          "AtMost"
        )
      )
    );
    const priceWithDiscount1 = store.getBasketPrice(basket);
    expect(priceWithDiscount1).toBe(price);
    store.removeDiscount(discountId1);
    expect(store.getBasketPrice(basket)).toBe(price);
  });
  itUnitIntegration("add simple basket discount", (testType) => {
    const productData = generateProductArgs();
    productData.name = "Milk";
    productData.category = "Food";
    const repos = createTestRepos(testType);
    const { store, product } = createStoreWithProduct(productData, repos);
    productData.quantity = 5;
    const product2Data = generateProductArgs();
    product2Data.name = "Meat";
    product2Data.category = "Meat";
    vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
    const product2Id = store.createProduct(productData);
    const product2 = StoreProduct.fromDTO(
      { ...productData, id: product2Id },
      repos
    );
    const basket: BasketDTO = {
      storeId: store.Id,
      products: [
        { quantity: productData.quantity, storeProductId: product.Id },
        { quantity: product2Data.quantity, storeProductId: product2Id },
      ],
    };
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
      product,
      product2,
    ]);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
    vi.spyOn(repos.Products, "getProductById").mockImplementation((id) => {
      if (id === product.Id) return product;
      else return product2;
    });
    const price = store.getBasketPrice(basket);
    const discountId = store.addDiscount(
      createSimpleDiscountArgs(
        productData.category,
        15,
        "store",
        createLiteralConditionArgs(productData.category, 1, "Store", "AtLeast")
      )
    );
    const priceWithDiscount = store.getBasketPrice(basket);
    expect(priceWithDiscount).toBe(
      product.Price * productData.quantity * (85 / 100) +
        product2.Price * product2Data.quantity * (85 / 100)
    );
    store.removeDiscount(discountId);
    expect(store.getBasketPrice(basket)).toBe(price);
  });
  itUnitIntegration("add max discount with simple condition", (testType) => {
    const productData = generateProductArgs();
    productData.name = "Milk";
    productData.category = "Food";
    const repos = createTestRepos(testType);
    const { store, product } = createStoreWithProduct(productData, repos);
    productData.quantity = 5;
    const product2Data = generateProductArgs();
    product2Data.name = "Meat";
    product2Data.category = "Meat";
    vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
    const product2Id = store.createProduct(productData);
    const product2 = StoreProduct.fromDTO(
      { ...productData, id: product2Id },
      repos
    );
    const basket: BasketDTO = {
      storeId: store.Id,
      products: [
        { quantity: productData.quantity, storeProductId: product.Id },
        { quantity: product2Data.quantity, storeProductId: product2Id },
      ],
    };
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
      product,
      product2,
    ]);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
    vi.spyOn(repos.Products, "getProductById").mockImplementation((id) => {
      if (id === product.Id) return product;
      else return product2;
    });
    const price = store.getBasketPrice(basket);
    const discountId = store.addDiscount(
      createCompositeDiscountArgs(
        createSimpleDiscountArgs(
          productData.category,
          15,
          "category",
          createLiteralConditionArgs(
            productData.category,
            1,
            "Store",
            "AtLeast"
          )
        ),
        createSimpleDiscountArgs(
          productData.category,
          15,
          "store",
          createLiteralConditionArgs(
            productData.category,
            1,
            "Store",
            "AtLeast"
          )
        ),
        "Max"
      )
    );
    const priceWithDiscount = store.getBasketPrice(basket);
    expect(priceWithDiscount).toBe(
      product.Price * productData.quantity * (85 / 100) +
        product2.Price * product2Data.quantity * (85 / 100)
    );
    store.removeDiscount(discountId);
    expect(store.getBasketPrice(basket)).toBe(price);
  });
  itUnitIntegration(
    "add compose ADD discount with simple condition",
    (testType) => {
      const productData = generateProductArgs();
      productData.category = "Food";
      const repos = createTestRepos(testType);
      const { store, product } = createStoreWithProduct(productData, repos);
      productData.quantity = 5;
      const product2Data = generateProductArgs();
      product2Data.category = "Meat";
      vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
      const product2Id = store.createProduct(productData);
      const product2 = StoreProduct.fromDTO(
        { ...productData, id: product2Id },
        repos
      );
      const basket: BasketDTO = {
        storeId: store.Id,
        products: [
          { quantity: productData.quantity, storeProductId: product.Id },
          { quantity: product2Data.quantity, storeProductId: product2Id },
        ],
      };
      vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
        product,
        product2,
      ]);
      vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
      vi.spyOn(repos.Products, "getProductById").mockImplementation((id) => {
        if (id === product.Id) return product;
        else return product2;
      });
      const price = store.getBasketPrice(basket);
      const discountId = store.addDiscount(
        createCompositeDiscountArgs(
          createSimpleDiscountArgs(
            productData.category,
            15,
            "category",
            createLiteralConditionArgs(
              productData.category,
              1,
              "Store",
              "AtLeast"
            )
          ),
          createSimpleDiscountArgs(
            productData.category,
            15,
            "store",
            createLiteralConditionArgs(
              productData.category,
              1,
              "Store",
              "AtLeast"
            )
          ),
          "Add"
        )
      );
      const priceWithDiscount = store.getBasketPrice(basket);
      expect(priceWithDiscount).toBe(
        product.Price * productData.quantity * (70 / 100) +
          product2.Price * product2Data.quantity * (70 / 100)
      );
      store.removeDiscount(discountId);
      expect(store.getBasketPrice(basket)).toBe(price);
    }
  );
  itUnitIntegration("add compose discount with And condition", (testType) => {
    const productData = generateProductArgs();
    productData.name = "Milk";
    productData.category = "Food";
    const repos = createTestRepos(testType);
    const { store, product } = createStoreWithProduct(productData, repos);
    productData.quantity = 5;
    const product2Data = generateProductArgs();
    product2Data.name = "Meat";
    product2Data.category = "Meat";
    vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
    const product2Id = store.createProduct(productData);
    const product2 = StoreProduct.fromDTO(
      { ...productData, id: product2Id },
      repos
    );
    const basket: BasketDTO = {
      storeId: store.Id,
      products: [
        { quantity: productData.quantity, storeProductId: product.Id },
        { quantity: product2Data.quantity, storeProductId: product2Id },
      ],
    };
    vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
      product,
      product2,
    ]);
    vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
    vi.spyOn(repos.Products, "getProductById").mockImplementation((id) => {
      if (id === product.Id) return product;
      else return product2;
    });
    const price = store.getBasketPrice(basket);
    const discountId = store.addDiscount(
      createCompositeDiscountArgs(
        createSimpleDiscountArgs(
          productData.category,
          15,
          "category",
          createCompositeConditionArgs(
            "And",
            createLiteralConditionArgs(
              productData.category,
              1,
              "Store",
              "AtLeast"
            ),
            createLiteralConditionArgs(
              productData.category,
              1,
              "Store",
              "AtMost"
            )
          )
        ),
        createSimpleDiscountArgs(
          productData.category,
          15,
          "store",
          createLiteralConditionArgs(
            productData.category,
            1,
            "Store",
            "AtLeast"
          )
        ),
        "Add"
      )
    );
    const priceWithDiscount = store.getBasketPrice(basket);
    expect(priceWithDiscount).toBe(
      product.Price * productData.quantity * (85 / 100) +
        product2.Price * product2Data.quantity * (85 / 100)
    );
    store.removeDiscount(discountId);
    expect(store.getBasketPrice(basket)).toBe(price);
  });
  itUnitIntegration(
    "add compose MAX discount with compose logic implies condition",
    (testType) => {
      const productData = generateProductArgs();
      productData.category = "Food";
      const repos = createTestRepos(testType);
      const { store, product } = createStoreWithProduct(productData, repos);
      productData.quantity = 5;
      const product2Data = generateProductArgs();
      product2Data.category = "Meat";
      vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
      const product2Id = store.createProduct(productData);
      const product2 = StoreProduct.fromDTO(
        { ...productData, id: product2Id },
        repos
      );
      const basket: BasketDTO = {
        storeId: store.Id,
        products: [
          { quantity: productData.quantity, storeProductId: product.Id },
          { quantity: product2Data.quantity, storeProductId: product2Id },
        ],
      };
      vi.spyOn(repos.Products, "getProductsByStoreId").mockReturnValueOnce([
        product,
        product2,
      ]);
      vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(store);
      vi.spyOn(repos.Products, "getProductById").mockImplementation((id) => {
        if (id === product.Id) return product;
        else return product2;
      });
      const price = store.getBasketPrice(basket);
      const discountId = store.addDiscount({
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
              searchFor: productData.name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 20,
              conditionType: "AtMost",
              searchFor: productData.name,
            },
          },
          discount: 15,
          discountOn: "product",
          searchFor: productData.name,
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
              searchFor: productData.name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 20,
              conditionType: "AtMost",
              searchFor: productData.name,
            },
          },
          discount: 25,
          discountOn: "product",
          searchFor: productData.name,
          type: "Simple",
        },
      });
      const priceWithDiscount = store.getBasketPrice(basket);
      expect(priceWithDiscount).toBe(
        product.Price * productData.quantity * (60 / 100) +
          product2.Price * product2Data.quantity
      );
      store.removeDiscount(discountId);
      expect(store.getBasketPrice(basket)).toBe(price);
      const discountId1 = store.addDiscount({
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
              searchFor: productData.name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 20,
              conditionType: "AtMost",
              searchFor: productData.name,
            },
          },
          discount: 15,
          discountOn: "product",
          searchFor: productData.name,
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
              searchFor: productData.name,
            },
            right: {
              type: "Literal",
              subType: "Product",
              amount: 2,
              conditionType: "AtMost",
              searchFor: productData.name,
            },
          },
          discount: 25,
          discountOn: "product",
          searchFor: productData.name,
          type: "Simple",
        },
      });
      const priceWithDiscount1 = store.getBasketPrice(basket);
      expect(priceWithDiscount1).toBe(
        product.Price * productData.quantity * (85 / 100) +
          product2.Price * product2Data.quantity
      );
      store.removeDiscount(discountId1);
      expect(store.getBasketPrice(basket)).toBe(price);
    }
  );
});
