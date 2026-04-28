// src/services/authService.js
import { AUTH_URL, DB_URL } from '../config/api';
import StorageService from './storageService';

const AuthService = {
  async login(email, password) {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.status !== 201) {
      const body = await response.json();
      throw new Error(body.message || 'Error al iniciar sesión');
    }

    const data = await response.json();
    await StorageService.set('token', data.accessToken);
    await StorageService.set('refreshToken', data.refreshToken);
    await StorageService.set('email', email);
    await StorageService.set('rol', data.user.role);
    await StorageService.set('name', data.user.name);
    return data;
  },

  async logout() {
    const token = await StorageService.get('token');
    try {
      await fetch(`${AUTH_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    await StorageService.clear();
  },

  async verifyToken() {
    const token = await StorageService.get('token');
    if (!token) return false;
    try {
      const response = await fetch(`${AUTH_URL}/verify-token`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.status === 200;
    } catch {
      return false;
    }
  },

  async refreshToken() {
    const refreshToken = await StorageService.get('refreshToken');
    if (!refreshToken) return false;
    try {
      const response = await fetch(`${AUTH_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (response.status === 201) {
        const data = await response.json();
        await StorageService.set('token', data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  async getLoggedUser() {
    const email = await StorageService.get('email');
    const token = await StorageService.get('token');
    if (!email || !token) return null;

    const response = await fetch(
      `${DB_URL}/read?tableName=Users&email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (response.status !== 200) return null;
    const users = await response.json();
    if (!users.length) return null;

    const user = users[0];
    await StorageService.set('userId', user.userId);
    return user;
  },

  async signUpDirect(email, password, name) {
    const response = await fetch(`${AUTH_URL}/signup-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (response.status !== 201) {
      const body = await response.json();
      throw new Error(body.message || 'Error al registrarse');
    }
  },

  async signUp(email, password, name) {
    const response = await fetch(`${AUTH_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (response.status !== 201) {
      const body = await response.json();
      throw new Error(body.message || 'Error al registrarse');
    }
  },

  async verifyEmail(email, code) {
    const response = await fetch(`${AUTH_URL}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    if (response.status !== 201) {
      const body = await response.json();
      throw new Error(body.message || 'Código inválido');
    }
  },

  async forgotPassword(email) {
    await fetch(`${AUTH_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  },
};

export default AuthService;