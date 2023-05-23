///check data base create
import { beforeEach, describe, expect, it } from "vitest";
import { type Repos, createTestRepos } from "./_HasRepos";
import { StoresRepo } from "./Repos/StoresRepo";
import { UserAuthRepo } from "../Auth/UserAuthRepo";
import { Store } from "./Store";
import { DiscountPolicy } from "./DiscountPolicy/DiscountPolicy";
import { ConstraintPolicy } from "./PurchasePolicy/ConstraintPolicy";
import {
  createCompositeConditionArgs,
  createCompositeDiscountArgs,
  createLiteralConditionArgs,
  createSimpleDiscountArgs,
} from "./_data";

let repos: Repos;
beforeEach(() => {
  //delete all data in db
  // controllers = createTestControllers(testType, "Users");
  console.log("before each");
  repos = createTestRepos("integration");
  // controllers.Auth.initRepos(repos);
});
//TODO: delete this.
describe("trying out db", () => {
  it("✅adds store", async () => {
    const storeDAO = await repos.Stores.addStore("name");
    const realStore = Store.fromDAO(
      storeDAO,
      new DiscountPolicy(storeDAO.id),
      new ConstraintPolicy(storeDAO.id)
    ).initRepos(repos);
    const literalCondition = createLiteralConditionArgs(
      "name",
      15,
      "Category",
      "AtLeast"
    );
    const simple = createSimpleDiscountArgs(
      "product",
      15,
      "product",
      literalCondition
    );
    const literalCondition2 = createLiteralConditionArgs(
      "not_name",
      15,
      "Category",
      "AtLeast"
    );
    const literalCondition3 = createLiteralConditionArgs(
      "not not name",
      15,
      "Category",
      "AtLeast"
    );
    const compositeCondition = createCompositeConditionArgs(
      "And",
      literalCondition3,
      literalCondition2
    );
    const simple1 = createSimpleDiscountArgs(
      "product11",
      15,
      "product",
      compositeCondition
    );
    await realStore.addDiscount(simple);
    await realStore.addDiscount(simple1);
    const compose = createCompositeDiscountArgs(simple, simple1, "Add");
    await realStore.addDiscount(compose);
    expect(true).toBe(true);
    // await repos.Stores.deleteStore(storeDAO.id);
  });
});
