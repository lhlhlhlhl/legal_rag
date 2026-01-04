import jwt from 'jsonwebtoken';
// 引入 jsonwebtoken 库，作用是生成和验证 JWT 令牌
import { cookies } from 'next/headers';
// 引入 next/headers 库，作用是操作 HTTP 请求头中的 Cookie 字段

// JWT 配置
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret-key-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-key-change-in-production';

// Token 过期时间
const ACCESS_TOKEN_EXPIRY = '15m'; // 15分钟
const REFRESH_TOKEN_EXPIRY = '7d'; // 7天

// 用户类型定义
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

/**
 * 生成 Access Token
 */
export function generateAccessToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    type: 'access',
  };

  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,// 15分钟过期
  });
}

/**
 * 生成 Refresh Token
 */
export function generateRefreshToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    type: 'refresh',
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * 验证 Access Token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    if (decoded.type !== 'access') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 验证 Refresh Token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 从请求中获取 Access Token
 */
export function getAccessTokenFromRequest(request: Request): string | null {
  // 从 Authorization header 获取
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * 从 cookies 中获取 Refresh Token
 */
export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('refreshToken')?.value || null;
}

/**
 * 设置 tokens 到响应中
 */
export function setTokensToCookies(accessToken: string, refreshToken: string) {
  return {
    accessToken,
    refreshToken,
    // Cookie 配置
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    },
  };
}

/**
 * 清除认证 cookies
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('refreshToken');
}
