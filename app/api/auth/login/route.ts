import { NextRequest, NextResponse } from 'next/server';
// 引入 next/server 库，作用是操作 HTTP 请求和响应
import { verifyPassword } from '@/lib/users';
import { generateAccessToken, generateRefreshToken, setTokensToCookies } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '请提供邮箱和密码' },
        { status: 400 }
      );
    }

    // 验证用户凭证
    const user = await verifyPassword(email, password);
    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 生成 tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 设置 refresh token 到 cookie
    const response = NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    });

    // 设置 HttpOnly cookie 存储 refresh token
    const { cookieOptions } = setTokensToCookies(accessToken, refreshToken);
    response.cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7天
    });

    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
