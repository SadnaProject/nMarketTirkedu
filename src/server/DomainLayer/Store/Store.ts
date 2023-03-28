import { DiscountPolicy } from "./DiscountPolicy";

export type StoreDTO = {
  id: string;
  name: string;
  isActive: boolean;
};

export class Store {
  private id: string;
  private name: string;
  private isActive: boolean;
  private discountPolicy: DiscountPolicy;

  constructor(name: string) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.isActive = true;
    this.discountPolicy = new DiscountPolicy();
  }
}
