import { Testable, testable } from "~/Testable";
import { type StoreDTO } from "../../DomainLayer/Stores/Store";

@testable
export class StoresRepo extends Testable {
  private stores: StoreDTO[];

  constructor() {
    super();
    this.stores = [];
  }

  public addStore(store: StoreDTO) {
    this.stores.push(store);
  }

  public getAllStores() {
    return this.stores;
  }

  public getAllNames() {
    const names = new Set<string>();
    this.stores.forEach((store) => names.add(store.name));
    return names;
  }

  public getStoreById(storeId: string) {
    const store = this.stores.find((store) => store.id === storeId);
    if (!store) {
      throw new Error("Store not found");
    }
    return store;
  }

  public setIsActive(storeId: string, isActive: boolean) {
    const store = this.getStoreById(storeId);
    store.isActive = isActive;
  }

  public deleteStore(storeId: string) {
    const store = this.getStoreById(storeId);
    this.stores = this.stores.filter((s) => s.id !== store.id);
  }
}
