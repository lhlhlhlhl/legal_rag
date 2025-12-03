-- =====================================================
-- LegalGPT 法律知识库快速设置 SQL

-- 启用扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建主表 - 法律知识库
CREATE TABLE public.legalchunks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    content text NOT NULL,
    vector vector(1536) NULL,
    url text NULL,
    topic_name text NULL,
    date_updated timestamp without time zone DEFAULT now(),
    CONSTRAINT legalchunks_pkey PRIMARY KEY (id)
);

-- 创建向量索引
CREATE INDEX legalchunks_vector_idx ON public.legalchunks USING hnsw (vector vector_cosine_ops);

-- 删除函数（选）
DROP FUNCTION IF EXISTS get_relevant_chunks(vector,double precision,integer);

-- 创建相似度搜索函数
CREATE OR REPLACE FUNCTION get_relevant_chunks(
    query_vector vector(1536),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    content text,
    url text,
    topic_name text,
    date_updated timestamp,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        id,
        content,
        url,
        topic_name,
        date_updated,
        1 - (legalchunks.vector <=> query_vector) as similarity
    FROM legalchunks
    WHERE 1 - (legalchunks.vector <=> query_vector) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;