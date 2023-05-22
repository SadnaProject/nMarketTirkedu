import { z } from "zod";
import { HasRepos, type Repos } from "./_HasRepos";
import { StoreProduct, type StoreProductArgs } from "./StoreProduct";
import { type BasketDTO } from "../Users/Basket";
import { Mixin } from "ts-mixer";
import { type Controllers, HasControllers } from "../_HasController";
import { randomUUID } from "crypto";
import { TRPCError } from "@trpc/server";
import {
  type ProductWithQuantityDTO,
  type FullBasketDTO,
} from "./StoresController";
import { ConstraintPolicy } from "./PurchasePolicy/ConstraintPolicy";
import { type BasketProductDTO } from "../Users/BasketProduct";
import { type DiscountArgs } from "./DiscountPolicy/Discount";
import { DiscountPolicy } from "./DiscountPolicy/DiscountPolicy";
import { type ConditionArgs } from "./Conditions/CompositeLogicalCondition/Condition";
import { type CartDTO } from "../Users/Cart";
import { type Store as StoreDAO } from "@prisma/client";
export const nameSchema = z.string().nonempty();

export type StoreDTO = {
  id: string;
  name: string;
  isActive: boolean;
  rating: number;
};

export class Store extends Mixin(HasRepos, HasControllers) {
  private id: string;
  private name: string;
  private isActive: boolean;
  private discountPolicy: DiscountPolicy;
  private constraintPolicy: ConstraintPolicy;

  constructor(name: string) {
    super();
    this.id = randomUUID();
    nameSchema.parse(name);
    this.name = name;
    this.isActive = true;
    this.discountPolicy = new DiscountPolicy(this.id);
    this.constraintPolicy = new ConstraintPolicy(this.Id);
  }

  static fromDTO(dto: StoreDTO, repos: Repos, controllers: Controllers) {
    const store = new Store(dto.name)
      .initRepos(repos)
      .initControllers(controllers);
    store.id = dto.id;
    store.isActive = dto.isActive;
    return store;
  }
  static fromDAO(
    store: StoreDAO,
    discountPolicy: DiscountPolicy,
    constraintPolicy: ConstraintPolicy
  ) {
    const newStore = new Store(store.name);
    newStore.id = store.id;
    newStore.isActive = store.isActive;
    newStore.discountPolicy = discountPolicy;
    newStore.constraintPolicy = constraintPolicy;
    return newStore;
  }
  static async fromStoreId(
    storeId: string,
    repos: Repos,
    controllers: Controllers
  ) {
    const store = await repos.Stores.getStoreById(storeId);
    return store.initRepos(repos).initControllers(controllers);
  }

  public get Id() {
    return this.id;
  }

  public set Id(id: string) {
    this.id = id;
  }
  public get Name() {
    return this.name;
  }

  public IsActive() {
    return this.isActive;
  }

  public async setActive(isActive: boolean) {
    this.isActive = isActive;
    await this.Repos.Stores.setField(this.Id, "isActive", isActive);
  }

  public async getDTO(): Promise<StoreDTO> {
    return {
      id: this.id,
      name: this.name,
      isActive: this.isActive,
      rating: await this.Controllers.PurchasesHistory.getStoreRating(this.id),
    };
  }

  public async getProducts() {
    const products = await this.Repos.Products.getProductsByStoreId(this.id);
    products.forEach((product) =>
      product.initRepos(this.Repos).initControllers(this.Controllers)
    );
    const productsDTO = await Promise.all(
      products.map((product) => product.getDTO())
    );
    return productsDTO;
  }

  public async createProduct(product: StoreProductArgs) {
    const newProduct = new StoreProduct(product)
      .initControllers(this.Controllers)
      .initRepos(this.Repos);
    const productId = await this.Repos.Products.addProduct(this.Id, newProduct);
    newProduct.Id = productId;
    return newProduct.Id;
  }
  public async getBasketPrice(
    userId: string,
    basketDTO: BasketDTO
  ): Promise<number> {
    let fullBasket = await this.BasketDTOToFullBasketDTO(basketDTO);

    fullBasket = this.discountPolicy.applyDiscounts(fullBasket);
    let price = 0;
    for (const product of fullBasket.products) {
      price +=
        product.BasketQuantity *
        (
          await this.Repos.Products.getProductById(product.product.id)
        ).getPriceForUser(userId);
    }
    return price;
  }

  public async checkIfBasketFulfillsPolicy(
    basketDTO: BasketDTO
  ): Promise<boolean> {
    const fullBasket = await this.BasketDTOToFullBasketDTO(basketDTO);
    return this.constraintPolicy.isSatisfiedBy(fullBasket);
  }
  public async delete() {
    await this.Repos.Stores.deleteStore(this.Id);
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
  get Purchases() {
    return this.Controllers.PurchasesHistory.getPurchasesByStore(this.Id);
  }
  async BasketDTOToFullBasketDTO(basket: BasketDTO): Promise<FullBasketDTO> {
    const storeId = basket.storeId;
    const productsPromises = basket.products.map((product) =>
      this.BasketProductDTOToProductWithQuantityDTO(product)
    );
    const products = await Promise.all(productsPromises);
    return {
      storeId: storeId,
      products: products,
    };
  }
  async BasketProductDTOToProductWithQuantityDTO(
    basketProduct: BasketProductDTO
  ): Promise<ProductWithQuantityDTO> {
    const p = await this.Repos.Products.getProductById(
      basketProduct.storeProductId
    );
    p.initControllers(this.Controllers).initRepos(this.Repos);
    return {
      product: await p.getDTO(),
      Discount: 0,
      BasketQuantity: basketProduct.quantity,
    };
  }
  public async addDiscount(discount: DiscountArgs) {
    const Id = await this.Repos.Stores.addDiscount(this.Id, discount);
    this.discountPolicy.addDiscount(discount, Id);
    return Id;
  }
  public async removeDiscount(discountId: string) {
    this.discountPolicy.removeDiscount(discountId);
    return await this.Repos.Stores.removeDiscount(discountId);
  }
  public async addConstraint(args: ConditionArgs) {
    const Id = await this.Repos.Stores.addConstraint(this.Id, args);
    this.constraintPolicy.addConstraint(args, Id);
    return Id;
  }
  public async removeConstraint(constraintId: string) {
    await this.Repos.Stores.removeConstraint(constraintId);
    this.constraintPolicy.removeConstraint(constraintId);
  }
  public get ConstraintPolicy() {
    return this.constraintPolicy;
  }
  public set ConstraintPolicy(policy: ConstraintPolicy) {
    this.constraintPolicy = policy;
  }
  public get DiscountPolicy() {
    return this.discountPolicy;
  }
  public set DiscountPolicy(policy: DiscountPolicy) {
    this.discountPolicy = policy;
  }
  private createCartDTOfromBasket(basket: BasketDTO, StoreId: string): CartDTO {
    const storeIdToBasket: Map<string, BasketDTO> = new Map();
    storeIdToBasket.set(StoreId, basket);
    return {
      storeIdToBasket: storeIdToBasket,
    };
  }
}
