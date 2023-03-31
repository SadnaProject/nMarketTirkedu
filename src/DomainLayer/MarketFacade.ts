import { StoreController } from "./Store/StoreController";
import { AuthController, IAuthController } from "./Auth/AuthController";

export class MarketFacade {
  private storeController: StoreController;
  private authController: IAuthController;

  constructor() {
    this.storeController = new StoreController();
    this.authController = new AuthController();
  }
  private isConnectionValid(userId: string): void {
    if(!this.authController.isConnected(userId))
      throw new Error("User is not logged in");
  }
  //Checking if user is logged in is done here.
  public addProductToCart(userId: string,productId: number, quantity: number) {
    this.isConnectionValid(userId);
    //...
  }
  


}
