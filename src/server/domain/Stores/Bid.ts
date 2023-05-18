import { randomUUID } from "crypto";
import { CreditCard } from "../PurchasesHistory/PaymentAdaptor";
import { BasketDTO } from "../Users/Basket";
export type bidArgs = {
  userId: string;
  price: number;
  basket: BasketDTO;
  creditCard: CreditCard;
};

export interface Bid {
  approve(userId: string): void;
  reject(userId: string): void;
}

export class StoreBid implements Bid {
  private id: string;
  private storeId: string;
  private basket: BasketDTO;
  private price: number;
  private creditCard: CreditCard;
  private approvedBy: string[];
  private rejectedBy: string[];
  private userId: string;
  constructor(bidArgs: bidArgs) {
    this.id = randomUUID();
    this.basket = bidArgs.basket;
    this.storeId = this.basket.storeId;
    this.price = bidArgs.price;
    this.creditCard = bidArgs.creditCard;
    this.approvedBy = [];
    this.userId = bidArgs.userId;
    this.rejectedBy = [];
  }
  public get Id() {
    return this.id;
  }
  public approve(userId: string) {
    if (this.rejectedBy.includes(userId)) {
      this.rejectedBy = this.rejectedBy.filter((id) => id !== userId);
    }
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
  public get CreditCard() {
    return this.creditCard;
  }
  public get UserId() {
    return this.userId;
  }
  public reject(userId: string) {
    if (this.approvedBy.includes(userId)) {
      this.approvedBy = this.approvedBy.filter((id) => id !== userId);
    }
    this.rejectedBy.push(userId);
  }
}
export class counterBid implements Bid {
  private id: string;
  private previousBidId: string;
  private storeId: string;
  private basket: BasketDTO;
  private price: number;
  private creditCard: CreditCard;
  private userId: string;
  constructor(bidArgs: bidArgs, previousBidId: string) {
    this.id = randomUUID();
    this.basket = bidArgs.basket;
    this.storeId = this.basket.storeId;
    this.price = bidArgs.price;
    this.creditCard = bidArgs.creditCard;
    this.userId = bidArgs.userId;
    this.previousBidId = previousBidId;
  }
  public get Id() {
    return this.id;
  }
  public approve(userId: string) {
    if (this.rejectedBy.includes(userId)) {
      this.rejectedBy = this.rejectedBy.filter((id) => id !== userId);
    }
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
  public get CreditCard() {
    return this.creditCard;
  }
  public get UserId() {
    return this.userId;
  }
  public reject(userId: string) {
    if (this.approvedBy.includes(userId)) {
      this.approvedBy = this.approvedBy.filter((id) => id !== userId);
    }
    this.rejectedBy.push(userId);
  }
}
