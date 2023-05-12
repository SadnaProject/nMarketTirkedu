import {
  Condition_Type,
  Condition_on,
  LiteralArgs,
  type ICondition,
} from "./Condition";
import { type FullBasketDTO } from "../StoresController";

export interface LiteralCondition {
  isSatisfiedBy(basket: FullBasketDTO): boolean;
}
export class CategoryLiteralCondition implements LiteralCondition {
  private condition_type: Condition_Type;
  private amount: number;
  private search_For: string;
  constructor(args: LiteralArgs) {
    this.condition_type = args.condition_type;
    this.amount = args.amount;
    this.search_For = args.search_For;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let count = 0;
    basket.products.forEach((product) => {
      if (product.product.category === this.search_For) {
        count += product.BasketQuantity;
      }
    });
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
export class BasketLiteralCondition implements LiteralCondition {
  private condition_type: Condition_Type;
  private amount: number;
  constructor(args: LiteralArgs) {
    this.condition_type = args.condition_type;
    this.amount = args.amount;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let count = 0;
    basket.products.forEach((product) => {
      count += product.BasketQuantity;
    });
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
export class ProductLiteralCondition implements LiteralCondition {
  private condition_type: Condition_Type;
  private amount: number;
  private search_For: string;
  constructor(args: LiteralArgs) {
    this.condition_type = args.condition_type;
    this.amount = args.amount;
    this.search_For = args.search_For;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let count = 0;
    basket.products.forEach((product) => {
      if (product.product.name === this.search_For) {
        count += product.BasketQuantity;
      }
    });
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
export class priceLiteralCondition implements LiteralCondition {
  private condition_type: Condition_Type;
  private amount: number;
  constructor(args: LiteralArgs) {
    this.condition_type = args.condition_type;
    this.amount = args.amount;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    let price = 0;
    basket.products.forEach((product) => {
      price += product.BasketQuantity * product.product.price;
    });
    switch (this.condition_type) {
      case "AtLeast":
        return price >= this.amount;
      case "AtMost":
        return price <= this.amount;
      case "Exactly":
        return price === this.amount;
    }
  }
}
