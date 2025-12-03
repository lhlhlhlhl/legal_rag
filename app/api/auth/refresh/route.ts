import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken, getRefreshTokenFromCookies, setTokensToCookies } from '@/lib/auth';
import { findUserById } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    // 从 cookie 中获取 refresh token
    const refreshToken = await getRefreshTokenFromCookies();

    if (!refreshToken) {
      return NextResponse.json(
        { error: '未找到刷新令牌' },
        { status: 401 }
      );
    }

    // 验证 refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: '刷新令牌无效或已过期' },
        { status: 401 }
      );
    }

    // 获取用户信息
    const user = findUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 生成新的 tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // 设置响应
    const response = NextResponse.json({
      success: true,
      message: 'Token刷新成功',
      accessToken: newAccessToken,
    });

    // 更新 refresh token cookie
    const { cookieOptions } = setTokensToCookies(newAccessToken, newRefreshToken);
    response.cookies.set('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7天
    });

    return response;
  } catch (error) {
    console.error('刷新token错误:', error);
    return NextResponse.json(
      { error: 'Token刷新失败' },
      { status: 500 }
    );
  }
}
