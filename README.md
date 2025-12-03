# LegalRAG 项目设置指南

## 项目简介

LegalRAG 是一款基于 RAG（检索增强生成）技术的法律领域智能咨询助手，专注于为民事纠纷、合同审查、劳动权益等日常法律议题提供准确、可靠的知识支持。项目通过爬取权威法律网站构建向量化知识库，结合流式对话与法律条文精准引用，为用户提供专业、安心的法律咨询体验。

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Vercel AI SDK
- **数据库**: Supabase (PostgreSQL + pgvector)
- **AI 服务**: OpenAI GPT-4 + Embeddings
- **UI 组件**: shadcn/ui, Lucide React
- **爬虫**: Puppeteer, LangChain
- **认证**: JWT (Access Token + Refresh Token)

## 快速开始

### 1. 环境准备

确保你的系统已安装：
- Node.js 18+
- pnpm (推荐) 或 npm
- Git

### 2. 克隆项目

```bash
git clone <your-repository-url>
cd legal-rag
```

### 3. 安装依赖

```bash
pnpm install
# 或
npm install
```

### 4. 配置环境变量

复制 `.env.example` 到 `.env` 并配置相应的环境变量：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# JWT Token 密钥（生产环境请务必修改为强随机字符串！）
ACCESS_TOKEN_SECRET=your-access-token-secret-key-change-in-production
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key-change-in-production

# Supabase 配置
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# OpenAI 配置
OPENAI_API_KEY=your-openai-api-key
OPENAI_API_BASE_URL=https://api.openai.com/v1

# Next.js 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. 设置 Supabase 数据库

#### 方法一：使用 Supabase Dashboard

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 进入 SQL Editor
3. 复制并执行 `database/supabase-setup.sql` 中的内容

#### 方法二：使用 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录并链接项目
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 执行数据库设置脚本
supabase db reset --db-url YOUR_DATABASE_URL < database/supabase-setup.sql
```

详细的数据库配置说明请参考 [database/README.md](database/README.md)

### 6. 初始化知识库（可选）

```bash
# 运行爬虫脚本，填充法律知识库
pnpm run seed
```

### 7. 启动开发服务器

```bash
pnpm dev
# 或
npm run dev
```

访问 http://localhost:3000 查看应用。

## 项目结构

```
legal-rag/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/         # 认证 API（登录、注册、登出、刷新令牌）
│   │   └── chat/         # 聊天 API（流式响应）
│   ├── login/            # 登录页面
│   ├── register/         # 注册页面
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页（聊天界面）
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 基础组件
│   ├── ChatInput.tsx     # 聊天输入组件
│   ├── ChatOutput.tsx    # 聊天输出组件
│   ├── EmptyState.tsx    # 空状态提示
│   └── LegalLibrary.tsx  # 法律知识库展示
├── database/             # 数据库相关文件
│   ├── supabase-setup.sql # 数据库初始化脚本
│   └── README.md         # 数据库详细文档
├── lib/                  # 工具库
│   ├── auth/            # 认证相关工具（JWT、Token 管理）
│   ├── user/            # 用户管理工具
│   └── utils.ts         # 通用工具函数
├── public/               # 静态资源
├── seed.ts               # 知识库爬虫脚本
├── .env.example          # 环境变量模板
├── package.json          # 项目依赖
└── README.md             # 本文档
```

## 核心功能

### 1. 智能问答

- 基于 RAG 技术的知识检索
- 流式响应输出，提升用户体验
- 上下文感知的多轮对话
- 精准引用法律条文和来源

### 2. 用户认证系统

- 用户注册与登录
- JWT 双令牌机制（Access Token + Refresh Token）
- 自动令牌刷新
- 安全的密码加密存储（bcrypt）

### 3. 知识库管理

- 自动网页内容爬取（Puppeteer）
- 文本向量化存储（OpenAI Embeddings）
- 高效的向量相似度搜索（pgvector HNSW 索引）
- 支持批量知识导入

### 4. 用户界面

- 现代化聊天界面
- 响应式设计，适配移动端和桌面端
- Markdown 格式渲染
- 优雅的加载状态和空状态提示

## 开发指南

### API 路由说明

#### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新访问令牌
- `GET /api/auth/me` - 获取当前用户信息

#### 聊天接口

- `POST /api/chat` - 发送消息并获取 AI 流式响应

### 添加新的知识源

1. 编辑 `seed.ts` 文件
2. 在 URL 列表中添加新的法律网站地址：

```typescript
const urls = [
  'https://example-legal-site.com/article1',
  'https://example-legal-site.com/article2',
  // 添加更多 URL...
];
```

3. 运行爬虫脚本：

```bash
pnpm run seed
```

### 自定义 AI 提示词

编辑 `app/api/chat/route.ts` 中的系统提示词：

```typescript
const systemPrompt = `
你是 LegalRAG，一个专业的法律领域智能咨询助手...
`;
```

### 修改 UI 组件

- 聊天输入：`components/ChatInput.tsx`
- 聊天输出：`components/ChatOutput.tsx`
- 空状态提示：`components/EmptyState.tsx`
- 样式配置：`tailwind.config.js` 和 `app/globals.css`

### 数据库查询

使用 Supabase 客户端进行数据库操作：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 向量相似度搜索
const { data } = await supabase.rpc('get_relevant_chunks', {
  query_vector: embedding,
  match_threshold: 0.7,
  match_count: 5
});
```

