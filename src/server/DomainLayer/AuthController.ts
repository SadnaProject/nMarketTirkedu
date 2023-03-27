type Role = "GUEST" | "MEMBER";

interface IAuthController {
  isGuest(userId: string): boolean;
  isMember(userId: string): boolean;
  isConnected(userId: string): boolean;
  login(email: string, password: string): string;
  logout(userId: string): void;
  register(email: string, password: string): void;
  changeEmail(userId: string, newEmail: string): void;
  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): void;
}

export class AuthController implements IAuthController {
  login(email: string, password: string): string {
    throw new Error("Method not implemented.");
  }
  logout(userId: string): void {
    throw new Error("Method not implemented.");
  }
  register(email: string, password: string): void {
    throw new Error("Method not implemented.");
  }
  changeEmail(userId: string, newEmail: string): boolean {
    throw new Error("Method not implemented.");
  }
  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): boolean {
    throw new Error("Method not implemented.");
  }
  isGuest(userId: string): boolean {
    throw new Error("Method not implemented.");
  }
  isMember(userId: string): boolean {
    throw new Error("Method not implemented.");
  }
  isConnected(userId: string): boolean {
    throw new Error("Method not implemented.");
  }
}
