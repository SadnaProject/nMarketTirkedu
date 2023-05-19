import { randomUUID } from "crypto";
import { z } from "zod";
import { HasRepos, type Repos } from "./_HasRepos";
import { TRPCError } from "@trpc/server";
import * as R from "ramda";
import { Controllers, HasControllers } from "../_HasController";
import { Mixin } from "ts-mixer";
import { s } from "vitest/dist/env-afee91f0";
const nameSchema = z.string().nonempty("Name must be nonempty");
const quantitySchema = z.number().nonnegative("Quantity must be non negative");
const priceSchema = z.number().positive("Price must be positive");
const categorySchema = z.string().nonempty("Category must be nonempty");
const descriptionSchema = z.string().nonempty("Description must be nonempty");

export const storeProductArgsSchema = z.object({
  name: nameSchema,
  quantity: quantitySchema,
  price: priceSchema,
  category: categorySchema,
  description: descriptionSchema,
});

export type StoreProductArgs = z.infer<typeof storeProductArgsSchema>;

export const StoreProductDTOSchema = z.object({
  id: z.string().uuid(),
  name: nameSchema,
  quantity: quantitySchema,
  price: priceSchema,
  category: categorySchema,
  description: descriptionSchema,
  rating: z.number().nonnegative(),
});

export type StoreProductDTO = z.infer<typeof StoreProductDTOSchema>;

export class StoreProduct extends Mixin(HasRepos, HasControllers) {
  private id: string;
  private name: string;
  private quantity: number;
  private price: number;
  private category: string;
  private description: string;
  private specialPrices: Map<string, number> = new Map();
  constructor(product: StoreProductArgs) {
    super();
    storeProductArgsSchema.parse(product);
    this.id = randomUUID();
    this.name = product.name;
    this.quantity = product.quantity;
    this.price = product.price;
    this.category = product.category;
    this.description = product.description;
  }

  static fromDTO(dto: StoreProductDTO, controllers: Controllers, repos: Repos) {
    const product = new StoreProduct(dto)
      .initControllers(controllers)
      .initRepos(repos);
    product.id = dto.id;
    return product;
  }

  static async fromProductId(
    productId: string,
    repos: Repos,
    controllers: Controllers
  ) {
    const product = await repos.Products.getProductById(productId);
    product.initRepos(repos).initControllers(controllers);
    return product;
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

  public async setName(name: string) {
    nameSchema.parse(name);
    this.name = name;
    await this.Repos.Products.setField(this.Id, "name", name);
  }

  public get Quantity() {
    return this.quantity;
  }

  public async setQuantity(quantity: number) {
    quantitySchema.parse(quantity);
    this.quantity = quantity;
    await this.Repos.Products.setField(this.Id, "quantity", quantity);
  }

  public async decreaseQuantity(quantity: number) {
    const flag = await this.isQuantityInStock(quantity);
    if (!flag) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Not enough quantity in stock",
      });
    }
    await this.setQuantity(this.Quantity - quantity);
  }

  public get Price() {
    return this.price;
  }

  public async setPrice(price: number) {
    priceSchema.parse(price);
    this.price = price;
    await this.Repos.Products.setField(this.Id, "price", price);
  }

  public get Category() {
    return this.category;
  }

  public async setCategory(category: string) {
    categorySchema.parse(category);
    this.category = category;
    await this.Repos.Products.setField(this.Id, "category", category);
  }

  public get Description() {
    return this.description;
  }

  public async setDescription(description: string) {
    descriptionSchema.parse(description);
    this.description = description;
    await this.Repos.Products.setField(this.Id, "description", description);
  }

  public async getStore() {
    const storeId = await this.Repos.Products.getStoreIdByProductId(this.Id);
    return (await this.Repos.Stores.getStoreById(storeId))
      .initControllers(this.Controllers)
      .initRepos(this.Repos);
  }
  public get SpecialPrices() {
    return this.specialPrices;
  }
  public set SpecialPrices(specialPrices: Map<string, number>) {
    this.specialPrices = specialPrices;
  }

  public getDTO(): StoreProductDTO {
    return {
      id: this.Id,
      name: this.Name,
      quantity: this.Quantity,
      price: this.Price,
      category: this.Category,
      description: this.Description,
      rating: this.Controllers.PurchasesHistory.getReviewsByProduct(this.Id)
        .avgRating,
    };
  }

  public async isQuantityInStock(quantity: number): Promise<boolean> {
    const store = await this.getStore();
    if (!store.IsActive()) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Store is not active",
      });
    }
    if (quantity <= 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Quantity must be positive",
      });
    }
    return this.Quantity >= quantity;
  }

  public getPriceByQuantity(quantity: number): number {
    return this.Price * quantity;
  }

  public async delete() {
    await this.Repos.Products.deleteProduct(this.Id);
  }

  public static getAll(repos: Repos) {
    return repos.Products.getAllProducts();
  }

  public static getActive(repos: Repos) {
    return repos.Products.getActiveProducts();
  }

  public async addSpecialPrice(userId: string, price: number) {
    await this.Repos.Products.addSpecialPrice(userId, this.Id, price);
    this.SpecialPrices.set(userId, price);
  }
  public getPriceForUser(userId: string): number {
    const p = this.SpecialPrices.get(userId);
    return p !== undefined ? p : this.Price;
  }
}
