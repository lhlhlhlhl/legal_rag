"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 刷新 Access Token
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('刷新token失败');
      }

      const data = await response.json();
      const newAccessToken = data.accessToken;

      setAccessToken(newAccessToken);
      // 存储到 localStorage 以便跨标签页使用
      localStorage.setItem('accessToken', newAccessToken);

      return newAccessToken;
    } catch (error) {
      console.error('刷新token失败:', error);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      return null;
    }
  }, []);

  // 获取当前用户信息
  const fetchCurrentUser = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // 如果 access token 过期，尝试刷新
        if (response.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            // 用新token重试
            return fetchCurrentUser(newToken);
          }
        }
        throw new Error('获取用户信息失败');
      }

      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    }
  }, [refreshAccessToken]);

  // 登录
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      setAccessToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);

      router.push('/');
    } catch (error: any) {
      throw new Error(error.message || '登录失败');
    }
  };

  // 注册
  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '注册失败');
      }

      setAccessToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);

      router.push('/');
    } catch (error: any) {
      throw new Error(error.message || '注册失败');
    }
  };

  // 登出
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      router.push('/login');
    }
  };

  // 初始化：检查是否有有效的 token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('accessToken');

      if (storedToken) {
        setAccessToken(storedToken);
        await fetchCurrentUser(storedToken);
      } else {
        // 尝试使用 refresh token 获取新的 access token
        const newToken = await refreshAccessToken();
        if (newToken) {
          await fetchCurrentUser(newToken);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser, refreshAccessToken]);

  // 自动刷新 token（在过期前3分钟刷新）
  useEffect(() => {
    if (!accessToken) return;

    // 每12分钟刷新一次（access token 15分钟过期）
    const refreshInterval = setInterval(() => {
      refreshAccessToken();
    }, 12 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [accessToken, refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        register,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
