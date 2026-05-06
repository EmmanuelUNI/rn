import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { ILocalPreferences } from '@/src/core/iLocalPreferences';
import { AUTH_URL, DB_URL } from '@/src/config/constants';
import { AuthRemoteDataSource } from './AuthRemoteDataSource';

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  private readonly prefs: ILocalPreferences;

  constructor() {
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async getToken(): Promise<string | null> {
    return this.prefs.retrieveData<string>('token');
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ rol: string; name: string }> {
    const res = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.status !== 201) {
      const body = await res.json();
      throw new Error(body.message ?? 'Error al iniciar sesión');
    }

    const data = await res.json();
    await this.prefs.storeData('token', data.accessToken);
    await this.prefs.storeData('refreshToken', data.refreshToken);
    await this.prefs.storeData('email', email);
    await this.prefs.storeData('rol', data.user?.role ?? '');
    await this.prefs.storeData('name', data.user?.name ?? '');
    return { rol: data.user?.role ?? '', name: data.user?.name ?? '' };
  }

  async signUp(email: string, password: string, name: string): Promise<void> {
    const res = await fetch(`${AUTH_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (res.status !== 201) {
      const body = await res.json();
      throw new Error(body.message ?? 'Error al registrarse');
    }
  }

  async verifyEmail(email: string, code: string): Promise<void> {
    const res = await fetch(`${AUTH_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    if (res.status !== 201) {
      const body = await res.json();
      throw new Error(body.message ?? 'Código inválido');
    }
  }

  async logOut(): Promise<void> {
    const token = await this.prefs.retrieveData<string>('token');
    try {
      await fetch(`${AUTH_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    await this.prefs.clearAll();
  }

  async verifyToken(): Promise<boolean> {
    const token = await this.prefs.retrieveData<string>('token');
    if (!token) return false;
    try {
      const res = await fetch(`${AUTH_URL}/verify-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.status === 200;
    } catch {
      return false;
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = await this.prefs.retrieveData<string>('refreshToken');
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${AUTH_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (res.status === 201) {
        const data = await res.json();
        await this.prefs.storeData('token', data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async getLoggedUser(
    email: string,
    token: string,
  ): Promise<{ userId: string; name: string; rol: string } | null> {
    const res = await fetch(
      `${DB_URL}/read?tableName=Users&email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (res.status !== 200) return null;
    const users = await res.json();
    if (!users.length) return null;
    const user = users[0];
    await this.prefs.storeData('userId', user.userId);
    return {
      userId: user.userId,
      name: user.name ?? '',
      rol: user.rol ?? '',
    };
  }
}