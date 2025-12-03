# DJI-DroneMind 数据库设置指南

## 概述

本目录包含了 DJI-DroneMind 项目的 Supabase 数据库设置文件，用于实现 RAG（检索增强生成）功能。

## 文件说明

- `supabase-setup.sql` - 设置文件，包含核心功能
- `README.md` - 本说明文档

## 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录项目的 URL 和 API Key

### 2. 执行数据库设置

#### 方法一：使用 Supabase Dashboard

1. 登录 Supabase Dashboard
2. 进入你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 复制 `supabase-setup.sql` 的内容并执行

#### 方法二：使用 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接到你的项目
supabase link --project-ref YOUR_PROJECT_REF

# 执行 SQL 文件
supabase db reset --db-url YOUR_DATABASE_URL < database/supabase-setup.sql
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# Supabase 配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI 配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_BASE_URL=openai_base_url
```

## 数据库结构

### 主要表

#### DJIChunks 表
存储知识库的文本块和向量数据：

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键，自动生成 |
| content | text | 文本内容（必需） |
| vector | vector(1536) | OpenAI embedding 向量 |
| url | text | 来源 URL |
| model_name | text | 无人机模型名称 |
| date_updated | timestamp | 最后更新时间，自动设置 |


### 主要函数

#### get_relevant_chunks()
根据查询向量搜索相关的知识块：

**参数：**
- `query_vector` - 查询向量（1536维）
- `match_threshold` - 相似度阈值（默认 0.5）
- `match_count` - 返回结果数量（默认 5）

**返回：**
- `id` - 文档块 ID
- `content` - 文本内容
- `url` - 来源 URL
- `model_name` - 无人机模型名称
- `date_updated` - 更新时间
- `similarity` - 相似度分数（0-1）

```sql
SELECT * FROM get_relevant_chunks(
    query_vector := '[0.1, 0.2, 0.3, ...]'::vector(1536),
    match_threshold := 0.5,
    match_count := 5
);
```

## 使用示例

### 1. 插入知识块

```sql
INSERT INTO public.djichunks (content, url, model_name) VALUES (
    'DJI Mavic 4 Pro 是一款专业级无人机，具有先进的避障系统和高质量摄像功能。',
    'https://www.dji.com/cn/mavic-4-pro/specs',
    'mavic-4-pro'
);
```

### 2. 更新向量

```sql
UPDATE public.DJIChunks 
SET vector = '[0.1, 0.2, 0.3, ...]'::vector
WHERE id = 'your_chunk_id';
```

### 3. 搜索相关内容

```sql
-- 使用向量搜索
SELECT * FROM get_relevant_chunks(
    query_vector := '[0.1, 0.2, 0.3, ...]'::vector(1536),
    match_threshold := 0.7,
    match_count := 3
);
```

### 4. 查看所有数据

```sql
-- 查看表中所有数据
SELECT id, content, url, model_name, date_updated 
FROM public.djichunks 
ORDER BY date_updated DESC;

-- 查看有向量的数据
SELECT id, content, url, model_name, date_updated 
FROM public.djichunks 
WHERE vector IS NOT NULL
ORDER BY date_updated DESC;

-- 按模型查看数据
SELECT model_name, COUNT(*) as chunk_count
FROM public.djichunks 
GROUP BY model_name
ORDER BY chunk_count DESC;
```

## 性能优化

### 索引

数据库已自动创建以下索引：

- `djichunks_vector_idx` - HNSW 向量索引，用于快速相似度搜索

### 建议

1. **批量插入**：使用批量插入来提高性能
2. **向量质量**：确保向量数据的质量和一致性
3. **阈值调整**：根据实际需求调整 `match_threshold` 参数
4. **向量质量**：确保向量数据的质量和一致性

## 安全配置

### 行级安全策略 (RLS)

数据库已启用 RLS 并配置了以下策略：

- 允许所有用户读取活跃的知识块
- 允许服务角色进行所有操作
- 用户只能访问自己的会话和消息

### API 密钥管理

- 使用 `UPABASE_ANON_KEY` 进行客户端操作
- 定期轮换 API 密钥

## 故障排除

### 常见问题

1. **向量扩展未启用**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **权限不足**
   - 确保使用正确的 API 密钥
   - 检查 RLS 策略配置

3. **向量维度不匹配**
   - 确保使用 1536 维的 OpenAI embedding
   - 检查向量数据格式

4. **搜索结果为空**
   - 检查 `match_threshold` 设置
   - 确认向量数据已正确插入

### 调试查询

```sql
-- 检查表结构
\d DJIchunks

-- 查看索引
\di

-- 检查数据统计
SELECT * FROM get_chunks_stats();

-- 测试向量搜索
SELECT 
    content,
    1 - (vector <=> '[0,0,0,...]'::vector) as similarity
FROM chunks 
WHERE vector IS NOT NULL
LIMIT 5;
```

## 支持

如果遇到问题，请检查：

1. [Supabase 官方文档](https://supabase.com/docs)
2. [pgvector 文档](https://github.com/pgvector/pgvector)
3. 项目的 GitHub Issues
