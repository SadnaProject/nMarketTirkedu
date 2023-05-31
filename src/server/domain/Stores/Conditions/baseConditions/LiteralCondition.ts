import { type FullBasketDTO } from "../../StoresController";
import {
  type ConditionArgs,
  type conditionType,
} from "../CompositeLogicalCondition/Condition";

export interface ILiteralCondition {
  isSatisfiedBy(basket: FullBasketDTO): boolean;
  getArgs(): ConditionArgs;
}
export function standInTheTypeCondition(
  conditionType: conditionType,
  count: number,
  neededAmount: number
): boolean {
  switch (conditionType) {
    case "AtLeast":
      return count >= neededAmount;
    case "AtMost":
      return count <= neededAmount;
    case "Exactly":
      return count === neededAmount;
  }
}
