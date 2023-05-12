import { z } from "zod";
import * as R from "ramda";

import {
  ConditionArgs,
  ICondition,
  conditionSchema,
} from "../Conditions/CompositeLogicalCondition/Condition";
import { FullBasketDTO } from "../StoresController";
import { buildCondition } from "../Conditions/CompositeLogicalCondition/_typeDictionary";

type Discount_on = "product" | "category" | "store";

const SimpleDiscountSchema = z.object({
  discount_on: z.enum(["product", "category", "store"]),
  amount: z.number(),
  search_For: z.string().optional(),
  condition: z.lazy(() => conditionSchema),
  discount: z.number(),
  type: z.literal("Simple"),
});
export interface SimpleDiscountArgs {
  discount_on: Discount_on;
  search_For?: string;
  condition: ConditionArgs;
  discount: number;
  type: "Simple";
}

const compositeDiscountSchema = z.object({
  left: z.lazy(() => DiscountSchema),
  right: z.lazy(() => DiscountSchema),
  type: z.enum(["Max", "Add"]),
});
interface CompositeDiscountArgs {
  left: DiscountArgs;
  right: DiscountArgs;
  type: "Max" | "Add";
}

export type DiscountArgs = SimpleDiscountArgs | CompositeDiscountArgs;
export const DiscountSchema: z.ZodType<DiscountArgs> = z.union([
  SimpleDiscountSchema,
  compositeDiscountSchema,
]);
export interface IDiscount {
  calculateDiscount(basket: FullBasketDTO): FullBasketDTO;
}

export class Discount implements IDiscount {
  condition: ICondition;
  discount: number;
  discount_on: Discount_on;
  search_For?: string;
  constructor(args: SimpleDiscountArgs) {
    this.condition = buildCondition(args.condition);
    this.discount = args.discount;
    this.discount_on = args.discount_on;
    this.search_For = args.search_For;
  }

  public calculateDiscount(basket: FullBasketDTO) {
    if (this.condition.isSatisfiedBy(basket)) {
      basket.products.forEach((product) => {
        if (
          (this.discount_on === "product" &&
            product.product.name === this.search_For) ||
          (this.discount_on === "category" &&
            product.product.category === this.search_For) ||
          this.discount_on === "store"
        ) {
          product.Discount += this.discount;
        }
      });
    }
    return basket;
  }
}

export class MaxBetweenDiscount implements IDiscount {
  first: IDiscount;
  second: IDiscount;
  constructor(compositeDiscount: CompositeDiscountArgs) {
    this.first = buildDiscount(compositeDiscount.left);
    this.second = buildDiscount(compositeDiscount.right);
  }
  public calculateDiscount(basket: FullBasketDTO) {
    const first = R.clone(basket);
    const second = R.clone(basket);
    const firstBasket = this.first.calculateDiscount(first);
    const secondBasket = this.second.calculateDiscount(second);
    let firstPrice = 0;
    let secondPrice = 0;
    firstBasket.products.forEach((product) => {
      firstPrice +=
        product.product.price *
        product.BasketQuantity *
        (1 - product.Discount / 100);
    });
    secondBasket.products.forEach((product) => {
      secondPrice +=
        product.product.price *
        product.BasketQuantity *
        (1 - product.Discount / 100);
    });
    return firstPrice < secondPrice ? firstBasket : secondBasket;
  }
}
export class addBetweenDiscount implements IDiscount {
  first: IDiscount;
  second: IDiscount;
  constructor(compositeDiscount: CompositeDiscountArgs) {
    this.first = buildDiscount(compositeDiscount.left);
    this.second = buildDiscount(compositeDiscount.right);
  }
  public calculateDiscount(basket: FullBasketDTO) {
    return this.second.calculateDiscount(this.first.calculateDiscount(basket));
  }
}

const typeToClassDiscount = {
  Max: MaxBetweenDiscount,
  Add: addBetweenDiscount,
};
export function buildDiscount(args: DiscountArgs): IDiscount {
  if (args.type === "Simple") {
    return new Discount(args);
  }
  return new typeToClassDiscount[args.type](args);
}
