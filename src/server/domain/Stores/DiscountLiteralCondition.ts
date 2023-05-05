import { IDiscountCondition } from "./DiscountCondition";
import { FullBasketDTO } from "./StoresController";
type Discount_on = "Product" | "Category" | "Basket";
type Discount_Type = "AtLeast" | "AtMost" | "Exactly";

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
            count += product.quantity;
          }
        });
        break;
      case "Category":
        basket.products.forEach((product) => {
          if (product.product.category === this.search_For) {
            count += product.quantity;
          }
        });
        break;
      case "Basket":
        basket.products.forEach((product) => {
          count += product.quantity;
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
