import { Testable, testable } from "server/helpers/_Testable";
import { TRPCError } from "@trpc/server";
import { Bid } from "server/domain/Users/Bid";
import { getDB } from "server/helpers/_Transactional";
import { Bid as BidDAO } from "@prisma/client";

export type bidCache = {
  bid: Bid;
  counter: number;
};
let counter = 0;
@testable
export class BidRepo extends Testable {
  private bids: Map<string, bidCache>;

  constructor() {
    super();
    this.bids = new Map();
  }

  public async addBid(bid: Bid) {
    if (this.bids.has(bid.Id)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "StoreBid already exists",
      });
    }
    await getDB().bid.create({
      data: {
        id: bid.Id,
        price: bid.Price,
        productId: bid.ProductId,
        userId: bid.UserId,
        state: bid.State,
        type: bid.Type,
        owners: bid.Owners,
      },
    });
    /// if the size is lower than 10 add it to the map
    if (this.bids.size <= 10) {
      this.bids.set(bid.Id, { bid: bid, counter: counter });
      counter++;
    } else {
      ///find the lowest counter and replace it
      let lowestCounter = 0;
      let lowestBidId = "";
      for (const [key, value] of this.bids.entries()) {
        if (lowestCounter === 0) {
          lowestCounter = value.counter;
          lowestBidId = key;
        } else if (value.counter < lowestCounter) {
          lowestCounter = value.counter;
          lowestBidId = key;
        }
      }
      this.bids.delete(lowestBidId);
      this.bids.set(bid.Id, { bid: bid, counter: counter });
      counter++;
    }
  }

  public async getBid(id: string) {
    const bid = this.bids.get(id);
    if (bid === undefined) {
      const dataBid = await getDB().bid.findUnique({
        where: {
          id: id,
        },
      });
      if (dataBid === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bid not found",
        });
      }
      return Bid.fromDAO(dataBid);
    }
    return bid.bid;
  }

  public async getAllBids() {
    const bids: Bid[] = [];
    const bidsDAOS = await getDB().bid.findMany();
    for (const bidDAO of bidsDAOS) {
      bids.push(Bid.fromDAO(bidDAO));
    }
    return bids;
  }

  public async removeBid(id: string) {
    if (this.bids.has(id)) {
      this.bids.delete(id);
    }
    await getDB().bid.delete({
      where: {
        id: id,
      },
    });
  }
  public async bidState(bidId: string) {
    const bid = await this.getBid(bidId);
    return bid.State;
  }
  public async approveBid(bidId: string, approverId: string) {
    const bid = await this.getBid(bidId);
    if (bid.ApprovedBy.includes(approverId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Bid already approved",
      });
    }
    if (bid.RejectedBy.includes(approverId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Bid already rejected",
      });
    }
    await getDB().bid.update({
      where: {
        id: bidId,
      },
      data: {
        approvedBy: bid.ApprovedBy.concat(approverId),
      },
    });
    bid.ApprovedBy.push(approverId);
    if (this.bids.has(bidId)) {
      this.bids.get(bidId)?.bid.ApprovedBy.push(approverId);
    }
    if (bid.ApprovedBy.length === bid.Owners.length) {
      await getDB().bid.update({
        where: {
          id: bidId,
        },
        data: {
          state: "APPROVED",
        },
      });
      if (this.bids.has(bidId)) {
        this.bids.get(bidId)?.bid.setState("APPROVED");
      }
      bid.setState("APPROVED");
    }
  }
  public async rejectBid(bidId: string, rejecterId: string) {
    const bid = await this.getBid(bidId);
    if (bid.RejectedBy.includes(rejecterId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Bid already rejected",
      });
    }
    if (bid.ApprovedBy.includes(rejecterId)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Bid already approved",
      });
    }
    await getDB().bid.update({
      where: {
        id: bidId,
      },
      data: {
        rejectedBy: bid.RejectedBy.concat(rejecterId),
      },
    });
    bid.RejectedBy.push(rejecterId);
    if (this.bids.has(bidId)) {
      this.bids.get(bidId)?.bid.RejectedBy.push(rejecterId);
    }
    await getDB().bid.update({
      where: {
        id: bidId,
      },
      data: {
        state: "REJECTED",
      },
    });
    if (this.bids.has(bidId)) {
      this.bids.get(bidId)?.bid.setState("REJECTED");
    }
    bid.setState("REJECTED");
  }
  public async getAllBidsSentByUser(userId: string) {
    const bids: Bid[] = [];
    const bidsDAOS = await getDB().bid.findMany({
      where: {
        userId: userId,
      },
    });
    for (const bidDAO of bidsDAOS) {
      bids.push(Bid.fromDAO(bidDAO));
    }
    return bids;
  }
  public async removeOwnerFromBid(bidId: string, ownerId: string) {
    const bid = await this.getBid(bidId);
    const owners = bid.Owners;
    const index = owners.indexOf(ownerId);
    if (index > -1) {
      owners.splice(index, 1);
    }
    await getDB().bid.update({
      where: {
        id: bidId,
      },
      data: {
        owners: owners,
      },
    });
    bid.setOwners(owners);
    if (this.bids.has(bidId)) {
      this.bids.get(bidId)?.bid.setOwners(owners);
    }
  }
  public async forceApprove(bidId: string) {
    const bid = await this.getBid(bidId);
    await getDB().bid.update({
      where: {
        id: bidId,
      },
      data: {
        state: "APPROVED",
      },
    });
    if (this.bids.has(bidId)) {
      this.bids.get(bidId)?.bid.setState("APPROVED");
    }
    bid.setState("APPROVED");
  }
}
