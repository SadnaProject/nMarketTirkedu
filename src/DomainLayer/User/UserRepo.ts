import { User, UserDTO } from "./User";
export class UserRepo {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  public addUser(user: UserDTO): void {
    if (this.users.has(user.id)) {
      throw new Error("User already exists");
    }
    this.users.set(user.id, new User(user));
  }

  public getUser(id: string): User {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  public getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  public removeUser(id: string): void {
    if (!this.users.has(id)) {
        throw new Error("User not found");
    }
    this.users.delete(id);
  }
}