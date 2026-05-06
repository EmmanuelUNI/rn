import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { AuthRepository } from '../../domain/repositories/AuthRepository';

export type AuthContextType = {
  isLoading: boolean;
  isLogged: boolean;
  isSigningUp: boolean;
  isValidating: boolean;
  userName: string;
  userEmail: string;
  userPassword: string;
  isTeacher: boolean;
  error: string | null;
  clearError: () => void;
  setIsSigningUp: (v: boolean) => void;
  setIsValidating: (v: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  verifyAccount: (email: string, code: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const authRepo = useMemo(() => di.resolve<AuthRepository>(TOKENS.AuthRepo), [di]);
  const prefs = LocalPreferencesAsyncStorage.getInstance();

  const [isLoading, setIsLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const valid = await authRepo.verifyToken();
      if (valid) {
        const email = await prefs.retrieveData<string>('email');
        if (email) {
          const user = await authRepo.getLoggedUser(email);
          if (user) {
            setUserName(user.name);
            setIsTeacher(user.isTeacher);
            setIsLogged(true);
          }
        }
      }
    } catch {}
    setIsLoading(false);
  }

  async function login(email: string, password: string) {
    try {
      clearError();
      await authRepo.login(email, password);
      const user = await authRepo.getLoggedUser(email);
      setUserName(user?.name ?? '');
      setIsTeacher(user?.isTeacher ?? false);
      setIsLogged(true);
    } catch (e: any) {
      setError(e.message ?? 'Error al iniciar sesión');
      throw e;
    }
  }

  async function signUp(name: string, email: string, password: string) {
    try {
      clearError();
      await authRepo.signUp(email, password, name);
      setUserEmail(email);
      setUserPassword(password);
      setUserName(name);
      setIsValidating(true);
    } catch (e: any) {
      setError(e.message ?? 'Error al registrarse');
      throw e;
    }
  }

  async function verifyAccount(
    email: string,
    code: string,
    password: string,
    name: string,
  ) {
    try {
      clearError();
      await authRepo.verifyEmail(email, code);
      await authRepo.login(email, password);
      const user = await authRepo.getLoggedUser(email);
      setUserName(user?.name ?? name);
      setIsTeacher(user?.isTeacher ?? false);
      setIsValidating(false);
      setIsSigningUp(false);
      setIsLogged(true);
    } catch (e: any) {
      setError(e.message ?? 'Código inválido');
      throw e;
    }
  }

  async function logout() {
    try {
      await authRepo.logout();
    } catch {}
    setIsLogged(false);
    setIsSigningUp(false);
    setIsValidating(false);
    setUserName('');
    setIsTeacher(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isLogged,
        isSigningUp,
        isValidating,
        userName,
        userEmail,
        userPassword,
        isTeacher,
        error,
        clearError,
        setIsSigningUp,
        setIsValidating,
        login,
        signUp,
        verifyAccount,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}