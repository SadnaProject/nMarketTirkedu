import { randomUUID } from "crypto";
import { BasketDTO } from "./Basket";
import { HasRepos } from "./_HasRepos";
import { TRPCError } from "@trpc/server";
import { Mixin } from "ts-mixer";
import { HasControllers } from "../_HasController";
import { z } from "zod";
import exp from "constants";
const bidStateSchema = z.enum(["APPROVED", "WAITING", "REJECTED"]);
export type BidState = z.infer<typeof bidStateSchema>;
export type storeBidArgs = {
  userId: string;
  price: number;
  basket: BasketDTO;
  type: "Store";
};

export type counterBidArgs = {
  userId: string;
  price: number;
  basket: BasketDTO;
  previousBidId: string;
  type: "Counter";
};
export type BidArgs = storeBidArgs | counterBidArgs;

export class Bid {
  protected id: string;
  protected storeId: string;
  protected basket: BasketDTO;
  protected price: number;
  protected approvedBy: string[];
  protected rejectedBy: string[];
  protected userId: string;
  protected owners: string[] = [];
  protected state: BidState;
  protected type: "Store" | "Counter";
  constructor(bidArgs: BidArgs) {
    this.id = randomUUID();
    this.basket = bidArgs.basket;
    this.storeId = this.basket.storeId;
    this.price = bidArgs.price;
    this.approvedBy = [];
    this.userId = bidArgs.userId;
    this.rejectedBy = [];
    this.state = "WAITING";
    this.type = bidArgs.type;
  }
  public get Id() {
    return this.id;
  }
  public approve(userId: string) {
    this.approvedBy.push(userId);
    if (
      this.owners.every((owner) => this.approvedBy.includes(owner)) ||
      this.type === "Counter"
    )
      this.state = "APPROVED";
  }
  public get ApprovedBy() {
    return this.approvedBy;
  }
  public isApproved() {
    return this.state === "APPROVED";
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
  public set Owners(owners: string[]) {
    this.owners = owners;
  }
  public get State() {
    return this.state;
  }
  public get UserId() {
    return this.userId;
  }
  public reject(userId: string) {
    this.rejectedBy.push(userId);
    this.state = "REJECTED";
  }
  public get Type() {
    return this.type;
  }
}
export class StoreBid extends Bid {
  constructor(bidArgs: storeBidArgs) {
    super(bidArgs);
  }
  public get Id() {
    return this.id;
  }
  public approve(userId: string) {
    this.approvedBy.push(userId);
    if (this.owners.every((owner) => this.approvedBy.includes(owner)))
      this.state = "APPROVED";
  }
  public get ApprovedBy() {
    return this.approvedBy;
  }
  public isApproved() {
    return this.state === "APPROVED";
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
  public set Owners(owners: string[]) {
    this.owners = owners;
  }
  public get State() {
    return this.state;
  }
  public get UserId() {
    return this.userId;
  }
  public reject(userId: string) {
    this.rejectedBy.push(userId);
    this.state = "REJECTED";
  }
}
