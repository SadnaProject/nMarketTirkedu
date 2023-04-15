import { Role } from "./Role";

export class ManagerRole implements Role{
    canBeAppointedToStoreOwner(): boolean {
        return true;
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