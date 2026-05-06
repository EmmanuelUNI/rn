import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { AuthUser } from '../../domain/entities/AuthUser';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { AuthRemoteDataSource } from '../datasources/AuthRemoteDataSource';

export class AuthRepositoryImpl implements AuthRepository {
  private readonly ds: AuthRemoteDataSource;
  private readonly prefs = LocalPreferencesAsyncStorage.getInstance();

  constructor(ds: AuthRemoteDataSource) {
    this.ds = ds;
  }

  async login(email: string, password: string): Promise<void> {
    await this.ds.login(email, password);
  }

  async signUp(email: string, password: string, name: string): Promise<void> {
    await this.ds.signUp(email, password, name);
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    await this.ds.verifyEmail(email, code);
  }

  async logout(): Promise<void> {
    await this.ds.logOut();
  }

  async verifyToken(): Promise<boolean> {
    return this.ds.verifyToken();
  }

  async getLoggedUser(email: string): Promise<AuthUser | null> {
    const token = await this.ds.getToken();
    if (!token) return null;
    const data = await this.ds.getLoggedUser(email, token);
    if (!data) return null;
    return {
      userId: data.userId,
      email,
      name: data.name,
      isTeacher: data.rol === 'profesor',
    };
  }
}