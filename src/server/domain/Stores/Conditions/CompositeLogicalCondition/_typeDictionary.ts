import { ANDCondition } from "./ANDCondition";
import { ImpliesCondition } from "./ImpliesCondition";
import { XORCondition } from "./XORCondition";
import { ORCondition } from "./ORCondition";
import { type ConditionArgs, type ICondition } from "./Condition";
import {
  DateCategoryCondition,
  DateCondition,
  DateProductCondition,
} from "../baseConditions/DateCondition";
import { ProductCondition } from "../baseConditions/ProductCondition";
import { CategoryCondition } from "../baseConditions/CategoryCondition";
import { StoreCondition } from "../baseConditions/StoreCondition";
import { PriceCondition } from "../baseConditions/PriceCondition";

export const typeToConditionClass = {
  Composite: {
    And: ANDCondition,
    Or: ORCondition,
    Xor: XORCondition,
    Implies: ImpliesCondition,
  },
  Time: {
    TimeOnStore: DateCondition,
    TimeOnProduct: DateProductCondition,
    TimeOnCategory: DateCategoryCondition,
  },
  Literal: {
    Product: ProductCondition,
    Category: CategoryCondition,
    Store: StoreCondition,
    Price: PriceCondition,
  },
} as const;

export function buildCondition(args: ConditionArgs): ICondition {
  if (args.type === "Composite") {
    return new typeToConditionClass[args.type][args.subType](args);
  }
  if (args.type === "Time") {
    return new typeToConditionClass[args.type][args.subType](args);
  }
  if (args.type === "Literal") {
    return new typeToConditionClass[args.type][args.subType](args);
  }
  throw new Error("Invalid Condition Type");
}
