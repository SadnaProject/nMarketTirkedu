import { StoreController } from "./Store/StoreController";
import { AuthController } from "./Auth/AuthController";
import { type Controllers } from "./Controller";
import { JobController } from "./Job/JobController";
import { PurchaseController } from "./Purchase/PurchaseController";
import { UserController } from "./User/UserController";

export class MarketFacade {
  private controllers: Controllers;

  constructor() {
    const storeController = new StoreController();
    const authController = new AuthController();
    const jobsController = new JobController();
    const purchasesHistoryController = new PurchaseController();
    const usersController = new UserController();

    this.controllers = {
      Stores: storeController,
      Auth: authController,
      Jobs: jobsController,
      PurchasesHistory: purchasesHistoryController,
      Users: usersController,
    };

    storeController.initControllers(this.controllers);
    authController.initControllers(this.controllers);
    jobsController.initControllers(this.controllers);
    purchasesHistoryController.initControllers(this.controllers);
    usersController.initControllers(this.controllers);
  }
  private isConnectionValid(userId: string): void {
    if (!this.controllers.Auth.isConnected(userId))
      throw new Error("User is not logged in");
  }
  //Checking if user is logged in is done here.
  public addProductToCart(userId: string, productId: number, quantity: number) {
    this.isConnectionValid(userId);
    //...
  }
}
