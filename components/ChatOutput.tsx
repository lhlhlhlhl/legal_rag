"use client";
import { Message } from "@ai-sdk/react";
import ReactMarkdown from 'react-markdown';
import { Wrench, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface ChatOutputProps {
  messages: Message[];
  status: string; // 实际值：submitted/streaming/ready/error
}

export default function ChatOutput({ messages, status }: ChatOutputProps) {
  const [loadingText, setLoadingText] = useState('正在检索法律条文');
  const [dots, setDots] = useState('');
  const [showLoading, setShowLoading] = useState(false); // 控制加载状态是否显示
  const messagesEndRef = useRef<HTMLDivElement>(null); // 用于自动滚动到底部
  const isScrollingRef = useRef(false); // 防止重复滚动
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 滚动防抖定时器
  const lastMessageLengthRef = useRef(0); // 记录上次消息长度

  // 加载提示文本数组
  const loadingMessages = [
    '正在检索法律条文',
    '正在分析法律案例',
    '正在整理法律条款',
    '正在生成专业回复'
  ];

  // 监听 submitted/streaming 状态，触发加载动画
  useEffect(() => {
    console.log('当前 status:', status); // 方便调试，确认状态流转
    // 当 status 是 submitted时，视为“加载中”
    const isLoadingState = status === 'submitted';
    
    if (isLoadingState) {
      // 延迟 100ms 显示，避免网络快时加载状态一闪而过
      const timer = setTimeout(() => setShowLoading(true), 100);
      
      // 随机选择初始加载文本
      let messageIndex = Math.floor(Math.random() * loadingMessages.length);
      setLoadingText(loadingMessages[messageIndex]);
      setDots('');

      // 点号动画 + 文本切换定时器
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '...') {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingText(loadingMessages[messageIndex]);
            return '';
          }
          return prev + '.';
        });
      }, 600);

      // 清除定时器（避免内存泄漏）
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    } else {
      // 非加载状态：隐藏加载框，重置动画
      setShowLoading(false);
      setDots('');
      setLoadingText('正在调取大疆官方参数');
    }
  }, [status]); // 依赖 status，状态变化时重新执行

  // 检测消息内容类型
  const getMessageType = (content: string) => {
    if (content.includes('纠纷') || content.includes('诉讼') || content.includes('争议')) {
      return 'troubleshoot';
    }
    if (content.includes('法律') || content.includes('条款') || content.includes('规定')) {
      return 'specs';
    }
    return 'normal';
  };

  // 自动滚动到底部的函数（带防抖和优化）
  const scrollToBottom = (immediate = false) => {
    // 如果正在滚动中且不是立即滚动，跳过
    if (isScrollingRef.current && !immediate) return;

    // 清除之前的定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const delay = immediate ? 0 : 200; // 流式输出时延迟更长，减少频繁滚动

    // 设置防抖延迟
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesEndRef.current) {
        isScrollingRef.current = true;

        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest' // 使用 nearest 而不是 end，减少不必要的滚动
        });

        // 滚动完成后重置标志
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 600); // 等待滚动动画完成
      }
    }, delay);
  };

  // 监听消息数量变化（新消息添加）
  useEffect(() => {
    // 当有新消息添加时，立即滚动
    if (messages.length > 0) {
      scrollToBottom(true); // 立即滚动
    }

    // 清理函数
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages.length]); // 只依赖消息数量

  // 监听流式输出内容变化（消息内容更新）
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const currentLength = lastMessage?.content?.length || 0;

    // 如果是流式输出（内容在增长），使用防抖滚动
    if (currentLength > lastMessageLengthRef.current && currentLength > 100) {
      // 内容变化超过一定长度才滚动，避免每个字符都触发
      if (currentLength - lastMessageLengthRef.current > 50) {
        scrollToBottom(false); // 使用防抖
        lastMessageLengthRef.current = currentLength;
      }
    } else {
      lastMessageLengthRef.current = currentLength;
    }
  }, [messages]);

  // 监听加载状态
  useEffect(() => {
    if (showLoading) {
      scrollToBottom(true); // 显示加载时立即滚动
    }
  }, [showLoading]);

  return (
    <div className="space-y-4">
      {/* 消息列表 */}
      {messages.map((message, index) => {
        const messageType = message.role === 'assistant' ? getMessageType(message.content) : 'normal';
        
        return (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`max-w-[85%] sm:max-w-[75%] ${
              message.role === 'user' ? 'order-2' : 'order-1'
            }`}>
              {/* AI 消息图标 */}
              {message.role === 'assistant' && (
                <div className="flex items-center mb-2">
                  {messageType === 'troubleshoot' && (
                    <Wrench className="w-4 h-4 text-[#3B82F6] mr-2" />
                  )}
                  {messageType === 'specs' && (
                    <AlertTriangle className="w-4 h-4 text-[#F59E0B] mr-2" />
                  )}
                  <span className="text-xs text-[#64748B] font-semibold">
                    LegalGPT
                  </span>
                </div>
              )}

              {/* 消息气泡 */}
              <div className={`px-4 py-3 rounded-2xl border-2 transition-all duration-300 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] border-[#3B82F6] text-[#1E3A8A] ml-4 shadow-md'
                  : 'bg-white border-[#E2E8F0] text-[#334155] mr-4 shadow-md hover:shadow-lg hover:border-[#CBD5E1]'
              }`}>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                
                {/* 消息时间戳 */}
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-[#1E40AF]/70' : 'text-[#64748B]'
                }`}>
                  {new Date().toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* 加载状态判断改为 showLoading（兼容 submitted） */}
      {showLoading && (
        <div className="flex justify-start animate-in fade-in duration-300">
          <div className="max-w-[85%] sm:max-w-[75%]">
            <div className="flex items-center mb-2">
              <span className="text-xs text-[#64748B] font-semibold">
                LegalGPT
              </span>
            </div>
            <div className="bg-white border-2 border-[#E2E8F0] px-5 py-4 rounded-2xl mr-4 shadow-lg">
              <div className="flex items-center space-x-3">
                {/* 旋转动画 */}
                <div className="relative">
                  <div className="w-5 h-5 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-5 h-5 border-2 border-[#F59E0B] border-r-transparent rounded-full animate-spin"
                       style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                {/* 加载文字（带点号动画） */}
                <div className="flex items-center space-x-1">
                  <span className="text-[#64748B] text-sm font-medium">
                    {loadingText}{dots}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 错误状态（原有逻辑不变，确保 status = 'error' 时显示） */}
      {status === 'error' && (
        <div className="flex justify-start">
          <div className="max-w-[85%] sm:max-w-[75%]">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444] mr-2" />
              <span className="text-xs text-[#64748B] font-semibold">
                LegalGPT
              </span>
            </div>
            <div className="bg-red-50 border-2 border-red-200 px-4 py-3 rounded-2xl mr-4 shadow-md">
              <span className="text-red-600 text-sm font-medium">抱歉，处理您的请求时出现了错误，请稍后重试。</span>
            </div>
          </div>
        </div>
      )}

      {/* 滚动锚点 - 不可见的div，用于自动滚动到底部 */}
      <div ref={messagesEndRef} />
    </div>
  );
}