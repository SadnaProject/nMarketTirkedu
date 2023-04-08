import { z } from "zod";
import { HasRepos, type Repos } from "./HasRepos";
import { StoreProduct, type StoreProductArgs } from "./StoreProduct";
const { randomUUID } = await import("crypto");

const nameSchema = z.string().nonempty();

export type StoreDTO = {
  id: string;
  name: string;
  isActive: boolean;
};

export class Store extends HasRepos {
  private id: string;
  private name: string;
  private isActive: boolean;

  constructor(name: string) {
    super();
    nameSchema.parse(name);
    this.id = randomUUID();
    this.name = name;
    this.isActive = true;
  }

  static fromDTO(dto: StoreDTO, repos: Repos) {
    const store = new Store(dto.name);
    store.initRepos(repos);
    store.id = dto.id;
    store.isActive = dto.isActive;
    return store;
  }

  public get Id() {
    return this.id;
  }

  public get Name() {
    return this.name;
  }

  public get IsActive() {
    return this.isActive;
  }

  public set IsActive(isActive: boolean) {
    this.Repos.Stores.setIsActive(this.id, isActive);
    this.isActive = isActive;
  }

  public get DTO(): StoreDTO {
    return {
      id: this.id,
      name: this.name,
      isActive: this.isActive,
    };
  }

  public get Products() {
    return this.Repos.Products.getProductsByStoreId(this.id).map(
      (p) => StoreProduct.fromDTO(p, this.Repos).DTO
    );
  }

  public createProduct(product: StoreProductArgs) {
    const newProduct = new StoreProduct(product).initRepos(this.Repos);
    this.Repos.Products.addProduct(this.Id, newProduct.DTO);
    return newProduct.Id;
  }
}
