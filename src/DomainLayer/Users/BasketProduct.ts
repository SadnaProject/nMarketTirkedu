export type BasketProductDTO = {
  storeProductId: string;
  quantity: number;
};
export class BasketProduct {
  private storeProductId: string;
  private quantity: number;

  constructor(storeProductId: string, quantity: number) {
    this.storeProductId = storeProductId;
    this.quantity = quantity;
  }
  public get DTO(): BasketProductDTO {
    return {
      storeProductId: this.storeProductId,
      quantity: this.quantity,
    };
  }

  public get ProductId(): string {
    return this.storeProductId;
  }
  public get Quantity(): number {
    return this.quantity;
  }
  public set Quantity(quantity: number) {
    this.quantity = quantity;
  }
  public toString(): string {
    return `Product id: ${this.ProductId} Quantity: ${this.quantity}. \n`;
  }
}
