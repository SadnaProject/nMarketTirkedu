import { generateMock } from "@anatine/zod-mock";
import { faker } from "@faker-js/faker/locale/en";
import {
  StoreProduct,
  type StoreProductArgs,
  StoreProductDTOSchema,
  storeProductArgsSchema,
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
  Discount,
  type DiscountArgs,
  type DiscountCompositeType,
  type DiscountOn,
  type SimpleDiscountArgs,
} from "./DiscountPolicy/Discount";

const subTypeLiteralSchema = z.enum(["Product", "Category", "Store", "Price"]);
export type subTypeLiteral = z.infer<typeof subTypeLiteralSchema>;
export function generateStoreName() {
  return faker.company.name();
}

export function generateProductArgs() {
  return generateMock(storeProductArgsSchema, {
    stringMap: {
      name: () => faker.commerce.productName(),
      category: () => faker.commerce.department(),
      description: () => faker.commerce.productDescription(),
    },
  });
}

export function generateProductDTO() {
  return generateMock(StoreProductDTOSchema, {
    stringMap: {
      name: () => faker.commerce.productName(),
      category: () => faker.commerce.department(),
      description: () => faker.commerce.productDescription(),
    },
  });
}

export function createStore(
  storeName: string,
  repos: Repos,
  controllers: Controllers
) {
  return new Store(storeName).initRepos(repos).initControllers(controllers);
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

export function createStoreWithProduct(
  productData: StoreProductArgs,
  repos: Repos,
  controllers: Controllers
) {
  vi.spyOn(controllers.PurchasesHistory, "getReviewsByProduct").mockReturnValue(
    createPromise({ avgRating: 0, reviews: [] })
  );
  const store = createStore(generateStoreName(), repos, controllers);
  vi.spyOn(repos.Products, "addProduct").mockReturnValue(createPromise("AAA"));
  const productId = await store.createProduct(productData);
/**
  vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
  const productId = store.createProduct(productData);
*/
  const product = StoreProduct.fromDTO(
    { ...productData, id: productId, rating: 0 },
    controllers,
    repos
  );
  vi.spyOn(product, "Store", "get").mockReturnValue(store);
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
