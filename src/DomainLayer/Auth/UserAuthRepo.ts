import { Testable, testable } from "~/Testable";
import type { MemberUserAuth } from "./MemberUserAuth";
import type { GuestUserAuth } from "./GuestUserAuth";

@testable
export class UserAuthRepo extends Testable {
    private members: MemberUserAuth[];
    private guests: GuestUserAuth[];
    
    constructor() {
        super();
        this.members = [];
        this.guests = [];
    }
    //member related methods
    public addMember(user: MemberUserAuth): void {
        this.members.push(user);
    }    
    public getMemberByEmail(email: string): MemberUserAuth | undefined {
        return this.members.find((user) => user.Email === email);
    }
    public getMemberById(userId: string): MemberUserAuth | undefined {
        return this.members.find((user) => user.UserId === userId);
    }
    public removeMember(userId: string): void {
        this.members = this.members.filter((user) => user.UserId !== userId);
    }
    public getAllMembers(): MemberUserAuth[] {
        return this.members;
    }
    public getAllMemberEmails(): string[] {
        return this.members.map((user) => user.Email);
    }
    //guest related methods
    public addGuest(user: GuestUserAuth): void {
        this.guests.push(user);
    }
    public getGuestById(userId: string): GuestUserAuth | undefined {
        return this.guests.find((user) => user.UserId === userId);
    }
    public removeGuest(userId: string): void {
        this.guests = this.guests.filter((user) => user.UserId !== userId);
    }
    //This is of course only the connected guests 
    public getAllGuests(): GuestUserAuth[] {
        return this.guests;
    }
}
