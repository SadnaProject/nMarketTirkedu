import { Testable, testable } from "server/domain/_Testable";
import { type Store } from "../Store";
import { TRPCError } from "@trpc/server";

@testable
export class StoresRepo extends Testable {
  private stores: Store[];

  constructor() {
    super();
    this.stores = [];
  }

  public addStore(store: Store) {
    this.stores.push(store);
  }

  public getAllStores() {
    return this.stores;
  }

  public getActiveStores() {
    return this.stores.filter((store) => store.IsActive);
  }

  public getAllNames() {
    return new Set(this.stores.map((store) => store.Name));
  }

  public getStoreById(storeId: string) {
    const store = this.stores.find((store) => store.Id === storeId);
    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }
    return store;
  }

  public deleteStore(storeId: string) {
    const store = this.getStoreById(storeId);
    this.stores = this.stores.filter((s) => s.Id !== store.Id);
  }
}
