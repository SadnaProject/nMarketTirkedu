import { Testable, testable } from "~/Testable";
import type { MemberUserAuthDTO } from "../Auth/MemberUserAuth";
import type { GuestUserAuthDTO } from "../Auth/GuestUserAuth";
import { PositionHolder } from "~/DomainLayer/Jobs/PositionHolder";

@testable
export class JobsRepo extends Testable {
    
    private storeIdToFounder = new Map<string, PositionHolder> ();
    constructor() {
        super();
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
    public getPositionHolderByUserIdAndStoreId(userId: string, storeId: string): PositionHolder {
        const founder = this.GetStoreFounder(storeId);
        const positionHolder = this.findPositionHolder(userId, founder);
        if (positionHolder === undefined) {
            throw new Error("Position holder not found");
        }
        return positionHolder;
    }
    private findPositionHolder(userId: string, positionHolder: PositionHolder): PositionHolder | undefined {
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
    private getAllPositionHolders(positionHolder: PositionHolder): PositionHolder[] {
        const positionHolders = [positionHolder];
        for (const appointedByMe of positionHolder.Appointments) {
            positionHolders.push(...this.getAllPositionHolders(appointedByMe));
        }
        return positionHolders;
    }

}
