import { type IDiscountCondition } from "./DiscountCondition";
import { type FullBasketDTO } from "./StoresController";
type DiscountType = "percentage" | "flat";
type Discount_on = "product" | "category" | "store";

export class Discount {
  condition: IDiscountCondition;
  type: DiscountType;
  discount: number;
  discount_on: Discount_on;
  search_For?: string;
  constructor(
    condition: IDiscountCondition,
    type: DiscountType,
    discount: number,
    discount_on: Discount_on,
    name?: string
  ) {
    this.condition = condition;
    this.type = type;
    this.discount = discount;
    this.discount_on = discount_on;
    this.search_For = name;
  }

  public calculatePrice(basket: FullBasketDTO) {
    let total_price = 0;
    basket.products.forEach((product) => {
      total_price += product.quantity * product.product.price;
    });
    if (this.condition.isSatisfiedBy(basket)) {
      if (this.discount_on === "product") {
        let removeFromPrice = 0;
        basket.products.forEach((product) => {
          if (product.product.name === this.search_For) {
            if (this.type === "percentage") {
              removeFromPrice =
                product.product.price * product.quantity * this.discount;
            } else if (this.type === "flat") {
              removeFromPrice = product.quantity * this.discount;
            }
          }
        });
        return total_price - removeFromPrice;
      } else if (this.discount_on === "category") {
        let removeFromPrice = 0;
        basket.products.forEach((product) => {
          if (product.product.category === this.search_For) {
            if (this.type === "percentage") {
              removeFromPrice =
                product.product.price * product.quantity * this.discount;
            } else if (this.type === "flat") {
              removeFromPrice = product.quantity * this.discount;
            }
          }
        });
        return total_price - removeFromPrice;
      } else if (this.discount_on === "store") {
        if (this.type === "percentage") {
          return total_price - total_price * this.discount;
        } else if (this.type === "flat") {
          return total_price - this.discount;
        }
      }
    }
  }
}
