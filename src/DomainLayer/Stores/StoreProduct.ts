import { randomUUID } from "crypto";
import { z } from "zod";
import { HasRepos, type Repos } from "./HasRepos";
import { Store } from "./Store";

const nameSchema = z.string().nonempty();
const quantitySchema = z.number().positive();
const priceSchema = z.number().positive();
const categorySchema = z.string().nonempty();

const storeProductArgsSchema = z.object({
  name: nameSchema,
  quantity: quantitySchema,
  price: priceSchema,
  category: categorySchema,
});

export type StoreProductArgs = z.infer<typeof storeProductArgsSchema>;

export type StoreProductDTO = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
};

export class StoreProduct extends HasRepos {
  private id: string;
  private name: string;
  private quantity: number;
  private price: number;
  private category: string;

  constructor(product: StoreProductArgs) {
    super();
    storeProductArgsSchema.parse(product);
    this.id = randomUUID();
    this.name = product.name;
    this.quantity = product.quantity;
    this.price = product.price;
    this.category = product.category;
  }

  static fromDTO(dto: StoreProductDTO, repos: Repos) {
    const product = new StoreProduct(dto).initRepos(repos);
    product.id = dto.id;
    return product;
  }

  static fromProductId(productId: string, repos: Repos) {
    const dto = repos.Products.getProductById(productId);
    return this.fromDTO(dto, repos);
  }

  public get Id() {
    return this.id;
  }

  public get Name() {
    return this.name;
  }

  public get Quantity() {
    return this.quantity;
  }

  public set Quantity(quantity: number) {
    quantitySchema.parse(quantity);
    this.quantity = quantity;
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

  public get Store() {
    const storeId = this.Repos.Products.getStoreIdByProductId(this.id);
    const dto = this.Repos.Stores.getStoreById(storeId);
    return Store.fromDTO(dto, this.Repos);
  }

  public get DTO(): StoreProductDTO {
    return {
      id: this.id,
      name: this.name,
      quantity: this.quantity,
      price: this.price,
      category: this.category,
    };
  }

  public isQuantityInStock(quantity: number): boolean {
    if (!this.Store.IsActive) {
      throw new Error("Store is not active");
    }
    return this.quantity >= quantity;
  }

  public getPriceByQuantity(quantity: number): number {
    return this.price * quantity;
  }
}
