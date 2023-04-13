import { Testable, testable } from "~/Testable";
import type { UserAuthDTO, UserType } from "../../DomainLayer/Auth/UserAuth";

@testable
export class UserRepo extends Testable {
    private users: UserAuthDTO[];
    constructor() {
        super();
        this.users = [];
    }
    public addUser(user: UserAuthDTO): void {
        this.users.push(user);
    }
    public getUserByEmail(email: string): UserAuthDTO | undefined {
        return this.users.find((user) => user.email === email);
    }
    public getUserById(userId: string): UserAuthDTO | undefined {
        return this.users.find((user) => user.userId === userId);
    }
    public deleteUser(userId: string): void {
        this.users = this.users.filter((user) => user.userId !== userId);
    }
    public getAllUsers(): UserAuthDTO[] {
        return this.users;
    }
    //Not sure its the responsibility of the repo to filter by type
    public getAllUsersByType(type: UserType): UserAuthDTO[] {
        return this.users.filter((user) => user.type === type);
    }
    public getAllUserEmails(): string[] {
        return this.users.map((user) => user.email);
    }


    

}
