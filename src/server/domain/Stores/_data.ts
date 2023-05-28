import { generateMock } from "@anatine/zod-mock";
import { faker } from "@faker-js/faker/locale/en";
import {
  StoreProduct,
  type StoreProductArgs,
  StoreProductDTOSchema,
  storeProductArgsSchema,
  StoreProductDTO,
} from "./StoreProduct";
import { type Repos, createMockRepos } from "./_HasRepos";
import { createMockControllers } from "../_createControllers";
import { Store } from "./Store";
import { type Controllers } from "../_HasController";
import { vi } from "vitest";
import {
  type CompositeArgs,
  type ConditionArgs,
  type LiteralArgs,
  type SubTypeComposite,
  type SubTypeLiteral,
  type TimeArgs,
  type TimeConditionType,
  type conditionType,
} from "./Conditions/CompositeLogicalCondition/Condition";
import { z } from "zod";
import {
  type CompositeDiscountArgs,
  type DiscountArgs,
  type DiscountCompositeType,
  type DiscountOn,
  type SimpleDiscountArgs,
} from "./DiscountPolicy/Discount";
import { DiscountPolicy } from "./DiscountPolicy/DiscountPolicy";
import { ConstraintPolicy } from "./PurchasePolicy/ConstraintPolicy";

const subTypeLiteralSchema = z.enum(["Product", "Category", "Store", "Price"]);
export type subTypeLiteral = z.infer<typeof subTypeLiteralSchema>;
export function generateStoreName() {
  return faker.company.name();
}

export function generateProductArgs(): StoreProductArgs {
  return {
    name: faker.commerce.productName(),
    category: faker.commerce.department(),
    description: faker.commerce.productDescription(),
    price: faker.datatype.number({ min: 0 }),
    quantity: faker.datatype.number({ min: 0 }),
  };
}

export function generateProductDTO(): StoreProductDTO {
  return {
    id: faker.datatype.uuid(),
    name: faker.commerce.productName(),
    category: faker.commerce.department(),
    description: faker.commerce.productDescription(),
    price: faker.datatype.number({ min: 0 }),
    quantity: faker.datatype.number({ min: 0 }),
    rating: faker.datatype.number({ min: 0, max: 5 }),
  };
}

export async function createStore(
  storeName: string,
  repos: Repos,
  controllers: Controllers
) {
  const store = new Store(storeName)
    .initRepos(repos)
    .initControllers(controllers);
  vi.spyOn(repos.Stores, "addStore").mockReturnValue(
    new Promise((resolve) => {
      resolve();
    })
  );
  await repos.Stores.addStore(storeName, store.Id);
  return store;
}

export function createProduct(
  args: StoreProductArgs,
  repos: Repos,
  controllers: Controllers
) {
  vi.spyOn(controllers.PurchasesHistory, "getReviewsByProduct").mockReturnValue(
    createPromise({ avgRating: 0, reviews: [] })
  );
  return new StoreProduct(args).initControllers(controllers).initRepos(repos);
}

export async function createStoreWithProduct(
  productData: StoreProductArgs,
  repos: Repos,
  controllers: Controllers
) {
  vi.spyOn(controllers.PurchasesHistory, "getReviewsByProduct").mockReturnValue(
    createPromise({ avgRating: 0, reviews: [] })
  );
  const store = await createStore(generateStoreName(), repos, controllers);
  vi.spyOn(repos.Products, "addProduct").mockReturnValue(createPromise("AAA"));
  vi.spyOn(repos.Stores, "getDiscounts").mockReturnValue(
    createPromise(new DiscountPolicy(store.Id))
  );
  vi.spyOn(repos.Stores, "getConstraints").mockReturnValue(
    createPromise(new ConstraintPolicy(store.Id))
  );
  vi.spyOn(repos.Products, "getSpecialPrices").mockReturnValue(
    createPromise(new Map<string, number>())
  );
  vi.spyOn(repos.Products, "getStoreIdByProductId").mockReturnValue(
    createPromise(store.Id)
  );
  vi.spyOn(repos.Stores, "getStoreById").mockReturnValue(
    createPromise({ id: store.Id, name: store.Name, isActive: true })
  );

  const productId = await store.createProduct(productData);
  const product = StoreProduct.fromDTO(
    { ...productData, id: productId, rating: 0 },
    controllers,
    repos
  );
  vi.spyOn(product, "getStore").mockReturnValue(createPromise(store));
  return { store, product };
}
export function createSimpleDiscountArgs(
  name: string,
  amount: number,
  discountOn: DiscountOn,
  condition: ConditionArgs
): SimpleDiscountArgs {
  return {
    type: "Simple",
    searchFor: name,
    amount: amount,
    discountOn: discountOn,
    condition: condition,
  };
}
export function createLiteralConditionArgs(
  name: string,
  amount: number,
  subType: SubTypeLiteral,
  conditionType: conditionType
): LiteralArgs {
  return {
    type: "Literal",
    subType: subType,
    amount: amount,
    searchFor: name,
    conditionType: conditionType,
  };
}
export function createTimeConditionArgs(
  timeConditionType: TimeConditionType,
  year?: number,
  month?: number,
  day?: number,
  hour?: number
): TimeArgs {
  return {
    type: "Time",
    year: year,
    month: month,
    day: day,
    hour: hour,
    conditionType: timeConditionType,
  };
}

export function createCompositeConditionArgs(
  subType: SubTypeComposite,
  left: ConditionArgs,
  right: ConditionArgs
): CompositeArgs {
  return {
    type: "Composite",
    subType: subType,
    left: left,
    right: right,
  };
}
export function createCompositeDiscountArgs(
  left: DiscountArgs,
  right: DiscountArgs,
  subType: DiscountCompositeType
): CompositeDiscountArgs {
  return {
    type: subType,
    left: left,
    right: right,
  };
}
export function createPromise<T>(value: T) {
  return new Promise<T>((resolve) => {
    resolve(value);
  });
}
export function productToProductData(product: StoreProduct): StoreProductArgs {
  return {
    category: product.Category,
    description: product.Description,
    name: product.Name,
    price: product.Price,
    quantity: product.Quantity,
  };
}
