import { type BasketProductDTO, BasketProduct } from "./BasketProduct";
import { UsersController } from "./UsersController";
export type BasketDTO = {
  storeId: string;
  products: BasketProductDTO[];
};
export class Basket {
  private storeId: string;
  private products: BasketProduct[];

  constructor(storeId: string) {
    this.storeId = storeId;
    this.products = [];
  }
  // add product to the basket, notice that we override the quantity if the product already exists in the basket,
  // if the user wants to add he needs to use the edit product quantity method
  public addProduct(productId: string, quantity: number): void {
    if(quantity < 0){
      throw new Error("Quantity cannot be negative");
    }
    const product = this.products.find((p) => p.ProductId === productId);
    if (product === undefined) {
      const new_product = new BasketProduct(productId, quantity);
      this.products.push(new_product);
    } else {
      product.Quantity = quantity;
    }  
  }
  public removeProduct(productId: string): void {
    const product = this.products.find((p) => p.ProductId === productId);
    if (product === undefined) {
      throw new Error("Product not found");
    } else {
      this.products = this.products.filter((p) => p.ProductId !== productId);
    }  
  }
  public get DTO(): BasketDTO {
    const productsDTO = this.products.map((p) => p.DTO);
    return {
      storeId: this.storeId,
      products: productsDTO,
    };
  }
  public editProductQuantity(productId: string, quantity: number): void {
    if(quantity < 0){
      throw new Error("Quantity cannot be negative");
    }
    const product = this.products.find((p) => p.ProductId === productId);
    if (product === undefined) {
      throw new Error("Product not found");
    } else {
      if (quantity === 0) {
        this.products = this.products.filter((p) => p.ProductId !== productId);
      }else {
        product.Quantity = quantity;
    }
  }
  }
  public toString(): string {
    let str = "";
    this.products.forEach((p) => {
      str += p.toString() + " ";
    });
    return str;
  }
  

}
