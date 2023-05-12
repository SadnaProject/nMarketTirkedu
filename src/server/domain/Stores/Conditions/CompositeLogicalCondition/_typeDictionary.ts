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
import { StoreCondition } from "../baseConditions/StoreCondtion";
import { PriceCondition } from "../baseConditions/PriceCondition";
export const subTypeToCompositeClass = {
  And: ANDCondition,
  Or: ORCondition,
  Xor: XORCondition,
  Implies: ImpliesCondition,
};
export const subTypeToTimeClass = {
  TimeOnStore: DateCondition,
  TimeOnProduct: DateProductCondition,
  TimeOnCategory: DateCategoryCondition,
};
export const subTypeToLiteralClass = {
  Product: ProductCondition,
  Category: CategoryCondition,
  Store: StoreCondition,
  Price: PriceCondition,
};
export function buildCondition(args: ConditionArgs): ICondition {
  if (args.type === "Composite") {
    const compositeClass = subTypeToCompositeClass[args.subType];
    return new compositeClass(args);
  }
  if (args.type === "Time") {
    const timeClass = subTypeToTimeClass[args.subType];
    return new timeClass(args);
  }
  if (args.type === "Literal") {
    const literalClass = subTypeToLiteralClass[args.subType];
    return new literalClass(args);
  }
  throw new Error("Invalid Condition Type");
}
