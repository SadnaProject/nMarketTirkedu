import { StoreController } from "./Store/StoreController";

export class MarketFacade {
  private storeController: StoreController;

  constructor() {
    this.storeController = new StoreController();
  }
}
