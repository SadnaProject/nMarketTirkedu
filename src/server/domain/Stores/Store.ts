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
import { CartDTO } from "../Users/Cart";

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
    nameSchema.parse(name);
    this.id = randomUUID();
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
      rating: this.Controllers.PurchasesHistory.getStoreRating(this.id),
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
  public getBasketPrice(userId: string, basketDTO: BasketDTO): number {
    let fullBasket = this.BasketDTOToFullBasketDTO(basketDTO);

    fullBasket = this.discountPolicy.applyDiscounts(fullBasket);
    let price = 0;
    fullBasket.products.forEach((product) => {
      let productPrice = product.product.price;
      if (product.product.specialPrices.has(userId)) {
        const possiblePrice = product.product.specialPrices.get(userId);
        if (possiblePrice) {
          productPrice = possiblePrice;
        }
      }
      price +=
        product.BasketQuantity * productPrice * (1 - product.Discount / 100);
    });
    return price;
  }

  public checkIfBasketFulfillsPolicy(basketDTO: BasketDTO): boolean {
    const fullBasket = this.BasketDTOToFullBasketDTO(basketDTO);
    return this.constraintPolicy.isSatisfiedBy(fullBasket);
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
  get Purchases() {
    return this.Controllers.PurchasesHistory.getPurchasesByStore(this.Id);
  }
  BasketDTOToFullBasketDTO(basket: BasketDTO): FullBasketDTO {
    return {
      storeId: this.Id,
      products: basket.products.map((p) =>
        this.BasketProductDTOToProductWithQuantityDTO(p)
      ),
    };
  }
  BasketProductDTOToProductWithQuantityDTO(
    basketProduct: BasketProductDTO
  ): ProductWithQuantityDTO {
    const p = this.Repos.Products.getProductById(basketProduct.storeProductId);
    return {
      product: p.DTO,
      Discount: 0,
      BasketQuantity: basketProduct.quantity,
    };
  }
  public addDiscount(discount: DiscountArgs) {
    return this.discountPolicy.addDiscount(discount);
  }
  public removeDiscount(discountId: string) {
    this.discountPolicy.removeDiscount(discountId);
  }
  public addConstraint(args: ConditionArgs) {
    return this.constraintPolicy.addConstraint(args);
  }
  public removeConstraint(constraintId: string) {
    this.constraintPolicy.removeConstraint(constraintId);
  }
  private createCartDTOfromBasket(basket: BasketDTO, StoreId: string): CartDTO {
    const storeIdToBasket: Map<string, BasketDTO> = new Map();
    storeIdToBasket.set(StoreId, basket);
    return {
      storeIdToBasket: storeIdToBasket,
    };
  }
}
