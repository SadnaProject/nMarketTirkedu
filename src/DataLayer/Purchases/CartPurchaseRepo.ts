import { CartPurchaseDTO } from "~/DomainLayer/PurchasesHistory/CartPurchase";


export class CartPurchaseRepo{
    private CartPurchase : CartPurchaseDTO[];
    
    constructor(){  
        this.CartPurchase = [];
    }
    public addCartPurchase(CartPurchase : CartPurchaseDTO){
        this.CartPurchase.push(CartPurchase);
    }
    
    public getPurchasesByUser(userId: string): CartPurchaseDTO[] {
        return this.CartPurchase.filter((purchase) => purchase.userId === userId);
    }
    public getPurchaseById(purchaseId: string): CartPurchaseDTO | undefined {
        return this.CartPurchase.find((purchase) => purchase.purchaseId === purchaseId);
    }
    
    
}