import { z } from "zod";
import { IDiscountCondition } from "./DiscountCondition";
import { FullBasketDTO } from "./StoresController";
const discountOnSchema = z.enum(["Product", "Category", "Basket"]);
type Discount_on = z.infer<typeof discountOnSchema>;
const discountTypeSchema = z.enum(["AtLeast", "AtMost", "Exactly"]);
type Discount_Type = z.infer<typeof discountTypeSchema>;
export const discountLiteralConditionSchema = z.object({
  discountOn: discountOnSchema,
  discountType: discountTypeSchema,
  amount: z.number(),
  searchFor: z.string(),
});
class DiscountLiteralCondition implements IDiscountCondition {
  private discount_on: Discount_on;
  private discount_type: Discount_Type;
  private amount: number;
  private search_For: string;
  constructor(
    discount_on: Discount_on,
    discount_type: Discount_Type,
    amount: number,
    search_For: string
  ) {
    this.discount_on = discount_on;
    this.discount_type = discount_type;
    this.amount = amount;
    this.search_For = search_For;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let count = 0;
    switch (this.discount_on) {
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
    switch (this.discount_type) {
      case "AtLeast":
        return count >= this.amount;
      case "AtMost":
        return count <= this.amount;
      case "Exactly":
        return count === this.amount;
    }
  }
}
