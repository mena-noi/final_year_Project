import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import {
  loginStudent,
  loginLecturer,
  loginDepartmentHead,
  registerStudent,
  ApiError
} from '../api/api';

export type LoginResult = { ok: true; role: User['role'] } | { ok: false; error?: string };

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  adminLogin: (email: string, password: string, role?: 'lecturer' | 'department_head') => Promise<LoginResult>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    batchYear: string | number;
    department: string;
  }) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
  isHead: boolean;
  isLecturer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readUserFromStorage(): User | null {
  try {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser) as User;
    return parsed?.role ? parsed : null;
  } catch {
    return null;
  }
}

const buildUser = (userData: any, defaultRole: User['role']): User => ({
  id: String(userData._id ?? userData.id ?? ''),
  name: userData.name || '',
  email: userData.email || '',
  department: userData.department || 'General',
  role: defaultRole
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(readUserFromStorage);

  const saveUserSession = (user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const attempts = [
      { fn: loginStudent, role: 'student' as User['role'] },
      { fn: loginLecturer, role: 'lecturer' as User['role'] },
      { fn: loginDepartmentHead, role: 'department_head' as User['role'] }
    ];

    for (const attempt of attempts) {
      try {
        const response = await attempt.fn(normalizedEmail, normalizedPassword);
        const userData = response.user || response.student || response.lecturer;
        if (!userData || !response.token) {
          return { ok: false, error: 'Invalid authentication response' };
        }
        const user = buildUser(userData, attempt.role);
        saveUserSession(user, response.token);
        return { ok: true, role: user.role };
      } catch (error: unknown) {
        const apiError = error instanceof ApiError ? error : null;
        if (apiError && apiError.status === 401) {
          continue;
        }
        return { ok: false, error: apiError?.message || (error instanceof Error ? error.message : 'Login failed') };
      }
    }

    return { ok: false, error: 'Invalid email or password' };
  };

  const adminLogin = async (email: string, password: string, role?: 'lecturer' | 'department_head'): Promise<LoginResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    const allAttempts = [
      { fn: loginLecturer, role: 'lecturer' as User['role'] },
      { fn: loginDepartmentHead, role: 'department_head' as User['role'] }
    ];

    const attempts = role 
      ? allAttempts.filter(a => a.role === role)
      : allAttempts;

    for (const attempt of attempts) {
      try {
        const response = await attempt.fn(normalizedEmail, normalizedPassword);
        const userData = response.user || response.student || response.lecturer;
        if (!userData || !response.token) {
          return { ok: false, error: 'Invalid authentication response' };
        }
        const user = buildUser(userData, attempt.role);
        saveUserSession(user, response.token);
        return { ok: true, role: user.role };
      } catch (error: unknown) {
        const apiError = error instanceof ApiError ? error : null;
        if (apiError && apiError.status === 401 && !role) {
          continue;
        }
        return { ok: false, error: apiError?.message || (error instanceof Error ? error.message : 'Login failed') };
      }
    }

    return { ok: false, error: 'Invalid email or password' };
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    batchYear: string | number;
    department: string;
  }): Promise<LoginResult> => {
    try {
      const response = await registerStudent(payload);
      const studentData = response.student;
      if (!studentData || !response.token) {
        return { ok: false, error: 'Registration failed' };
      }
      const user = buildUser(studentData, 'student');
      saveUserSession(user, response.token);
      return { ok: true, role: 'student' };
    } catch (error: unknown) {
      const apiError = error instanceof ApiError ? error : null;
      return { ok: false, error: apiError?.message || (error instanceof Error ? error.message : 'Registration failed') };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!currentUser;
  const isHead = isAuthenticated && currentUser?.role === 'department_head';
  const isLecturer = isAuthenticated && currentUser?.role === 'lecturer';

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      adminLogin,
      register,
      logout,
      isAuthenticated,
      isHead,
      isLecturer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
