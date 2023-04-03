import { StoreController,IStoreController } from "./Store/StoreController";
import { AuthController, IAuthController } from "./Auth/AuthController";
import { IUserController,UserController } from "./User/UserController";
export class MarketFacade {
  private storeController: IStoreController;
  private authController: IAuthController;
  private userController: IUserController;

  constructor() {
    this.storeController = new StoreController();
    this.authController = new AuthController();
    this.userController = new UserController();
  }
  private isConnectionValid(userId: string): void {
    if(!this.authController.isConnected(userId))
      throw new Error("User is not logged in");
  }
  //Checking if user is logged in is done here.
  public addProductToCart(userId: string,productId: string, quantity: number) {
    this.isConnectionValid(userId);
    const storeId = this.storeController.checkProductAvailability(productId, quantity);
    if(storeId==="")
      throw new Error("Product is not available");
    this.userController.addProductToCart(userId, productId, quantity,storeId);

  }
  


}
