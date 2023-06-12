import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Bid as BidDAO } from "@prisma/client";

const bidStateSchema = z.enum(["APPROVED", "WAITING", "REJECTED"]);
export type BidState = z.infer<typeof bidStateSchema>;
//this is a bid from the user to the store
export const storeBidArgsSchema = z.object({
  userId: z.string().uuid(),
  price: z.number().nonnegative(),
  productId: z.string().uuid(),
  type: z.literal("Store"),
});
export type storeBidArgs = z.infer<typeof storeBidArgsSchema>;
//this is a bid from the store to the user
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
  productName: string;
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
  public get Owners() {
    return this.owners;
  }
  public setOwners(owners: string[]) {
    this.owners = owners;
  }
  public get State() {
    return this.state;
  }
  public setState(state: BidState) {
    this.state = state;
  }
  public get UserId() {
    return this.userId;
  }
  public reject(userId: string) {
    if (!this.owners.includes(userId))
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "this user can't reject this bid",
      });
    if (this.approvedBy.includes(userId))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "this user has already reject this bid",
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
      productName: this.productId,
      price: this.price,
      approvedBy: this.approvedBy,
      rejectedBy: this.rejectedBy,
      userId: this.userId,
      state: this.state,
      type: this.type,
    };
  }
  public get RejectedBy() {
    return this.rejectedBy;
  }

  public static fromDAO(bidDAO: BidDAO) {
    if (bidDAO.type === "Counter") {
      if (!bidDAO.previousBidId)
        throw new TRPCError({
          code: "CONFLICT",
          message: "previousBidId is required for counter bid",
        });
      const bid = new Bid({
        userId: bidDAO.userId,
        price: bidDAO.price,
        productId: bidDAO.productId,
        previousBidId: bidDAO.previousBidId,
        type: bidDAO.type,
      });
      bid.id = bidDAO.id;
      bid.approvedBy = bidDAO.approvedBy;
      bid.rejectedBy = bidDAO.rejectedBy;
      bid.state = bidDAO.state;
      bid.setOwners(bidDAO.owners);
      return bid;
    } else {
      const bid = new Bid({
        userId: bidDAO.userId,
        price: bidDAO.price,
        productId: bidDAO.productId,
        type: bidDAO.type,
      });
      bid.id = bidDAO.id;
      bid.approvedBy = bidDAO.approvedBy;
      bid.rejectedBy = bidDAO.rejectedBy;
      bid.state = bidDAO.state;
      bid.setOwners(bidDAO.owners);
      return bid;
    }
  }
}
