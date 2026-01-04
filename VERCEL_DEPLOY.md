# Vercel 部署指南

## 部署步骤

### 1. 登录 Vercel

访问 [https://vercel.com](https://vercel.com) 并使用 GitHub 账号登录。

### 2. 导入项目

1. 点击 **"Add New..."** → **"Project"**
2. 在 "Import Git Repository" 页面，找到 `lhlhlhlhl/legal_rag` 仓库
3. 点击 **"Import"** 按钮

### 3. 配置项目

在配置页面：

#### 项目设置
- **Framework Preset**: Next.js (自动检测)
- **Root Directory**: `./` (保持默认)
- **Build Command**: `next build` (自动检测)
- **Output Directory**: `.next` (自动检测)
- **Install Command**: `pnpm install` 或 `npm install`

#### 环境变量配置

点击 **"Environment Variables"** 展开，添加以下环境变量：

**必需的环境变量：**

```env
# JWT Token 密钥 - 请使用强随机字符串！
ACCESS_TOKEN_SECRET=your-strong-random-string-at-least-32-characters
REFRESH_TOKEN_SECRET=your-another-strong-random-string-at-least-32-characters

# Supabase 配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# OpenAI 配置
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_API_BASE_URL=https://api.openai.com/v1

# Next.js 应用配置
NEXT_PUBLIC_APP_URL=https://your-vercel-app-url.vercel.app
```

**如何生成安全的 JWT 密钥：**

在本地运行以下命令生成随机密钥：

```bash
# 使用 Node.js 生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 或使用 OpenSSL
openssl rand -hex 32
```

### 4. 部署

1. 确认所有环境变量已正确填写
2. 点击 **"Deploy"** 按钮
3. 等待构建和部署完成（通常需要 2-5 分钟）

### 5. 更新应用 URL

部署完成后：

1. 复制 Vercel 分配的域名（例如：`https://legal-rag.vercel.app`）
2. 返回项目设置 → Environment Variables
3. 更新 `NEXT_PUBLIC_APP_URL` 为实际的部署域名
4. 点击 **"Redeploy"** 重新部署

### 6. 验证部署

访问你的 Vercel 应用 URL，检查：

- [ ] 首页能正常加载
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 聊天功能正常（需要先填充知识库）

## 常见问题

### 1. 构建失败

**问题**: 构建时出现依赖安装错误

**解决方案**:
- 确保 `package.json` 中所有依赖版本正确
- 尝试在 Project Settings → Build & Development Settings 中切换包管理器（npm/pnpm/yarn）

### 2. 环境变量未生效

**问题**: 部署后环境变量无法读取

**解决方案**:
- 检查环境变量名称是否正确（区分大小写）
- 客户端使用的环境变量必须以 `NEXT_PUBLIC_` 开头
- 修改环境变量后需要重新部署

### 3. 数据库连接失败

**问题**: 无法连接到 Supabase 数据库

**解决方案**:
- 验证 Supabase URL 和密钥是否正确
- 确保 Supabase 项目在 Project Settings → Database 中允许来自 Vercel 的连接
- 检查 Supabase 数据库是否已执行初始化脚本

### 4. OpenAI API 调用失败

**问题**: AI 聊天功能不工作

**解决方案**:
- 验证 OpenAI API 密钥是否有效
- 检查 OpenAI 账户余额是否充足
- 确认 `OPENAI_API_BASE_URL` 配置正确

### 5. 知识库为空

**问题**: AI 无法检索到相关法律知识

**解决方案**:
- 在本地运行 `pnpm run seed` 填充知识库
- 或者使用 Supabase Dashboard 手动导入数据
- 确认向量数据已正确生成和存储

## 自定义域名（可选）

### 1. 添加自定义域名

1. 在 Vercel 项目页面，进入 **Settings** → **Domains**
2. 输入你的域名（例如：`legal-rag.yourdomain.com`）
3. 点击 **Add**

### 2. 配置 DNS

根据 Vercel 提供的说明，在你的域名服务商处添加 DNS 记录：

**CNAME 记录**（推荐）:
```
Type: CNAME
Name: legal-rag (或 @)
Value: cname.vercel-dns.com
```

**或 A 记录**:
```
Type: A
Name: legal-rag (或 @)
Value: 76.76.19.19
```

### 3. 更新环境变量

域名配置完成后，更新 `NEXT_PUBLIC_APP_URL` 为你的自定义域名。

## 性能优化

### 1. 启用边缘函数

在 `next.config.ts` 中配置边缘运行时：

```typescript
export const config = {
  runtime: 'edge',
};
```

### 2. 配置缓存策略

添加 `vercel.json` 配置文件：

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=1, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### 3. 启用分析

在 Vercel Dashboard 中启用：
- Speed Insights - 监控页面性能
- Web Analytics - 追踪用户行为

## 监控和日志

### 查看部署日志

1. 进入项目 Dashboard
2. 点击 **Deployments**
3. 选择具体的部署记录
4. 查看 **Building** 和 **Runtime Logs**

### 实时日志

1. 安装 Vercel CLI：
   ```bash
   npm i -g vercel
   ```

2. 登录并查看日志：
   ```bash
   vercel login
   vercel logs [deployment-url]
   ```

## 回滚部署

如果新部署出现问题：

1. 进入 **Deployments** 页面
2. 找到之前正常工作的部署
3. 点击右侧的 **...** → **Promote to Production**

## 持续集成

Vercel 自动集成了 CI/CD：

- 每次推送到 `master` 分支自动触发生产部署
- 每次推送到其他分支自动创建预览部署
- Pull Request 自动生成预览链接

### 配置部署分支

在 Project Settings → Git 中可以配置：
- Production Branch: `master`
- 忽略的分支模式

## 安全建议

1. **保护环境变量**
   - 不要在代码中硬编码敏感信息
   - 定期轮换 API 密钥和 JWT 密钥

2. **启用 HTTPS**
   - Vercel 自动提供 SSL 证书
   - 确保所有 API 调用使用 HTTPS

3. **配置 CORS**
   - 在 API 路由中限制允许的来源

4. **速率限制**
   - 考虑添加 API 速率限制中间件

## 成本估算

Vercel 免费计划包括：
- 100 GB 带宽/月
- 无限部署
- 自动 HTTPS
- 预览部署

对于生产应用，建议升级到 Pro 计划以获得：
- 1 TB 带宽/月
- 更多团队成员
- 密码保护
- 更长的日志保留时间

## 支持和帮助

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel 社区](https://github.com/vercel/vercel/discussions)

---

部署完成后，记得在项目 README.md 中添加实际的部署 URL！
