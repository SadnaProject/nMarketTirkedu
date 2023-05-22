import { Observer } from "@trpc/server/observable";
import EventEmitter from "events";

export class EventManager{
    private eventEmitter : EventEmitter;
    private users : Map<string, (msg:unknown)=>void>;
    private usersToEvent : Map<string, string[]>;

    constructor(){
        this.eventEmitter = new EventEmitter();
        this.users = new Map<string, (msg:unknown)=>void>();
        this.usersToEvent = new Map<string, string[]>();
    }
    public subscribeToEvent(event: string, userId: string): void{
        const observer = this.users.get(userId);
        if(!observer){
            return;
        }
        this.eventEmitter.on(event, observer);
        this.usersToEvent.set(userId, [...(this.usersToEvent.get(userId) || []), event]);
    }
    public unsubscribeFromEvent(event: string, userId: string): void{
        const observer = this.users.get(userId);
        if(!observer){
            return;
        }
        this.eventEmitter.off(event, observer);
        this.usersToEvent.set(userId, this.usersToEvent.get(userId)?.filter((e)=>e!==event) || []);
    }
    public emitEvent(event: string): void{
        this.eventEmitter.emit(event);
    }
    public subscribeToEmitter(userId: string, callback:(msg:unknown)=>void): void{
        this.users.set(userId,callback);
    }
    public unsubscribeFromEmitter(userId: string): void{
        const observer = this.users.get(userId);
        if(!observer){
            return;
        }
        this.usersToEvent.get(userId)?.forEach((event)=>this.eventEmitter.off(event, observer));
        this.users.delete(userId);
        this.usersToEvent.delete(userId);
    }
}