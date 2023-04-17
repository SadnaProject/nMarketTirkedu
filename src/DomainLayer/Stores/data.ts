import { generateMock } from "@anatine/zod-mock";
import { faker } from "@faker-js/faker/locale/en";
import {
  StoreProduct,
  type StoreProductArgs,
  StoreProductDTOSchema,
  storeProductArgsSchema,
} from "./StoreProduct";
import { type Repos, createTestRepos } from "./HasRepos";
import { createTestControllers } from "../createControllers";
import { Store } from "./Store";
import { type Controllers } from "../HasController";
import { vi } from "vitest";

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
  repos: Repos = createTestRepos(),
  controllers: Controllers = createTestControllers("Stores")
) {
  return new Store(storeName).initRepos(repos).initControllers(controllers);
}

export function createProduct(
  args: StoreProductArgs,
  repos: Repos = createTestRepos()
) {
  return new StoreProduct(args).initRepos(repos);
}

export function createStoreWithProduct(
  productData: StoreProductArgs,
  repos: Repos = createTestRepos()
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
