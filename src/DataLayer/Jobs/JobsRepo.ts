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
    public GetStoreFounder(storeId: string): PositionHolderDTO {
        const founder = this.storeIdToFounder.get(storeId);
        if (founder === undefined) {
            throw new Error("Store founder not found");
        }
        return founder;
    }

}
