import { createOpenAI } from "@ai-sdk/openai"
// langchain loader 是RAG的基础功能 txt,pdf,excel...
// 加载网页内容
import {
    PuppeteerWebBaseLoader,
} from "@langchain/community/document_loaders/web/puppeteer";
import {
  RecursiveCharacterTextSplitter
} from 'langchain/text_splitter';
import {
  embed // 向量嵌入
} from 'ai';
import "dotenv/config";
import { createClient } from '@supabase/supabase-js';

// ?? 空合并运算符
const supabase = createClient(
  process.env.SUPABASE_URL??"",
  process.env.SUPABASE_ANON_KEY??""
)

// 使用千问API配置
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
})

// supabase 去做向量化的知识库数据
console.log("开始构建法律专业知识库，爬取权威法律网站内容...");

// 从 URL 中提取法律主题名称的函数
const extractLegalTopic = (url: string): string => {
  try {
    const urlParts = url.split('/');
    // 获取倒数第二个或第三个部分作为主题名称
    const topicPart = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 3];
    
    // 映射常见法律主题
    const topicMap: { [key: string]: string } = {
      'minfa': '民法',
      'minshi': '民事诉讼法',
      'hetong': '合同法',
      'laodong': '劳动法',
      'xingshi': '刑法',
      'xingshisusong': '刑事诉讼法',
      'xingzheng': '行政法',
      'zhishi': '知识产权法',
      'hunyin': '婚姻法',
      'baoxian': '保险法',
      'gongsi': '公司法',
      'baohan': '担保法',
      'wupin': '物权法',
      'minfadian': '民法典',
      'zhaiwu': '债权法'
    };
    
    return topicMap[topicPart] || topicPart || 'unknown';
  } catch (error) {
    console.error('提取法律主题失败:', error);
    return 'unknown';
  }
};

// 知识库构建
const scrapePage = async (url: string, retries: number = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`尝试第 ${attempt} 次爬取: ${url}`);

      // 使用 Puppeteer 爬取网页内容
      const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
          executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        },
        gotoOptions: {
          waitUntil: 'networkidle0',
          timeout: 60000, // 增加超时时间到60秒
        },
        evaluate: async(page, browser) => {
          const result = await page.evaluate(() => {
            // 针对法律网站的内容提取策略
            // 优先提取正文内容，移除导航、广告等无关元素
            const contentSelectors = [
              '.content',
              '.article-content',
              '.main-content',
              '.text-content',
              '#content',
              '.law-content',
              '.legal-text',
              '.article-body',
              '.post-content'
            ];
            
            let content = '';
            
            // 尝试多个选择器
              for (const selector of contentSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                  content = (element as HTMLElement).innerText || element.textContent || '';
                  break;
                }
              }
            
            // 如果没有找到主要内容，尝试提取body文本但移除无关元素
            if (!content) {
              const body = document.body.cloneNode(true) as HTMLElement;
              
              // 移除无关元素
              const elementsToRemove = [
                'nav', 'header', 'footer', 'aside', '.sidebar',
                '.advertisement', '.ads', '.menu', '.navigation',
                '.social-share', '.comments', '.related-posts'
              ];
              
              elementsToRemove.forEach(selector => {
                const elements = body.querySelectorAll(selector);
                elements.forEach(el => el.remove());
              });
              
              content = body.innerText || body.textContent || '';
            }
            
            // 清理空白字符
            return content.trim().replace(/\s+/g, ' ');
          });
          await browser.close();
          return result;
        }
      });
      
      return await loader.scrape();
    } catch (error) {
      console.error(`第 ${attempt} 次爬取失败:`, error);
      if (attempt === retries) {
        throw error;
      }
      // 等待一段时间后重试
      console.log(`等待 ${2 * attempt} 秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  throw new Error(`所有重试都失败了`);
}
const loadData = async (webpages: string[]) => {
    // 创建递归文本分割器
    // 将爬虫爬取到的网页内容进行递归分割
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 512, //切割的长度512个字符，包含一个比较独立的语意
      chunkOverlap: 100, // 相邻文本块重叠100字符（保持上下文连贯性）
      separators: ['\n\n', '\n', ' ', ''], // 递归分割的分隔符优先级
    });

    for (const url of webpages) {
      console.log(`正在爬取法律内容: ${url}`);
      const content = await scrapePage(url);
      console.log(`法律内容爬取完成: ${url}, 内容长度: ${content.length}`);
      
      // 提取法律主题
      const topicName = extractLegalTopic(url);
      console.log(`提取的法律主题: ${topicName}`);
      
      const chunks = await splitter.splitText(content);

      for (let chunk of chunks){
        // 使用千问API的embedding模型
        const { embedding } = await embed({
          model: openai.embedding('text-embedding-v1'), // 使用千问支持的embedding模型
          value: chunk
        })
        console.log('向量长度:', embedding.length);

        const {error} = await supabase.from('legalchunks').insert({
          content: chunk,
          vector: embedding,
          url: url,
          topic_name: topicName
        })
        if(error){
            console.log('插入错误:', error)
        } else {
            console.log(`成功插入数据块，主题: ${topicName}`);
        }
      }
    }
}

// 知识库的来源，可配置 - 法律相关权威网站
loadData([
  // 中国政府网 - 法律法规
  "http://www.gov.cn/zhengce/",
  "http://www.gov.cn/zhengce/xxgk/",
  
  // 中国人大网 - 法律法规
  "http://www.npc.gov.cn/npc/c30834/",
  "http://www.npc.gov.cn/npc/c30834/202006/t20200602_306801.html",
  
  // 中国法院网 - 法律法规 (HTTP版本)
  "http://www.chinacourt.org/law.shtml",
  "http://www.chinacourt.org/article/list/",
  
  // 中国普法网
  "http://www.legalinfo.gov.cn/",
  "http://www.legalinfo.gov.cn/pub/sfzhw/",
  
  // 司法部网站
  "http://www.moj.gov.cn/",
  "http://www.moj.gov.cn/pub/sfbgw/",
  
  // 中国法律服务网
  "http://www.12348.gov.cn/",
  "http://www.12348.gov.cn/pub/m12348/"
]);