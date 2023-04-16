import { z } from "zod";
import { HasRepos, type Repos } from "./HasRepos";
import { StoreProduct, type StoreProductArgs } from "./StoreProduct";
import { type BasketDTO } from "../Users/Basket";
import { Mixin } from "ts-mixer";
import { type Controllers, HasControllers } from "../HasController";
const { randomUUID } = await import("crypto");

export const nameSchema = z.string().nonempty();

export type StoreDTO = {
  id: string;
  name: string;
  isActive: boolean;
};

export class Store extends Mixin(HasRepos, HasControllers) {
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

  static fromDTO(dto: StoreDTO, repos: Repos, controllers: Controllers) {
    const store = new Store(dto.name)
      .initRepos(repos)
      .initControllers(controllers);
    store.id = dto.id;
    store.isActive = dto.isActive;
    return store;
  }

  static fromStoreId(storeId: string, repos: Repos) {
    return repos.Stores.getStoreById(storeId);
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
    return this.Repos.Products.getProductsByStoreId(this.id).map((p) => p.DTO);
  }

  public createProduct(product: StoreProductArgs) {
    const newProduct = new StoreProduct(product).initRepos(this.Repos);
    this.Repos.Products.addProduct(this.Id, newProduct);
    return newProduct.Id;
  }

  public getBasketPrice(basketDTO: BasketDTO): number {
    const productsIds = this.Products.map((p) => p.id);
    return basketDTO.products.reduce((acc, curr) => {
      const product = this.Repos.Products.getProductById(curr.storeProductId);
      if (!productsIds.includes(curr.storeProductId))
        throw new Error(
          `Product ${curr.storeProductId} is not in store ${this.Id}`
        );
      return acc + product.getPriceByQuantity(curr.quantity);
    }, 0);
  }

  public delete() {
    this.Repos.Stores.deleteStore(this.Id);
  }

  makeOwner(currentId: string, targetUserId: string) {
    this.Controllers.Jobs.makeStoreOwner(currentId, this.Id, targetUserId);
  }
  makeManager(currentId: string, targetUserId: string) {
    this.Controllers.Jobs.makeStoreManager(currentId, this.Id, targetUserId);
  }
  removeOwner(currentId: string, targetUserId: string) {
    this.Controllers.Jobs.removeStoreOwner(currentId, this.Id, targetUserId);
  }
  removeManager(currentId: string, targetUserId: string) {
    this.Controllers.Jobs.removeStoreManager(currentId, this.Id, targetUserId);
  }
  setAddingProductPermission(
    currentId: string,
    targetUserId: string,
    permission: boolean
  ) {
    this.Controllers.Jobs.setAddingProductToStorePermission(
      currentId,
      this.Id,
      targetUserId,
      permission
    );
  }
  canCreateProduct(currentId: string) {
    return this.Controllers.Jobs.canCreateProductInStore(currentId, this.Id);
  }
  isOwner(userId: string) {
    return this.Controllers.Jobs.isStoreOwner(userId, this.Id);
  }
  isManager(userId: string) {
    return this.Controllers.Jobs.isStoreManager(userId, this.Id);
  }
  isFounder(userId: string) {
    return this.Controllers.Jobs.isStoreFounder(userId, this.Id);
  }
  get FounderId() {
    return this.Controllers.Jobs.getStoreFounderId(this.Id);
  }
  get OwnersIds() {
    return this.Controllers.Jobs.getStoreOwnersIds(this.Id);
  }
  get ManagersIds() {
    return this.Controllers.Jobs.getStoreManagersIds(this.Id);
  }
}
