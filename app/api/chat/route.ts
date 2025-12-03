import {
  embed,
  streamText
} from 'ai';
import {
  createOpenAI
} from '@ai-sdk/openai';
import {
  createClient
} from '@supabase/supabase-js';
// import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL??"",
  process.env.SUPABASE_ANON_KEY??""
);

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
})

async function generateEmbedding(message: string) {
  return embed({
    model: openai.embedding('text-embedding-3-small'),
    value: message
  })
}

async function fetchRelevantContext(embedding: number[]) {
  console.log('=== 开始调用 RPC 函数 ===');
  console.log('Embedding 长度:', embedding.length);
  console.log('Embedding 前5个值:', embedding.slice(0, 5));
  
  const { data, error } = await supabase.rpc("get_relevant_chunks", {
    query_vector: embedding,
    match_threshold: 0.2,
    match_count: 6
  });
  
  console.log('=== RPC 调用结果 ===');
  console.log('Error:', error);
  console.log('Data:', data);
  console.log('Data type:', typeof data);
  console.log('Data length:', data?.length);
  
  if (error) {
    console.error('Supabase RPC 错误详情:', JSON.stringify(error, null, 2));
    throw error;
  }
  
  console.log(data, '////////////////');
  return JSON.stringify(
    data.map((item:any) => `
      Source: ${item.url},
      Date Updated: ${item.date_updated}
      Content: ${item.content}  
    `)
  )
}

const createPrompt = (context: string, userQuestion: string) => {
  return {
    role: "system",
    content: `
      你是 LegalGPT，一个专业的法律领域智能咨询助手。你专门提供关于民事纠纷、合同审查、劳动权益等日常法律议题的准确、可靠的知识支持。
      
      请基于以下知识库内容回答用户问题：
      ----------------
      知识库内容开始
      ${context}
      知识库内容结束
      ----------------
      
      回答要求：
      1. 使用 Markdown 格式回答，包含相关法律条文引用和信息更新日期
      2. 重点关注法律条文、案例解析、权益保护等专业信息
      3. 如果知识库信息不足，可以基于你的专业知识补充，但请明确标注这些信息可能不是最新的
      4. 如果用户询问与法律无关的问题，请礼貌地告知你只能回答法律相关问题
      5. 对于法律条文，请提供准确的法律名称、条款编号和具体内容
      6. 如果涉及法律风险提示，请提醒用户咨询专业律师
      
      专业领域包括但不限于：
      - 民事纠纷处理（合同纠纷、侵权责任、婚姻家庭等）
      - 合同审查与起草（劳动合同、租赁合同、买卖合同等）
      - 劳动权益保护（工资福利、工伤赔偿、解雇赔偿等）
      - 消费者权益保护
      - 房产纠纷处理
      - 债权债务处理
      - 知识产权保护
      - 行政复议与诉讼程序
      
      ----------------
      用户问题：${userQuestion}
      ----------------
    `
  }
}

// 将法律关键词标准化处理
function normalizeLegalKeywordsInText(text: string): string {
  // 常见的法律关键词模式匹配（不区分大小写）
  const legalPatterns = [
    // 法律类型
    /民法典/gi,
    /合同法/gi,
    /劳动法/gi,
    /劳动合同法/gi,
    /消费者权益保护法/gi,
    /婚姻法/gi,
    /继承法/gi,
    /物权法/gi,
    /侵权责任法/gi,
    /公司法/gi,
    /知识产权法/gi,
    /行政诉讼法/gi,
    /民事诉讼法/gi,
    /刑事诉讼法/gi,
    
    // 法律程序
    /仲裁/gi,
    /诉讼/gi,
    /调解/gi,
    /上诉/gi,
    /申诉/gi,
    /执行/gi,
    /保全/gi,
    /强制执行/gi,
    
    // 法律主体
    /自然人/gi,
    /法人/gi,
    /法定代表人/gi,
    /监护人/gi,
    /代理人/gi,
    /律师/gi,
    /法官/gi,
    /仲裁员/gi,
    
    // 法律概念
    /违约责任/gi,
    /侵权责任/gi,
    /连带责任/gi,
    /过错责任/gi,
    /无过错责任/gi,
    /举证责任/gi,
    /诉讼时效/gi,
    /除斥期间/gi,
    /善意第三人/gi,
    /不可抗力/gi,
    /重大误解/gi,
    /显失公平/gi,
    /欺诈/gi,
    /胁迫/gi,
    /乘人之危/gi
  ];
  
  let normalizedText = text;
  
  // 标准化法律关键词
  legalPatterns.forEach(pattern => {
    normalizedText = normalizedText.replace(pattern, (match) => {
      return match.toLowerCase();
    });
  });
  
  return normalizedText;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages.at(-1).content;
    
    // 只转换法律关键词为小写，保持其他内容不变
    const normalizedMessage = normalizeLegalKeywordsInText(latestMessage);
    console.log('原始输入:', latestMessage);
    console.log('标准化输入:', normalizedMessage);
    
    // embedding
    const { embedding } = await generateEmbedding(normalizedMessage);
    // console.log(embedding);
    // 相似度计算
    const context = await fetchRelevantContext(embedding);
    const prompt = createPrompt(context, latestMessage);
    console.log(prompt);
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: [prompt, ...messages]
    })

     // 关键：必须返回 Response
    return result.toDataStreamResponse();
  } catch(err) {
  console.error('POST 处理错误:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}