import { Testable, testable } from "~/_Testable";
import { PositionHolder } from "~/DomainLayer/Jobs/PositionHolder";

@testable
export class JobsRepo extends Testable {
  private storeIdToFounder = new Map<string, PositionHolder>();
  private systemAdminIds: string[];
  constructor() {
    super();
    this.systemAdminIds = [];
  }
  public getAllStoreIds(): string[] {
    return Array.from(this.storeIdToFounder.keys());
  }
  public addSystemAdmin(userId: string): void {
    this.systemAdminIds.push(userId);
  }
  public removeSystemAdmin(userId: string): void {
    this.systemAdminIds = this.systemAdminIds.filter((id) => id !== userId);
  }
  public getSystemAdmins(): string[] {
    return this.systemAdminIds;
  }

  public SetStoreFounder(founder: PositionHolder): void {
    this.storeIdToFounder.set(founder.StoreId, founder);
  }

  public GetStoreFounder(storeId: string): PositionHolder {
    const founder = this.storeIdToFounder.get(storeId);
    if (founder === undefined) {
      throw new Error("Store founder not found");
    }
    return founder;
  }
  public getPositionHolderByUserIdAndStoreId(
    userId: string,
    storeId: string
  ): PositionHolder | undefined {
    const founder = this.GetStoreFounder(storeId);
    const positionHolder = this.findPositionHolder(userId, founder);
    return positionHolder;
  }
  private findPositionHolder(
    userId: string,
    positionHolder: PositionHolder
  ): PositionHolder | undefined {
    if (positionHolder.UserId === userId) {
      return positionHolder;
    }
    for (const appointedByMe of positionHolder.Appointments) {
      const found = this.findPositionHolder(userId, appointedByMe);
      if (found !== undefined) {
        return found;
      }
    }
    return undefined;
  }
  public getAllPositionHoldersByStoreId(storeId: string): PositionHolder[] {
    const founder = this.GetStoreFounder(storeId);
    return this.getAllPositionHolders(founder);
  }
  private getAllPositionHolders(
    positionHolder: PositionHolder
  ): PositionHolder[] {
    const positionHolders = [positionHolder];
    for (const appointedByMe of positionHolder.Appointments) {
      positionHolders.push(...this.getAllPositionHolders(appointedByMe));
    }
    return positionHolders;
  }
}
