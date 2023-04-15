import { Role } from "./Role";

export class OwnerRole implements Role{
    isStoreOwner(): boolean {
        return true;
    }
    isStoreManager(): boolean {
        return false;
    }
    isStoreFounder(): boolean {
        return false;
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