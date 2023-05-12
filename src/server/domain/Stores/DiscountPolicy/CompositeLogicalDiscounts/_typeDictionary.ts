import { ANDCondition } from "./ANDCondition";
import { ImpliesCondition } from "./ImpliesCondition";
import { XORCondition } from "./XORCondition";
import { ORCondition } from "./ORCondition";
import { type ConditionArgs, type ICondition } from "./Condition";
import {
  DateCategoryCondition,
  DateCondition,
  DateProductCondition,
} from "../baseDiscounts/DateCondition";
import { ProductCondition } from "../baseDiscounts/ProductCondition";
import { CategoryCondition } from "../baseDiscounts/CategoryCondition";
import { StoreCondition } from "../baseDiscounts/StoreCondtion";
import { PriceCondition } from "../baseDiscounts/PriceCondition";
export const typeToClass = {
  And: ANDCondition,
  Or: ORCondition,
  Xor: XORCondition,
  Implies: ImpliesCondition,
  Time: DateCondition,
  TimeOnProduct: DateProductCondition,
  TimeOnCategory: DateCategoryCondition,
  Product: ProductCondition,
  Category: CategoryCondition,
  Store: StoreCondition,
  Price: PriceCondition,
};
export function buildCondition(args: ConditionArgs): ICondition {
  const conditionClass = typeToClass[args.type];
  return new conditionClass(args); ///TODO Needs to be fixed
}
