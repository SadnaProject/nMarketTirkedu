import { randomUUID } from "crypto";
import { BidState, MakeOwner as MakeOwnerDAO } from "@prisma/client";
export class MakeOwner {
  private storeId: string;
  private targetUserId: string;
  private appointerUserId: string;
  private Owners: string[];
  private approveBy: string[];
  private rejectBy: string[];
  private id: string;
  private state: BidState = BidState.WAITING;
  constructor(
    storeId: string,
    targetUserId: string,
    appointerUserId: string,
    Owners: string[],
    approveBy?: string[],
    rejectBy?: string[]
  ) {
    this.storeId = storeId;
    this.targetUserId = targetUserId;
    this.appointerUserId = appointerUserId;
    this.Owners = Owners;
    this.id = randomUUID();
    this.approveBy = approveBy || [];
    this.rejectBy = rejectBy || [];
  }
  public approve(userId: string) {
    if (this.Owners.includes(userId)) {
      this.Owners = this.Owners.filter((id) => id !== userId);
    }
  }
  public isApproved() {
    return this.state === "APPROVED";
  }
  public getStoreId() {
    return this.storeId;
  }
  public getTargetUserId() {
    return this.targetUserId;
  }
  public getAppointerUserId() {
    return this.appointerUserId;
  }
  public getId() {
    return this.id;
  }
  public getOwners() {
    return this.Owners;
  }
  public getState() {
    return this.state;
  }
  public getApprovers() {
    return this.approveBy;
  }
  public getRejectors() {
    return this.rejectBy;
  }
  public static fromDAO(dao: MakeOwnerDAO) {
    const make = new MakeOwner(
      dao.storeId,
      dao.userId,
      dao.appointedBy,
      dao.Owners,
      dao.approvedBy,
      dao.rejectedBy
    );
    make.id = dao.id;
    make.state = dao.state;
    return make;
  }
}
