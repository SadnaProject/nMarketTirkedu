import { CartPurchaseDTO } from "~/DomainLayer/PurchasesHistory/CartPurchase";


export class CartPurchaseRepo{
    private CartPurchase : CartPurchaseDTO[];
    
    constructor(){  
        this.CartPurchase = [];
    }
    public addCartPurchase(CartPurchase : CartPurchaseDTO){
        this.CartPurchase.push(CartPurchase);
    }
    
    
    
}