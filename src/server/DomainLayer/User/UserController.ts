interface IUserController {
  getNotifications(userId: string): never;
  addProductToCart(userId: string, productId: string, quantity: number): void;
  removeProductFromCart(userId: string, productId: string): void;
  editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ): void;
  getCart(userId: string): never;
  purchaseCart(userId: string): void;
}

export class UserController implements IUserController {
  getNotifications(userId: string): never {
    throw new Error("Method not implemented.");
  }
  addProductToCart(userId: string, productId: string, quantity: number): void {
    throw new Error("Method not implemented.");
  }
  removeProductFromCart(userId: string, productId: string): void {
    throw new Error("Method not implemented.");
  }
  editProductQuantityInCart(
    userId: string,
    productId: string,
    quantity: number
  ): void {
    throw new Error("Method not implemented.");
  }
  getCart(userId: string): never {
    throw new Error("Method not implemented.");
  }
  purchaseCart(userId: string): void {
    throw new Error("Method not implemented.");
  }
}
