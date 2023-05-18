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
export const storeBidArgsSchema = z.object({
  userId: z.string().uuid(),
  price: z.number().nonnegative(),
  productId: z.string().uuid(),
  type: z.literal("Store"),
});
export type storeBidArgs = z.infer<typeof storeBidArgsSchema>;
export const counterBidArgsSchema = z.object({
  userId: z.string().uuid(),
  price: z.number().nonnegative(),
  productId: z.string().uuid(),
  previousBidId: z.string().uuid(),
  type: z.literal("Counter"),
});
export type counterBidArgs = z.infer<typeof counterBidArgsSchema>;
export const bidArgsSchema = z.union([
  storeBidArgsSchema,
  counterBidArgsSchema,
]);
export type BidArgs = z.infer<typeof bidArgsSchema>;
export type BidDTO = {
  id: string;
  userId: string;
  productId: string;
  price: number;
  approvedBy: string[];
  rejectedBy: string[];
  state: BidState;
  type: "Store" | "Counter";
};
export class Bid {
  protected id: string;
  protected productId: string;
  protected price: number;
  protected approvedBy: string[];
  protected rejectedBy: string[];
  protected userId: string;
  protected owners: string[] = [];
  protected state: BidState;
  protected type: "Store" | "Counter";
  constructor(bidArgs: BidArgs) {
    this.id = randomUUID();
    this.productId = bidArgs.productId;
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
    if (!this.owners.includes(userId))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "this user can't approve this bid",
      });
    if (this.rejectedBy.includes(userId))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "this user has already rejected this bid",
      });
    this.approvedBy.push(userId);
    if (
      this.owners.every((owner) => this.approvedBy.includes(owner)) &&
      this.rejectedBy.length === 0
    )
      this.state = "APPROVED";
  }

  public get ApprovedBy() {
    return this.approvedBy;
  }
  public isApproved() {
    return this.state === "APPROVED";
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
    if (!this.owners.includes(userId))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "this user can't approve this bid",
      });
    if (this.approvedBy.includes(userId))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "this user has already approved this bid",
      });
    this.rejectedBy.push(userId);
    this.state = "REJECTED";
  }
  public get ProductId() {
    return this.productId;
  }
  public get Type() {
    return this.type;
  }
  public removeVote(userId: string) {
    if (this.state === "APPROVED")
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "this bid is already approved",
      });

    if (!this.owners.includes(userId))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "this user can't vote to this bid",
      });
    this.approvedBy = this.approvedBy.filter((id) => id !== userId);
    this.rejectedBy = this.rejectedBy.filter((id) => id !== userId);
    if (this.rejectedBy.length === 0) this.state = "WAITING";
  }
  public get DTO(): BidDTO {
    return {
      id: this.id,
      productId: this.productId,
      price: this.price,
      approvedBy: this.approvedBy,
      rejectedBy: this.rejectedBy,
      userId: this.userId,
      state: this.state,
      type: this.type,
    };
  }
}
