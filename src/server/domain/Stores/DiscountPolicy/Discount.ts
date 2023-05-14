import { z } from "zod";
import * as R from "ramda";
import {
  type ICondition,
  conditionSchema,
} from "../Conditions/CompositeLogicalCondition/Condition";
import { type FullBasketDTO } from "../StoresController";
import { buildCondition } from "../Conditions/CompositeLogicalCondition/_typeDictionary";

const discountOnSchema = z.enum(["product", "category", "store"]);
export type DiscountOn = z.infer<typeof discountOnSchema>;

const simpleDiscountSchema = z.object({
  discountOn: discountOnSchema,
  amount: z.number(),
  searchFor: z.string().optional(),
  condition: z.lazy(() => conditionSchema),
  type: z.literal("Simple"),
});
export type SimpleDiscountArgs = z.infer<typeof simpleDiscountSchema>;
const compositeTypeSchema = z.enum(["Max", "Add"]);
export type DiscountCompositeType = z.infer<typeof compositeTypeSchema>;
const compositeDiscountSchema = z.object({
  left: z.lazy(() => discountArgsSchema),
  right: z.lazy(() => discountArgsSchema),
  type: compositeTypeSchema,
});
export interface CompositeDiscountArgs {
  left: DiscountArgs;
  right: DiscountArgs;
  type: DiscountCompositeType;
}

export type DiscountArgs = SimpleDiscountArgs | CompositeDiscountArgs;
export const discountArgsSchema: z.ZodType<DiscountArgs> = z.union([
  simpleDiscountSchema,
  compositeDiscountSchema,
]);
export interface IDiscount {
  calculateDiscount(basket: FullBasketDTO): FullBasketDTO;
}

export class Discount implements IDiscount {
  condition: ICondition;
  amount: number;
  discountOn: DiscountOn;
  searchFor?: string;
  constructor(args: SimpleDiscountArgs) {
    this.condition = buildCondition(args.condition);
    this.amount = args.amount;
    this.discountOn = args.discountOn;
    this.searchFor = args.searchFor;
  }

  public calculateDiscount(basket: FullBasketDTO) {
    if (this.condition.isSatisfiedBy(basket)) {
      basket.products.forEach((product) => {
        if (
          (this.discountOn === "product" &&
            product.product.name === this.searchFor) ||
          (this.discountOn === "category" &&
            product.product.category === this.searchFor) ||
          this.discountOn === "store"
        ) {
          product.Discount += this.amount;
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
