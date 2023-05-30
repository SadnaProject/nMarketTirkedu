import { Testable, testable } from "server/helpers/_Testable";
import { TRPCError } from "@trpc/server";
import { type Bid } from "server/domain/Users/Bid";

@testable
export class BidRepo extends Testable {
  private bids: Map<string, Bid>;

  constructor() {
    super();
    this.bids = new Map();
  }

  public addBid(bid: Bid): void {
    if (this.bids.has(bid.Id)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "StoreBid already exists",
      });
    }
    this.bids.set(bid.Id, bid);
  }

  public getBid(id: string): Bid {
    const bid = this.bids.get(id);
    if (bid === undefined) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Bid not found",
      });
    }
    return bid;
  }

  public getAllBids(): Bid[] {
    return Array.from(this.bids.values());
  }

  public removeBid(id: string): void {
    if (!this.bids.has(id)) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Bid not found",
      });
    }
    this.bids.delete(id);
  }

  isBidExist(id: string): boolean {
    return this.bids.has(id);
  }
}
