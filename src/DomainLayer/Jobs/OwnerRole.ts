import { Role } from "./Role";

export class OwnerRole implements Role{
    canCreateProductInStore(): boolean {
        return true;
    }
}