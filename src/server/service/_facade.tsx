import { MarketFacade } from "server/domain/MarketFacade";

const globalForFacade = global as unknown as {
  facade: MarketFacade;
};

export const facade = globalForFacade.facade ?? new MarketFacade();
globalForFacade.facade = facade;
