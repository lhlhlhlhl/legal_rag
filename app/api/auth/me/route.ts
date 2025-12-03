import { NextRequest, NextResponse } from 'next/server';
import { getAccessTokenFromRequest, verifyAccessToken } from '@/lib/auth';
import { findUserById } from '@/lib/users';

export async function GET(request: NextRequest) {
  try {
    // 从请求头获取 access token
    const accessToken = getAccessTokenFromRequest(request);

    if (!accessToken) {
      return NextResponse.json(
        { error: '未提供访问令牌' },
        { status: 401 }
      );
    }

    // 验证 access token
    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json(
        { error: '访问令牌无效或已过期' },
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
