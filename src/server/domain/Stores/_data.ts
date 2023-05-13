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
  CompositeArgs,
  ConditionArgs,
  LiteralArgs,
  SubTypeComposite,
  SubTypeLiteral,
  TimeArgs,
  TimeConditionType,
  conditionType,
} from "./Conditions/CompositeLogicalCondition/Condition";
import { z } from "zod";
import {
  CompositeDiscountArgs,
  Discount,
  DiscountArgs,
  DiscountCompositeType,
  DiscountOn,
  SimpleDiscountArgs,
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
  repos: Repos = createMockRepos(),
  controllers: Controllers = createMockControllers("Stores")
) {
  return new Store(storeName).initRepos(repos).initControllers(controllers);
}

export function createProduct(
  args: StoreProductArgs,
  repos: Repos = createMockRepos()
) {
  return new StoreProduct(args).initRepos(repos);
}

export function createStoreWithProduct(
  productData: StoreProductArgs,
  repos: Repos = createMockRepos()
) {
  const store = createStore(generateStoreName(), repos);
  vi.spyOn(repos.Products, "addProduct").mockReturnValueOnce();
  const productId = store.createProduct(productData);
  const product = StoreProduct.fromDTO(
    { ...productData, id: productId },
    repos
  );
  vi.spyOn(product, "Store", "get").mockReturnValue(store);
  return { store, product };
}
export function createSimpleDiscountArgs(
  name: string,
  discount: number,
  discountOn: DiscountOn,
  condition: ConditionArgs
): SimpleDiscountArgs {
  return {
    type: "Simple",
    searchFor: name,
    discount: discount,
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
    timeCondition: timeConditionType,
    subType: "Time",
  };
}

export function createCompositeConditionArgs(
  subType: SubTypeComposite,
  right: ConditionArgs,
  left: ConditionArgs
): CompositeArgs {
  return {
    type: "Composite",
    subType: subType,
    right: right,
    left: left,
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
