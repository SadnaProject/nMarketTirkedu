import { buildCondition } from "./conditions/_typeDictionary";
import { ConditionArgs, type ICondition } from "./conditions/Condition";
import { type FullBasketDTO } from "./StoresController";
type Discount_on = "product" | "category" | "store";
type DiscountArgs = {
  discount_on: Discount_on;
  amount: number;
  search_For: string;
};
export interface IDiscount {
  calculateDiscount(basket: FullBasketDTO): FullBasketDTO;
}

export class Discount implements IDiscount {
  condition: ICondition;
  discount: number;
  discount_on: Discount_on;
  search_For?: string;
  constructor(
    condition: ConditionArgs,
    discount: number,
    discount_on: Discount_on,
    name?: string
  ) {
    this.condition = buildCondition(condition);
    this.discount = discount;
    this.discount_on = discount_on;
    this.search_For = name;
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
  constructor(first: Discount, second: Discount) {
    this.first = first;
    this.second = second;
  }
  public calculateDiscount(basket: FullBasketDTO) {
    const firstBasket = this.first.calculateDiscount(basket);
    const secondBasket = this.second.calculateDiscount(basket);
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
    return firstPrice > secondPrice ? firstBasket : secondBasket;
  }
}
export class addBetweenDiscount implements IDiscount {
  first: IDiscount;
  second: IDiscount;
  constructor(first: Discount, second: Discount) {
    this.first = first;
    this.second = second;
  }
  public calculateDiscount(basket: FullBasketDTO) {
    const firstBasket = this.first.calculateDiscount(basket);
    const secondBasket = this.second.calculateDiscount(basket);
    firstBasket.products.forEach((product) => {
      secondBasket.products.forEach((product2) => {
        if (product.product.id === product2.product.id) {
          product.Discount += product2.Discount;
        }
      });
    });
    return firstBasket;
  }
}
