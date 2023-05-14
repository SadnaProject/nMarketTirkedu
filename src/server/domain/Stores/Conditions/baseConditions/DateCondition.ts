import { type FullBasketDTO } from "../../StoresController";
import {
  type conditionType,
  type TimeArgs,
  type TimeConditionType,
} from "../CompositeLogicalCondition/Condition";
import { type ILiteralCondition } from "./LiteralCondition";

export class DateCondition implements ILiteralCondition {
  protected year?: number;
  protected month?: number;
  protected day?: number;
  protected hour?: number;
  protected timeCondition: TimeConditionType;
  constructor(dateArgs: TimeArgs) {
    this.year = dateArgs.year;
    this.month = dateArgs.month;
    this.day = dateArgs.day;
    this.hour = dateArgs.hour;
    this.timeCondition = dateArgs.conditionType;
  }
  public isSatisfiedBy(basket: FullBasketDTO): boolean {
    return this.checkIfDateSatisfied(this.timeCondition);
  }
  protected checkIfDateSatisfied(timeCondition: TimeConditionType): boolean {
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
