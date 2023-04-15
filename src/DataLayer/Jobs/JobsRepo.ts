import { Testable, testable } from "~/Testable";
import type { MemberUserAuthDTO } from "../../DomainLayer/Auth/MemberUserAuth";
import type { GuestUserAuthDTO } from "../../DomainLayer/Auth/GuestUserAuth";
import { PositionHolder, PositionHolderDTO } from "~/DomainLayer/Jobs/PositionHolder";

@testable
export class JobsRepo extends Testable {
    private storeIdToFounder = new Map<string, PositionHolderDTO> ();
    constructor() {
        super();
    }
    public SetStoreFounder(founder: PositionHolderDTO): void {
        this.storeIdToFounder.set(founder.storeId, founder);
    }
    public addPositionHolder(appointer: PositionHolderDTO, appointee: PositionHolderDTO): void {
        appointer.appointedByMe.push(appointee);
    }

    public GetStoreFounder(storeId: string): PositionHolderDTO {
        const founder = this.storeIdToFounder.get(storeId);
        if (founder === undefined) {
            throw new Error("Store founder not found");
        }
        return founder;
    }
    public getPositionHolderByUserIdAndStoreId(userId: string, storeId: string): PositionHolderDTO {
        const founder = this.GetStoreFounder(storeId);
        const positionHolder = this.findPositionHolder(userId, founder);
        if (positionHolder === undefined) {
            throw new Error("Position holder not found");
        }
        return positionHolder;
    }
    private findPositionHolder(userId: string, positionHolder: PositionHolderDTO): PositionHolderDTO | undefined {
        if (positionHolder.userId === userId) {
            return positionHolder;
        }
        for (const appointedByMe of positionHolder.appointedByMe) {
            const found = this.findPositionHolder(userId, appointedByMe);
            if (found !== undefined) {
                return found;
            }
        }
        return undefined;
    }

}
