# 双Token认证系统说明

## 📋 系统概述

LegalGPT 实现了完整的双Token认证机制，提供安全可靠的用户会话管理。

## 🔐 认证机制

### 双Token架构

1. **Access Token (访问令牌)**
   - 有效期：15分钟
   - 存储位置：localStorage + 内存
   - 用途：API请求认证
   - 传递方式：HTTP Authorization Header

2. **Refresh Token (刷新令牌)**
   - 有效期：7天
   - 存储位置：HttpOnly Cookie
   - 用途：自动刷新Access Token
   - 安全性：无法被JavaScript访问，防止XSS攻击

### 自动刷新机制

- ✅ Access Token过期前3分钟自动刷新
- ✅ 定时器每12分钟检查并刷新
- ✅ API请求失败时自动尝试刷新
- ✅ 无感知的用户体验

## 🎨 页面设计

所有认证页面采用统一的**"法典蓝"**设计风格：

- **主色调**：深蓝色 (#1E40AF, #3B82F6) - 代表信任与权威
- **辅助色**：琥珀金 (#F59E0B) - 象征公正与专业
- **背景**：温暖米白渐变 (#FEFCF8 → #F9F6F1)

### 登录页面 (`/login`)
- 邮箱密码登录
- 错误提示
- 跳转注册
- 测试账号提示

### 注册页面 (`/register`)
- 姓名、邮箱、密码注册
- 密码强度指示器
- 密码确认验证
- 跳转登录

### 主页面用户功能
- 导航栏显示用户头像和姓名
- 下拉菜单显示用户信息
- 退出登录功能
- 未登录自动重定向

## 🚀 快速开始

### 1. 环境配置

复制环境变量模板：

```bash
cp .env.example .env
```

修改 `.env` 文件中的JWT密钥（生产环境必须修改）：

```env
ACCESS_TOKEN_SECRET=your-strong-random-secret-key-here
REFRESH_TOKEN_SECRET=your-another-strong-random-secret-key-here
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 运行开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

### 4. 测试账号

- **邮箱**：test@legalgpt.com
- **密码**：password123

## 📁 项目结构

```
legal-rag/
├── app/
│   ├── api/auth/          # 认证API路由
│   │   ├── login/         # 登录
│   │   ├── register/      # 注册
│   │   ├── refresh/       # 刷新token
│   │   ├── logout/        # 登出
│   │   └── me/            # 获取当前用户
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   └── page.tsx           # 主页（受保护）
├── contexts/
│   └── AuthContext.tsx    # 认证上下文
├── lib/
│   ├── auth.ts            # JWT工具函数
│   └── users.ts           # 用户数据管理
└── components/            # UI组件
```

## 🔧 API端点

### POST `/api/auth/login`
登录获取tokens

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "用户名"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST `/api/auth/register`
注册新用户

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}
```

### POST `/api/auth/refresh`
刷新Access Token

**响应：**
```json
{
  "success": true,
  "message": "Token刷新成功",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET `/api/auth/me`
获取当前用户信息

**请求头：**
```
Authorization: Bearer <accessToken>
```

**响应：**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "用户名"
  }
}
```

### POST `/api/auth/logout`
登出清除tokens

## 🛡️ 安全特性

### 1. Token安全
- ✅ Access Token短有效期(15分钟)
- ✅ Refresh Token长有效期(7天)
- ✅ Refresh Token存储在HttpOnly Cookie中
- ✅ JWT签名验证
- ✅ Token类型验证

### 2. 密码安全
- ✅ bcrypt加密存储
- ✅ 密码长度验证(最少6位)
- ✅ 密码强度提示

### 3. 请求安全
- ✅ CORS配置
- ✅ CSRF保护(SameSite Cookie)
- ✅ XSS防护(HttpOnly Cookie)
- ✅ 输入验证

### 4. 会话管理
- ✅ 自动刷新机制
- ✅ 过期自动登出
- ✅ 跨标签页同步

## 🔄 认证流程

### 登录流程
1. 用户输入邮箱密码
2. 前端发送登录请求到 `/api/auth/login`
3. 后端验证凭证
4. 生成Access Token和Refresh Token
5. Access Token返回给前端
6. Refresh Token设置到HttpOnly Cookie
7. 前端存储Access Token到localStorage
8. 前端跳转到主页

### Token刷新流程
1. 定时器检测Access Token快过期
2. 前端发送刷新请求到 `/api/auth/refresh`
3. 后端验证Refresh Token(从Cookie读取)
4. 生成新的Access Token和Refresh Token
5. 返回新Access Token
6. 更新Cookie中的Refresh Token
7. 前端更新localStorage中的Access Token

### 登出流程
1. 用户点击退出登录
2. 前端发送登出请求到 `/api/auth/logout`
3. 后端清除Cookie中的Refresh Token
4. 前端清除localStorage中的Access Token
5. 前端跳转到登录页

## 📝 使用示例

### 在组件中使用认证

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!user) {
    return <div>请先登录</div>;
  }

  return (
    <div>
      <h1>欢迎, {user.name}!</h1>
      <button onClick={logout}>退出登录</button>
    </div>
  );
}
```

### 发起认证API请求

```typescript
const { accessToken } = useAuth();

const response = await fetch('/api/some-protected-route', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

## 🚨 生产环境部署

### 必须修改的配置

1. **JWT密钥**：生成强随机密钥
   ```bash
   # 生成随机密钥
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **环境变量**：
   ```env
   NODE_ENV=production
   ACCESS_TOKEN_SECRET=<生成的强随机密钥>
   REFRESH_TOKEN_SECRET=<另一个生成的强随机密钥>
   ```

3. **Cookie配置**：确保Cookie的secure标志在生产环境启用

4. **数据库**：替换内存用户存储为真实数据库(Supabase/PostgreSQL)

## 📊 用户数据存储

当前使用内存存储（仅用于演示）。生产环境建议：

### 迁移到Supabase
1. 创建users表
2. 修改 `lib/users.ts` 使用Supabase客户端
3. 实现真实的数据库CRUD操作

## 🔍 故障排查

### Token刷新失败
- 检查Refresh Token Cookie是否存在
- 检查Cookie的httpOnly和secure设置
- 检查JWT密钥配置

### 跨域问题
- 确保API路由允许credentials
- 检查CORS配置

### 页面跳转问题
- 检查AuthContext是否正确包裹应用
- 确认router.push路径正确

## 📚 技术栈

- **框架**：Next.js 15
- **认证**：JWT (jsonwebtoken)
- **加密**：bcryptjs
- **状态管理**：React Context
- **Cookie管理**：js-cookie
- **TypeScript**：类型安全

## ⚡ 性能优化

- ✅ Access Token缓存在localStorage
- ✅ 自动刷新避免频繁登录
- ✅ 定时器优化减少请求
- ✅ 内存中缓存用户信息

## 🎯 未来改进

- [ ] 添加邮箱验证
- [ ] 实现忘记密码功能
- [ ] 添加多设备管理
- [ ] 实现二次验证(2FA)
- [ ] 添加OAuth社交登录
- [ ] Token黑名单机制
- [ ] 登录历史记录
