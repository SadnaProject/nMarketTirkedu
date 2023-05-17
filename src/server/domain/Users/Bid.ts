import { randomUUID } from "crypto";
import { BasketDTO } from "./Basket";

export type bidArgs = {
  userId: string;
  price: number;
  basket: BasketDTO;
};

export class Bid {
  private id: string;
  private storeId: string;
  private basket: BasketDTO;
  private price: number;
  private approvedBy: string[];
  private rejectedBy: string[];
  private userId: string;
  constructor(bidArgs: bidArgs) {
    this.id = randomUUID();
    this.basket = bidArgs.basket;
    this.storeId = this.basket.storeId;
    this.price = bidArgs.price;
    this.approvedBy = [];
    this.userId = bidArgs.userId;
    this.rejectedBy = [];
  }
  public get Id() {
    return this.id;
  }
  public approve(userId: string) {
    this.approvedBy.push(userId);
  }
  public get ApprovedBy() {
    return this.approvedBy;
  }
  public isApproved(owners: string[]) {
    return owners.every((owner) => this.approvedBy.includes(owner));
  }
  public get StoreId() {
    return this.storeId;
  }
  public get Basket() {
    return this.basket;
  }
  public get Price() {
    return this.price;
  }

  public get UserId() {
    return this.userId;
  }
}
