import { randomUUID } from "crypto";
import { z } from "zod";
import { HasRepos, type Repos } from "./_HasRepos";

const nameSchema = z.string().nonempty("Name must be nonempty");
const quantitySchema = z.number().positive("Quantity must be positive");
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
});

export type StoreProductDTO = z.infer<typeof StoreProductDTOSchema>;

export class StoreProduct extends HasRepos {
  private id: string;
  private name: string;
  private quantity: number;
  private price: number;
  private category: string;
  private description: string;

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

  static fromDTO(dto: StoreProductDTO, repos: Repos) {
    const product = new StoreProduct(dto).initRepos(repos);
    product.id = dto.id;
    return product;
  }

  static fromProductId(productId: string, repos: Repos) {
    return repos.Products.getProductById(productId);
  }

  public get Id() {
    return this.id;
  }

  public get Name() {
    return this.name;
  }

  public set Name(name: string) {
    nameSchema.parse(name);
    this.name = name;
  }

  public get Quantity() {
    return this.quantity;
  }

  public set Quantity(quantity: number) {
    quantitySchema.parse(quantity);
    this.quantity = quantity;
  }

  public decreaseQuantity(quantity: number) {
    if (!this.isQuantityInStock(quantity)) {
      throw new Error("Not enough quantity in stock");
    }
    this.Quantity -= quantity;
  }

  public get Price() {
    return this.price;
  }

  public set Price(price: number) {
    priceSchema.parse(price);
    this.price = price;
  }

  public get Category() {
    return this.category;
  }

  public set Category(category: string) {
    categorySchema.parse(category);
    this.category = category;
  }

  public get Description() {
    return this.description;
  }

  public set Description(description: string) {
    descriptionSchema.parse(description);
    this.description = description;
  }

  public get Store() {
    const storeId = this.Repos.Products.getStoreIdByProductId(this.Id);
    return this.Repos.Stores.getStoreById(storeId);
  }

  public get DTO(): StoreProductDTO {
    return {
      id: this.Id,
      name: this.Name,
      quantity: this.Quantity,
      price: this.Price,
      category: this.Category,
      description: this.Description,
    };
  }

  public isQuantityInStock(quantity: number): boolean {
    if (!this.Store.IsActive) {
      throw new Error("Store is not active");
    }
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }
    return this.Quantity >= quantity;
  }

  public getPriceByQuantity(quantity: number): number {
    return this.Price * quantity;
  }

  public delete() {
    this.Repos.Products.deleteProduct(this.Id);
  }

  public static getAll(repos: Repos) {
    return repos.Products.getAllProducts();
  }
}
