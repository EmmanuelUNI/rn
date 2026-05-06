import { AuthUser } from '../entities/AuthUser';

export interface AuthRepository {
  login(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, name: string): Promise<void>;
  verifyEmail(email: string, code: string): Promise<void>;
  logout(): Promise<void>;
  verifyToken(): Promise<boolean>;
  getLoggedUser(email: string): Promise<AuthUser | null>;
}