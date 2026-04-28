// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/authService';
import StorageService from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const valid = await AuthService.verifyToken();
      if (valid) {
        const name = await StorageService.get('name');
        const rol = await StorageService.get('rol');
        await AuthService.getLoggedUser();
        setUserName(name || '');
        setIsTeacher(rol === 'profesor');
        setIsLogged(true);
      }
    } catch {}
    setIsLoading(false);
  }

  async function login(email, password) {
    await AuthService.login(email, password);
    await AuthService.getLoggedUser();
    const name = await StorageService.get('name');
    const rol = await StorageService.get('rol');
    setUserName(name || '');
    setIsTeacher(rol === 'profesor');
    setIsLogged(true);
  }

  async function signUp(name, email, password) {
    await AuthService.signUp(email, password, name);
    setUserEmail(email);
    setUserPassword(password);
    setUserName(name);
    setIsValidating(true);
  }

  async function verifyAccount(email, code, password, name) {
    await AuthService.verifyEmail(email, code);
    await AuthService.login(email, password);
    await AuthService.getLoggedUser();
    const storedName = await StorageService.get('name');
    const rol = await StorageService.get('rol');
    setUserName(storedName || name);
    setIsTeacher(rol === 'profesor');
    setIsValidating(false);
    setIsSigningUp(false);
    setIsLogged(true);
  }

  async function logout() {
    await AuthService.logout();
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
  return useContext(AuthContext);
}