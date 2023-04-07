import { type StoreDTO } from "./Store";

export class StoresRepo {
  private stores: Set<StoreDTO>;

  constructor() {
    this.stores = new Set<StoreDTO>();
  }

  public addStore(store: StoreDTO) {
    this.stores.add(store);
  }

  public getAllNames() {
    const names = new Set<string>();
    this.stores.forEach((store) => names.add(store.name));
    return names;
  }
}