## 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（与 `.env` 文件相同）
4. 点击部署

### 自托管部署

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `ACCESS_TOKEN_SECRET` | ✅ | JWT 访问令牌密钥，建议使用 32 位以上随机字符串 |
| `REFRESH_TOKEN_SECRET` | ✅ | JWT 刷新令牌密钥，建议使用 32 位以上随机字符串 |
| `SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase 匿名密钥（用于客户端） |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase 服务角色密钥（用于服务端操作） |
| `OPENAI_API_KEY` | ✅ | OpenAI API 密钥 |
| `OPENAI_API_BASE_URL` | ✅ | OpenAI API 基础 URL |
| `NEXT_PUBLIC_APP_URL` | ✅ | 应用访问地址 |

## 故障排除

### 常见问题

**1. 数据库连接失败**
   - 检查 Supabase URL 和密钥是否正确
   - 确认数据库已正确执行初始化脚本
   - 验证网络连接和防火墙设置

**2. OpenAI API 调用失败**
   - 验证 API 密钥是否有效
   - 检查账户余额是否充足
   - 确认 API Base URL 配置正确

**3. 向量搜索无结果**
   - 确认知识库已填充数据（运行 `pnpm run seed`）
   - 调整相似度阈值参数（降低 `match_threshold`）
   - 检查向量维度是否为 1536（OpenAI embedding-3-small）

**4. 用户认证失败**
   - 确认 JWT 密钥已正确配置
   - 检查 Token 是否已过期
   - 验证用户表和相关数据库函数是否正确创建

**5. 爬虫脚本失败**
   - 检查目标网站是否可访问
   - 验证网络连接和代理设置
   - 确认 Puppeteer 浏览器依赖已正确安装

### 调试技巧

```bash
# 启动开发服务器（自动启用调试）
pnpm dev

# 查看详细日志
DEBUG=* pnpm dev
```

## 性能优化建议

### 数据库优化
- 定期清理过期或无效的数据
- 使用批量插入提高数据导入性能
- 根据查询模式调整 `match_threshold` 和 `match_count` 参数
- 监控向量索引的查询性能

### 前端优化
- 启用 Next.js 图片优化和字体优化
- 使用 React.memo 避免不必要的组件重渲染
- 实施代码分割和懒加载
- 启用 Turbopack 加速开发构建（已配置）

### API 优化
- 实施适当的缓存策略
- 使用边缘函数部署减少延迟
- 实施 API 速率限制防止滥用
- 优化向量搜索的参数配置

## 安全建议

- 生产环境务必更换 JWT 密钥为强随机字符串
- 定期更新依赖包，修复已知的安全漏洞
- 启用 HTTPS 加密通信
- 实施 API 速率限制和请求验证
- 定期备份 Supabase 数据库
- 不要将 `.env` 文件提交到版本控制系统
- 使用环境变量管理敏感信息

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 致谢

本项目使用了以下优秀的开源项目：

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代方案
- [OpenAI](https://openai.com/) - GPT-4 和 Embeddings API
- [shadcn/ui](https://ui.shadcn.com/) - 现代化 React UI 组件库
- [pgvector](https://github.com/pgvector/pgvector) - PostgreSQL 向量扩展
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI 应用开发工具包
- [LangChain](https://js.langchain.com/) - LLM 应用开发框架
