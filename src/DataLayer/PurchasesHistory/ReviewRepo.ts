import { ReviewDTO } from "~/DomainLayer/PurchasesHistory/Review";


export class ReviewRepo{
    private Reviews : ReviewDTO[];

    constructor(){
        this.Reviews = [];
    }
    public Review(ProductReview : ReviewDTO){
        this.Reviews.push(ProductReview);
    }

}