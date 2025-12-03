import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 创建响应
    const response = NextResponse.json({
      success: true,
      message: '登出成功',
    });

    // 清除 refresh token cookie
    response.cookies.delete('refreshToken');

    return response;
  } catch (error) {
    console.error('登出错误:', error);
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    );
  }
}
