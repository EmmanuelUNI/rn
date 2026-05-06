export interface AuthRemoteDataSource {
  login(email: string, password: string): Promise<{ rol: string; name: string }>;
  signUp(email: string, password: string, name: string): Promise<void>;
  verifyEmail(email: string, code: string): Promise<void>;
  logOut(): Promise<void>;
  verifyToken(): Promise<boolean>;
  refreshToken(): Promise<boolean>;
  getLoggedUser(email: string, token: string): Promise<{ userId: string; name: string; rol: string } | null>;
  getToken(): Promise<string | null>;
}