import { z } from "zod";
import { FullBasketDTO } from "./StoresController";
import { discountLiteralConditionSchema } from "./DiscountLiteralCondition";
import { discountAndSchema } from "./DiscountANDCondition";

export const discountConditionSchema = discountLiteralConditionSchema;

export interface IDiscountCondition {
  isSatisfiedBy(basket: FullBasketDTO): boolean;
}
