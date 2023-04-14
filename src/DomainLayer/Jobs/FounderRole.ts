import { Role } from "./Role";

export class FounderRole implements Role{
    canCreateProductInStore(): boolean {
        return true;
    }
}