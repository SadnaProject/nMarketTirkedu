import { type IAuthController } from "./Auth/AuthController";
import { type IJobController } from "./Job/JobController";
import { type IPurchaseController } from "./Purchase/PurchaseController";
import { type IStoreController } from "./Store/StoreController";
import { type IUserController } from "./User/UserController";

export type Controllers = {
  PurchasesHistory: IPurchaseController;
  Stores: IStoreController;
  Users: IUserController;
  Jobs: IJobController;
  Auth: IAuthController;
};

export class Controller {
  private controllers?: Controllers;

  public initControllers(controllers: Controllers) {
    this.controllers = controllers;
  }

  public get Controllers() {
    if (!this.controllers) {
      throw new Error("Controllers not initialized");
    }
    return this.controllers;
  }
}
