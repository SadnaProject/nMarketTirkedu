import { TRPCError } from "@trpc/server";
import { Bid, type BidArgs, BidState } from "./Bid";
import { beforeEach, describe, expect, it } from "vitest";
import { itUnitIntegration } from "../helpers/_mock";
describe("Bid", () => {
  const userId = "user123";
  const price = 100;
  const productId = "product123";
  const bidArgs: BidArgs = {
    userId,
    price,
    productId,
    type: "Store",
  };

  let bid: Bid;

  beforeEach(() => {
    bid = new Bid(bidArgs);
  });

  itUnitIntegration("should initialize with the correct values", () => {
    expect(bid.Id).toBeDefined();
    expect(bid.ProductId).toBe(productId);
    expect(bid.Price).toBe(price);
    expect(bid.ApprovedBy).toEqual([]);
    expect(bid.UserId).toBe(userId);
    expect(bid.State).toBe("WAITING");
    expect(bid.Type).toBe("Store");
  });

  itUnitIntegration("should approve the bid and update the state", () => {
    const ownerIds = ["owner1", "owner2"];
    bid.setOwners(ownerIds);

    expect(bid.isApproved()).toBe(false);

    bid.approve("owner1");

    expect(bid.isApproved()).toBe(false);

    bid.approve("owner2");

    expect(bid.isApproved()).toBe(true);
    expect(bid.State).toBe("APPROVED");
  });

  itUnitIntegration("should reject the bid and update the state", () => {
    const userId = "owner1";
    const ownerIds = [userId];

    bid.setOwners(ownerIds);

    bid.reject(userId);

    expect(bid.State).toBe("REJECTED");
  });
  itUnitIntegration("should handle case where bid type is 'Counter'", () => {
    const counterBidArgs: BidArgs = {
      userId,
      price,
      productId,
      previousBidId: "previousBid123",
      type: "Counter",
    };

    const counterBid = new Bid(counterBidArgs);
    counterBid.setOwners([userId]);
    expect(counterBid.Type).toBe("Counter");

    counterBid.approve(userId);

    expect(counterBid.isApproved()).toBe(true);
    expect(counterBid.State).toBe("APPROVED");
  });
  itUnitIntegration(
    "should throw an error if a user tries to approve a bid they don't own",
    () => {
      const ownerIds = ["owner1", "owner2"];
      bid.setOwners(ownerIds);

      expect(() => bid.approve("owner3")).toThrow(
        new TRPCError({
          code: "UNAUTHORIZED",
          message: "this user can't approve this bid",
        })
      );
    }
  );
});
