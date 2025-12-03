# LegalGPT 项目设置指南

## 项目简介

LegalGPT 是一款基于 RAG（检索增强生成）技术的法律领域智能咨询助手，专注于为民事纠纷、合同审查、劳动权益等日常法律议题提供准确、可靠的知识支持。项目通过爬取权威法律网站构建向量化知识库，结合流式对话与法律条文精准引用，为用户提供专业、安心的法律咨询体验。

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, AI SDK
- **数据库**: Supabase (PostgreSQL + pgvector)
- **AI 服务**: OpenAI GPT-4 + Embeddings
- **UI 组件**: shadcn/ui, Lucide React
- **爬虫**: Puppeteer, LangChain

## 快速开始

### 1. 环境准备

确保你的系统已安装：
- Node.js 18+ 
- pnpm (推荐) 或 npm
- Git

### 2. 初始化项目

```bash
npx create-next-app@latest DJI-DroneMind
```

### 3. 安装依赖

```bash
pnpm install
# 或
npm install
```

### 4. 配置环境变量

```bash
.env
```

### 5. 设置 Supabase 数据库

#### 方法一：使用 Supabase Dashboard

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 进入 SQL Editor
3. 复制并执行 `database/supabase-setup.sql` 中的内容

#### 方法二：使用快速设置

如果只需要基本功能，可以使用：
```sql
-- 执行 database/supabase-setup.sql 中的内容
```

### 6. 初始化知识库（可选）

```bash
# 运行爬虫脚本，填充知识库
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
DJI-DroneMind/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   └── chat/         # 聊天 API
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   ├── ChatInput.tsx     # 聊天输入组件
│   └── ChatOutput.tsx    # 聊天输出组件
├── database/             # 数据库相关文件
│   ├── supabase-setup.sql # 数据库设置
│   └── README.md         # 数据库文档
├── lib/                  # 工具库
│   └── utils.ts          # 工具函数
├── public/               # 静态资源
├── seed.ts               # 数据种子脚本
├── .env.example          # 环境变量模板           
└── README.md             # 项目说明
```

## 核心功能

### 1. 智能问答

- 基于 RAG 技术的知识检索
- 流式响应输出
- 上下文感知对话

### 2. 知识库管理

- 自动网页内容爬取
- 文本向量化存储
- 相似度搜索

### 3. 用户界面

- 现代化聊天界面
- 响应式设计
- Markdown 渲染支持

## 开发指南

### 添加新的知识源

1. 编辑 `seed.ts` 文件
2. 添加新的 URL 到爬虫列表
3. 运行 `pnpm run seed`

### 自定义 AI 提示词

编辑 `app/api/chat/route.ts` 中的系统提示词：

```typescript
const systemPrompt = `
你是 LegalGPT，一个专业的法律领域智能咨询助手...
`;
```

### 修改 UI 组件

- 聊天输入：`components/ChatInput.tsx`
- 聊天输出：`components/ChatOutput.tsx`
- 样式配置：`tailwind.config.js`

### 数据库查询

使用 Supabase 客户端进行数据库操作：

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 搜索相关内容
const { data } = await supabase.rpc('get_relevant_chunks', {
  query_vector: embedding,
  match_threshold: 0.5,
  match_count: 5
});
```

## 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

## 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `SUPABASE_URL` | ✅ | Supabase 项目 URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase 匿名密钥 |
| `OPENAI_API_KEY` | ✅ | OpenAI API 密钥 |
| `OPENAI_API_BASE_URL` | ✅ | OpenAI API 基础 URL |

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 Supabase URL 和密钥
   - 确认数据库已正确设置

2. **OpenAI API 调用失败**
   - 验证 API 密钥
   - 检查账户余额

3. **向量搜索无结果**
   - 确认知识库已填充数据
   - 调整相似度阈值

4. **爬虫脚本失败**
   - 检查网络连接
   - 验证目标网站可访问性


