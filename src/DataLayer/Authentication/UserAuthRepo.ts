import { Testable, testable } from "~/Testable";
import type { MemberUserAuthDTO } from "../../DomainLayer/Auth/MemberUserAuth";
import type { GuestUserAuthDTO } from "../../DomainLayer/Auth/GuestUserAuth";

@testable
export class UserAuthRepo extends Testable {
    private members: MemberUserAuthDTO[];
    private guests: GuestUserAuthDTO[];
    
    constructor() {
        super();
        this.members = [];
        this.guests = [];
    }
    //member related methods
    public addMember(user: MemberUserAuthDTO): void {
        this.members.push(user);
    }    
    public getMemberByEmail(email: string): MemberUserAuthDTO | undefined {
        return this.members.find((user) => user.email === email);
    }
    public getMemberById(userId: string): MemberUserAuthDTO | undefined {
        return this.members.find((user) => user.userId === userId);
    }
    public removeMember(userId: string): void {
        this.members = this.members.filter((user) => user.userId !== userId);
    }
    public getAllMembers(): MemberUserAuthDTO[] {
        return this.members;
    }
    public getAllMemberEmails(): string[] {
        return this.members.map((user) => user.email);
    }
    //guest related methods
    public addGuest(user: GuestUserAuthDTO): void {
        this.guests.push(user);
    }
    public getGuestById(userId: string): GuestUserAuthDTO | undefined {
        return this.guests.find((user) => user.userId === userId);
    }
    public removeGuest(userId: string): void {
        this.guests = this.guests.filter((user) => user.userId !== userId);
    }
    //This is of course only the connected guests 
    public getAllGuests(): GuestUserAuthDTO[] {
        return this.guests;
    }
}
