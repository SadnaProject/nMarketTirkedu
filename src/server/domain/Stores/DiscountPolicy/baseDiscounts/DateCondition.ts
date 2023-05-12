import { type FullBasketDTO } from "../../StoresController";
import { type Condition_Type } from "../../conditions/Condition";
import { type LiteralCondition } from "../../conditions/LiteralCondition";
import {
  type TimeArgs,
  type TimeCondition_Type,
} from "../CompositeLogicalDiscounts/Condition";
export class DateCondition implements LiteralCondition {
  protected condition_type: Condition_Type;
  protected year?: number;
  protected month?: number;
  protected day?: number;
  protected hour?: number;
  protected timeCondition: TimeCondition_Type;
  constructor(dateArgs: TimeArgs) {
    this.condition_type = dateArgs.condition_type;
    this.year = dateArgs.year;
    this.month = dateArgs.month;
    this.day = dateArgs.day;
    this.hour = dateArgs.hour;
    this.timeCondition = dateArgs.timeCondition;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    return this.checkIfDateSatisfied(this.timeCondition);
  }
  protected checkIfDateSatisfied(timeCondition: TimeCondition_Type): boolean {
    switch (timeCondition) {
      case "Before":
        return this.checkIfDateSmaller();
      case "At":
        return this.checkIfDateEqual();
      case "After":
        return this.checkIfDateGreater();
    }
  }

  protected checkIfDateEqual(): boolean {
    return (
      this.checkIfYearEqual() &&
      this.checkIfMonthEqual() &&
      this.checkIfDayEqual() &&
      this.checkIfHourEqual()
    );
  }
  protected checkIfDateGreater(): boolean {
    return (
      this.checkIfYearGreater() ||
      (this.checkIfYearEqual() &&
        (this.checkIfMonthGreater() ||
          (this.checkIfMonthEqual() &&
            (this.checkIfDayGreater() ||
              (this.checkIfDayEqual() &&
                (this.checkIfHourGreater() || this.hour === undefined))))))
    );
  }
  protected checkIfDateSmaller(): boolean {
    return (
      this.checkIfYearSmaller() ||
      (this.checkIfYearEqual() &&
        (this.checkIfMonthSmaller() ||
          (this.checkIfMonthEqual() &&
            (this.checkIfDaySmaller() ||
              (this.checkIfDayEqual() &&
                (this.checkIfHourSmaller() || this.hour === undefined))))))
    );
  }
  protected checkIfYearGreater(): boolean {
    const date = new Date();
    return this.year !== undefined && date.getFullYear() > this.year;
  }
  protected checkIfYearSmaller(): boolean {
    const date = new Date();
    return this.year !== undefined && date.getFullYear() < this.year;
  }
  protected checkIfMonthGreater(): boolean {
    const date = new Date();
    return this.month !== undefined && date.getMonth() > this.month;
  }
  protected checkIfMonthSmaller(): boolean {
    const date = new Date();
    return this.month !== undefined && date.getMonth() < this.month;
  }
  protected checkIfDayGreater(): boolean {
    const date = new Date();
    return this.day !== undefined && date.getDate() > this.day;
  }
  protected checkIfDaySmaller(): boolean {
    const date = new Date();
    return this.day !== undefined && date.getDate() < this.day;
  }
  protected checkIfHourGreater(): boolean {
    const date = new Date();
    return this.hour !== undefined && date.getHours() > this.hour;
  }
  protected checkIfHourSmaller(): boolean {
    const date = new Date();
    return this.hour !== undefined && date.getHours() < this.hour;
  }
  protected checkIfYearEqual(): boolean {
    const date = new Date();
    return this.year === undefined || date.getFullYear() === this.year;
  }
  protected checkIfMonthEqual(): boolean {
    const date = new Date();
    return this.month === undefined || date.getMonth() === this.month;
  }
  protected checkIfDayEqual(): boolean {
    const date = new Date();
    return this.day === undefined || date.getDate() === this.day;
  }
  protected checkIfHourEqual(): boolean {
    const date = new Date();
    return this.hour === undefined || date.getHours() === this.hour;
  }
}
export class DateProductCondition extends DateCondition {
  private searchProduct?: string;
  private amount?: number;
  constructor(dateArgs: TimeArgs) {
    super(dateArgs);
    this.searchProduct = dateArgs.search_For;
    this.amount = dateArgs.amount;
    this.condition_type = dateArgs.condition_type;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    if (this.searchProduct === undefined || this.amount === undefined) {
      return super.isSatisfiedBy(basket);
    }
    let count = 0;
    basket.products.forEach((product) => {
      if (product.product.name === this.searchProduct) {
        count += product.BasketQuantity;
      }
    });
    return (
      checkIfConditionTypeIsSatisfied(
        this.condition_type,
        count,
        this.amount
      ) && this.checkIfDateSatisfied(this.timeCondition)
    );
  }
}
export class DateStoreCondition extends DateCondition {
  private amount?: number;
  constructor(dateArgs: TimeArgs) {
    super(dateArgs);
    this.amount = dateArgs.amount;
    this.condition_type = dateArgs.condition_type;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    if (this.amount === undefined) {
      return super.isSatisfiedBy(basket);
    }
    let count = 0;
    basket.products.forEach((product) => {
      count += product.BasketQuantity;
    });
    return (
      checkIfConditionTypeIsSatisfied(
        this.condition_type,
        count,
        this.amount
      ) && this.checkIfDateSatisfied(this.timeCondition)
    );
  }
}
export class DateCategoryCondition extends DateCondition {
  private searchCategory?: string;
  private amount?: number;
  constructor(dateArgs: TimeArgs) {
    super(dateArgs);
    this.searchCategory = dateArgs.search_For;
    this.amount = dateArgs.amount;
    this.condition_type = dateArgs.condition_type;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    if (this.searchCategory === undefined || this.amount === undefined) {
      return super.isSatisfiedBy(basket);
    }
    let count = 0;
    basket.products.forEach((product) => {
      if (product.product.category === this.searchCategory) {
        count += product.BasketQuantity;
      }
    });
    return (
      checkIfConditionTypeIsSatisfied(
        this.condition_type,
        count,
        this.amount
      ) && this.checkIfDateSatisfied(this.timeCondition)
    );
  }
}
function checkIfConditionTypeIsSatisfied(
  condition_type: Condition_Type,
  count: number,
  amount: number
): boolean {
  switch (condition_type) {
    case "AtLeast":
      return count >= amount;
    case "AtMost":
      return count <= amount;
    case "Exactly":
      return count === amount;
  }
}
