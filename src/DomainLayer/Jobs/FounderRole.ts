import { Role } from "./Role";

export class FounderRole implements Role//TODO maybe its better to extend OwnerRole
{

    isStoreOwner(): boolean {
        return true;
    }
    isStoreManager(): boolean {
        return false;
    }
    isStoreFounder(): boolean {
        return true;
    }
    canBeAppointedToStoreOwner(): boolean {
        return false;
    }
    canAppointStoreOwner(): boolean {
        throw new Error("Method not implemented.");
    }
    canAppointStoreManager(): boolean {
        throw new Error("Method not implemented.");
    }
    canCreateProductInStore(): boolean {
        return true;
    }
    
}