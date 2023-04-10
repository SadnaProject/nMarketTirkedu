import { ProductReviewDTO } from "~/DomainLayer/PurchasesHistory/ProductReview";


export class ProductReviewRepo{
    private ProductReviews : ProductReviewDTO[];

    constructor(){
        this.ProductReviews = [];
    }
    public addProductReview(ProductReview : ProductReviewDTO){
        this.ProductReviews.push(ProductReview);
    }

}