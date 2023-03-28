import { type DiscountCondition } from "./DiscountCondition";

export type DiscountArgs = {
  discountAmount: number;
  discountType: "PERCENTAGE" | "FIXED";
  expirationDate: Date;
};

export class Discount {
  private id: string;
  private discountAmount: number;
  private discountType: "PERCENTAGE" | "FIXED";
  private expirationDate: Date;
  private condtions: DiscountCondition[];

  constructor({ discountAmount, discountType, expirationDate }: DiscountArgs) {
    this.id = crypto.randomUUID();
    this.discountAmount = discountAmount;
    this.discountType = discountType;
    this.expirationDate = expirationDate;
    this.condtions = [];
  }
}
