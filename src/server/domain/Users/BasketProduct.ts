export type BasketProductDTO = {
  storeProductId: string;
  quantity: number;
  //new
  storeId: string;
  userId: string;
};
export class BasketProduct {
  private storeProductId: string;
  private quantity: number;
  //new
  private storeId: string;
  private userId: string;

  constructor(
    storeProductId: string,
    quantity: number,
    storeId: string,
    userId: string
  ) {
    this.storeProductId = storeProductId;
    this.quantity = quantity;
    this.storeId = storeId;
    this.userId = userId;
  }
  public get DTO(): BasketProductDTO {
    return {
      storeProductId: this.storeProductId,
      quantity: this.quantity,
      storeId: this.storeId,
      userId: this.userId,
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
  static createFromDTO(dto: BasketProductDTO): BasketProduct {
    return new BasketProduct(
      dto.storeProductId,
      dto.quantity,
      dto.storeId,
      dto.userId
    );
  }
}
