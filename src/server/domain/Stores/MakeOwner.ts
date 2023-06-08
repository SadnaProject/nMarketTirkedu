import { randomUUID } from "crypto";
import { MakeOwner as MakeOwnerDAO } from "@prisma/client";
export class MakeOwner {
  private storeId: string;
  private targetUserId: string;
  private appointerUserId: string;
  private needsApproveBy: string[];
  private approveBy: string[];
  private rejectBy: string[];
  private id: string;
  constructor(
    storeId: string,
    targetUserId: string,
    appointerUserId: string,
    needsApproveBy: string[],
    approveBy?: string[],
    rejectBy?: string[]
  ) {
    this.storeId = storeId;
    this.targetUserId = targetUserId;
    this.appointerUserId = appointerUserId;
    this.needsApproveBy = needsApproveBy;
    this.id = randomUUID();
    this.approveBy = approveBy || [];
    this.rejectBy = rejectBy || [];
  }
  public approve(userId: string) {
    if (this.needsApproveBy.includes(userId)) {
      this.needsApproveBy = this.needsApproveBy.filter((id) => id !== userId);
    }
  }
  public isApproved() {
    return this.needsApproveBy.length === 0;
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
  public getNeedsApproveBy() {
    return this.needsApproveBy;
  }
  public static fromDAO(dao: MakeOwnerDAO) {
    const make = new MakeOwner(
      dao.storeId,
      dao.userId,
      dao.appointedBy,
      dao.needsApproveBy
    );
    make.id = dao.id;
    return make;
  }
}
