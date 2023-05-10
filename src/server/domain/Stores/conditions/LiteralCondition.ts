import { z } from "zod";
import { type ICondition } from "./Condition";
import { type FullBasketDTO } from "../StoresController";
const ConditionOnSchema = z.enum(["Product", "Category", "Basket"]);
type Condition_on = z.infer<typeof ConditionOnSchema>;
const ConditionTypeSchema = z.enum(["AtLeast", "AtMost", "Exactly"]);
type Condition_Type = z.infer<typeof ConditionTypeSchema>;
export const LiteralConditionSchema = z.object({
  ConditionOn: ConditionOnSchema,
  ConditionType: ConditionTypeSchema,
  amount: z.number(),
  searchFor: z.string(),
});
class LiteralCondition implements ICondition {
  private condition_on: Condition_on;
  private condition_type: Condition_Type;
  private amount: number;
  private search_For: string;
  constructor(
    Condition_on: Condition_on,
    Condition_type: Condition_Type,
    amount: number,
    search_For: string
  ) {
    this.condition_on = Condition_on;
    this.condition_type = Condition_type;
    this.amount = amount;
    this.search_For = search_For;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let count = 0;
    switch (this.condition_on) {
      case "Product":
        basket.products.forEach((product) => {
          if (product.product.name === this.search_For) {
            count += product.BasketQuantity;
          }
        });
        break;
      case "Category":
        basket.products.forEach((product) => {
          if (product.product.category === this.search_For) {
            count += product.BasketQuantity;
          }
        });
        break;
      case "Basket":
        basket.products.forEach((product) => {
          count += product.BasketQuantity;
        });
        break;
    }
    switch (this.condition_type) {
      case "AtLeast":
        return count >= this.amount;
      case "AtMost":
        return count <= this.amount;
      case "Exactly":
        return count === this.amount;
    }
  }
}
