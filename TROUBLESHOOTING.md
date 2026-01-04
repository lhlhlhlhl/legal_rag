# Vercel 部署故障排查指南

## 问题现象

访问 https://legal-rag-kappa.vercel.app/ 时，页面可以正常显示，但提问时报错：
> 抱歉，处理您的请求时出现了错误，请稍后重试。

## 可能的原因和解决方案

### 1. 检查 Vercel 环境变量配置（最常见）

登录 Vercel，进入项目设置检查以下环境变量是否都已正确配置：

#### 必需的环境变量清单：

```env
✓ SUPABASE_URL            # Supabase 项目 URL
✓ SUPABASE_ANON_KEY       # Supabase 匿名密钥
✓ OPENAI_API_KEY          # OpenAI API 密钥
✓ OPENAI_API_BASE_URL     # OpenAI API 基础 URL
```

**检查步骤：**

1. 登录 Vercel → 选择项目 → Settings → Environment Variables
2. 确认以上 4 个环境变量都存在且值正确
3. 特别注意：
   - `SUPABASE_URL` 应该类似：`https://xxxxx.supabase.co`
   - `SUPABASE_ANON_KEY` 是一个很长的字符串，以 `eyJ` 开头
   - `OPENAI_API_KEY` 应该以 `sk-` 开头
   - `OPENAI_API_BASE_URL` 应该是：`https://api.openai.com/v1`

4. 如果发现缺失或错误，添加/修改后点击 **"Redeploy"** 重新部署

### 2. 查看 Vercel 运行时日志

**步骤：**

1. 登录 Vercel
2. 进入你的项目
3. 点击 **Deployments** → 选择最新的部署
4. 点击 **Runtime Logs** 或 **Functions** 查看实时日志

**重点关注的错误信息：**

- `OPENAI_API_KEY is undefined` → OpenAI 密钥未配置
- `Connection refused` → Supabase 连接失败
- `401 Unauthorized` → API 密钥无效
- `Insufficient quota` → OpenAI 账户余额不足
- `RPC function not found` → 数据库函数未创建

### 3. 检查 Supabase 数据库配置

#### 3.1 验证数据库是否已初始化

登录 Supabase Dashboard → SQL Editor，执行以下查询：

```sql
-- 检查向量扩展是否启用
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 检查表是否存在
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'legalchunks';

-- 检查 RPC 函数是否存在
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'get_relevant_chunks';

-- 检查是否有数据
SELECT COUNT(*) FROM public.legalchunks;
```

**如果以上任何查询返回空或报错，请重新执行 `database/supabase-setup.sql` 脚本。**

#### 3.2 检查 Supabase 网络访问

1. Supabase Dashboard → Settings → Database
2. 确认 **Connection pooling** 已启用
3. 检查 **Network restrictions** 是否阻止了 Vercel 的访问

### 4. 检查 OpenAI API 状态

#### 4.1 验证 API 密钥有效性

在本地终端运行：

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY"
```

如果返回模型列表，说明密钥有效。如果返回 401 错误，需要重新生成密钥。

#### 4.2 检查账户余额

访问 https://platform.openai.com/account/billing/overview 检查账户余额是否充足。

### 5. 知识库是否有数据

即使其他配置正确，如果知识库为空，也可能导致错误。

**解决方案：**

在本地运行爬虫脚本填充数据：

```bash
# 确保 .env 文件配置了正确的 Supabase 凭据
pnpm run seed
```

或者在 Supabase Dashboard → Table Editor 中手动插入测试数据。

### 6. 添加详细错误日志（临时调试）

为了更准确地定位问题，可以临时添加更详细的错误日志。

编辑 `app/api/chat/route.ts`，修改错误处理部分：

```typescript
export async function POST(req: Request) {
  try {
    // ... 现有代码 ...
  } catch(err) {
    // 添加更详细的错误日志
    console.error('=== 聊天 API 错误详情 ===');
    console.error('错误类型:', err?.constructor?.name);
    console.error('错误信息:', err?.message);
    console.error('错误堆栈:', err?.stack);
    console.error('环境变量检查:');
    console.error('- SUPABASE_URL 存在:', !!process.env.SUPABASE_URL);
    console.error('- SUPABASE_ANON_KEY 存在:', !!process.env.SUPABASE_ANON_KEY);
    console.error('- OPENAI_API_KEY 存在:', !!process.env.OPENAI_API_KEY);

    return Response.json({
      error: 'Internal server error',
      details: err?.message // 临时返回错误详情（生产环境应删除）
    }, { status: 500 });
  }
}
```

提交并推送代码后，重新查看 Vercel 日志获取详细错误信息。

## 快速诊断命令

在本地运行以下命令测试 API 连接：

```bash
# 测试 OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY"

# 测试 Supabase 连接
curl "YOUR_SUPABASE_URL/rest/v1/legalchunks?select=id&limit=1" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

## 常见错误对照表

| 错误现象 | 可能原因 | 解决方案 |
|---------|---------|---------|
| 页面白屏 | 构建失败 | 检查 Vercel 构建日志 |
| 请求超时 | API 密钥错误或网络问题 | 验证 OpenAI/Supabase 密钥 |
| 500 错误 | 环境变量未配置 | 检查 Vercel 环境变量 |
| 空响应 | 知识库无数据 | 运行 seed 脚本填充数据 |
| 401 错误 | API 密钥无效 | 重新生成并配置密钥 |
| RPC 错误 | 数据库函数未创建 | 重新执行 SQL 初始化脚本 |

## 推荐的排查顺序

1. **首先检查 Vercel 环境变量**（80% 的问题出在这里）
2. **查看 Vercel Runtime Logs**（获取具体错误信息）
3. **验证 OpenAI API 密钥**
4. **验证 Supabase 配置**
5. **检查数据库是否有数据**

## 需要帮助？

如果按照以上步骤仍无法解决，请提供以下信息：

1. Vercel Runtime Logs 的错误截图
2. Supabase 表和函数的检查结果
3. 环境变量配置截图（注意隐藏敏感信息）

---

**提示**：修改环境变量后一定要重新部署（Redeploy），否则新配置不会生效！
