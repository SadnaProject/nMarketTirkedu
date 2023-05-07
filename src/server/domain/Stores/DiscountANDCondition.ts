import { z } from "zod";
import {
  type IDiscountCondition,
  discountConditionSchema,
} from "./DiscountCondition";
import { type FullBasketDTO } from "./StoresController";

export const discountAndSchema = z.object({
  first: z.lazy(() => discountConditionSchema),
  second: z.lazy(() => discountConditionSchema),
});
class DiscountANDCondition implements IDiscountCondition {
  private first: IDiscountCondition;
  private second: IDiscountCondition;
  constructor(first: IDiscountCondition, second: IDiscountCondition) {
    this.first = first;
    this.second = second;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    return (
      this.first.isSatisfiedBy(basket) && this.second.isSatisfiedBy(basket)
    );
  }
}
