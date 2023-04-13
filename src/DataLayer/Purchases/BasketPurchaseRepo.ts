
import { BasketPurchaseDTO } from "~/DomainLayer/PurchasesHistory/BasketPurchase";
import { ProductPurchaseDTO } from "~/DomainLayer/PurchasesHistory/ProductPurchase";

export class BasketPurchaseRepo{
    private BasketPurchases : BasketPurchaseDTO[];
    
    constructor(){
        this.BasketPurchases = [];
    }
    public addBasketPurchase(BasketPurchase : BasketPurchaseDTO){
        this.BasketPurchases.push(BasketPurchase);
    }
    
    public getPurchasesByStore(storeId: string): BasketPurchaseDTO[] {
        return this.BasketPurchases.filter((purchase) => purchase.storeId === storeId);
    }    
    public getPurchaseById(purchaseId: string): BasketPurchaseDTO | undefined {
        return this.BasketPurchases.find((purchase) => purchase.purchaseId === purchaseId);
    }
}