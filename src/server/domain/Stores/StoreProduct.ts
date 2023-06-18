import { randomUUID } from "crypto";
import { z } from "zod";
import { HasRepos, type Repos } from "./helpers/_HasRepos";
import { TRPCError } from "@trpc/server";
import { type Controllers, HasControllers } from "../helpers/_HasController";
import { Mixin } from "ts-mixer";
import { type StoreProduct as StoreProductDAO } from "@prisma/client";
import { Store } from "./Store";
import { getDB } from "server/helpers/_Transactional";

const nameSchema = z.string().nonempty("Name must be nonempty");
const quantitySchema = z
  .number()
  .nonnegative("Quantity must be non negative")
  .max(1000000, "Quantity must be less than 1,000,000");
const priceSchema = z
  .number()
  .positive("Price must be positive")
  .max(1000000, "Price must be less than 1,000,000");
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
  rating: z.number().min(0).max(5),
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
  static fromDAO(product: StoreProductDAO, SpecialPrices: Map<string, number>) {
    const realProduct = new StoreProduct({
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      category: product.category,
      description: product.description,
    });
    realProduct.id = product.id;
    realProduct.specialPrices = SpecialPrices;
    return realProduct;
  }

  static async fromProductId(
    productId: string,
    repos: Repos,
    controllers: Controllers
  ) {
    const product = StoreProduct.fromDAO(
      await repos.Products.getProductById(productId),
      await repos.Products.getSpecialPrices(productId)
    );
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
    return Store.fromDAO(
      await this.Repos.Stores.getStoreById(storeId),
      await this.Repos.Stores.getDiscounts(storeId),
      await this.Repos.Stores.getConstraints(storeId)
    )
      .initControllers(this.Controllers)
      .initRepos(this.Repos);
  }
  public get SpecialPrices() {
    return this.specialPrices;
  }
  public async setSpecialPrices(specialPrices: Map<string, number>) {
    this.specialPrices = specialPrices;
    await this.Repos.Products.setSpecialPrices(specialPrices, this.Id);
  }

  public async getDTO(): Promise<StoreProductDTO> {
    return {
      id: this.Id,
      name: this.Name,
      quantity: this.Quantity,
      price: this.Price,
      category: this.Category,
      description: this.Description,
      rating: (
        await this.Controllers.PurchasesHistory.getReviewsByProduct(this.Id)
      ).avgRating,
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
    if (quantity < 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Quantity can't be negative",
      });
    }
    return this.Quantity >= quantity;
  }

  public getPriceByQuantity(quantity: number): number {
    return this.Price * quantity;
  }

  public async delete() {
    await this.Repos.Products.deleteProduct(this.Id);
    //might delete it
    await getDB().basketProduct.deleteMany({
      where: { storeProductId: this.id },
    });
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
  public async getPriceForUser(userId: string): Promise<number> {
    const p = await this.Repos.Products.getSpecialPrice(userId, this.Id); //TODO:@ilaytzarfati1231 when the acceptance test "Get Purchase History by a buyer"(it: "✅ Applied by system admin") comes here, it fails with the error "Error: Repos are not initialized"(it happens in the line:  await service.purchaseCart(umid, cCard, d);)
    return p !== undefined ? p : this.Price;
  }
  public async getDAO(): Promise<StoreProductDAO> {
    return {
      category: this.Category,
      description: this.Description,
      id: this.Id,
      name: this.Name,
      price: this.Price,
      quantity: this.Quantity,
      storeId: (await this.getStore()).Id,
    };
  }
}
