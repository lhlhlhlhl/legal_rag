"use client";
import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { Menu, Database, LogOut, User as UserIcon } from 'lucide-react';
import ChatOutput from '@/components/ChatOutput';
import ChatInput from '@/components/ChatInput';
import LegalLibrary from '@/components/LegalLibrary';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [showSidebar, setShowSidebar] = useState(false);// 侧边栏是否显示
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null); // 用户菜单的引用

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    // 只在菜单打开时添加监听器
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // 清理函数
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const {
    input,
    messages,
    status,
    handleInputChange,
    handleSubmit,
  } = useChat();

  // 快捷提问示例
  const quickQuestions = [
    "劳动合同纠纷如何处理？",
    "消费者权益受到侵害怎么办？",
    "房屋租赁合同需要注意哪些条款？"
  ];

  // 处理快捷提问
  const handleQuickQuestion = (question: string) => {
    handleInputChange({ target: { value: question } } as any);
  };

  // 处理法律主题选择
  const handleLegalTopicSelect = (topicName: string) => {
    const question = `请详细介绍${topicName}的相关法律知识`;
    handleInputChange({ target: { value: question } } as any);
    setShowSidebar(false); // 关闭侧边栏
  };

  // 处理登出
  const handleLogout = async () => {
    await logout();
  };

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FEFCF8] via-[#FBF8F1] to-[#F9F6F1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#64748B]">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果未登录，不渲染页面（将被重定向）
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFCF8] via-[#FBF8F1] to-[#F9F6F1]">
      {/* 顶部导航栏 */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] backdrop-blur-sm py-2 shadow-lg' : 'bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] py-4 shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <span className={`font-bold text-white transition-all duration-300 ${
              isScrolled ? 'text-lg' : 'text-xl'
            }`}>
              LegalGPT
            </span>
          </div>

          {/* 导航按钮 */}
          <div className="flex items-center space-x-3">
            {/* 用户信息和菜单 */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-300 border border-white/20"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-white text-sm font-medium hidden sm:block">{user.name}</span>
              </button>

              {/* 下拉菜单 */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border-2 border-[#E2E8F0] overflow-hidden animate-in fade-in duration-200">
                  <div className="p-4 bg-gradient-to-r from-[#DBEAFE] to-[#BFDBFE] border-b border-[#CBD5E1]">
                    <p className="text-sm font-semibold text-[#1E40AF]">{user.name}</p>
                    <p className="text-xs text-[#64748B] mt-1">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-[#F8FAFC] transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 text-[#64748B]" />
                    <span className="text-sm text-[#334155]">退出登录</span>
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 hidden sm:flex border border-white/20"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Database className="w-4 h-4 mr-2" />
              法律库
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 sm:hidden border border-white/20"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="flex pt-16 sm:pt-20">
        {/* 聊天主区域 */}
        <main className={`flex-1 transition-all duration-300 ${
          showSidebar ? 'mr-0 sm:mr-80' : 'mr-0'
        }`}>
          <div className="h-screen flex flex-col">
            {/* 聊天消息区域 */}
            <div className="flex-1 overflow-hidden pb-32">
              {messages.length === 0 ? (
                // 空状态
                <div className="h-full flex flex-col items-center justify-center px-4">
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl">
                      <svg className="w-12 h-12 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#1E40AF] to-[#3B82F6] bg-clip-text text-transparent mb-3">LegalGPT</h2>
                    <p className="text-[#64748B] text-lg mb-6">专业的法律智能咨询助手，为您提供准确可靠的法律知识支持</p>
                  </div>

                  {/* 示例问题卡片 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        className="p-5 bg-white rounded-xl shadow-md border-2 border-[#E2E8F0] hover:border-[#3B82F6] hover:shadow-xl transition-all duration-300 text-left group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] flex items-center justify-center flex-shrink-0 group-hover:from-[#3B82F6] group-hover:to-[#2563EB] transition-all duration-300">
                            <span className="text-[#1E40AF] group-hover:text-white text-sm font-bold">{index + 1}</span>
                          </div>
                          <p className="text-[#334155] text-sm leading-relaxed group-hover:text-[#1E40AF] transition-colors duration-300">{question}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto">
                    <ChatOutput messages={messages} status={status} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* 右侧辅助面板 */}
        <aside className={`fixed right-0 top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-80 bg-white border-l-4 border-[#3B82F6] shadow-xl transform transition-transform duration-300 z-40 ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        } sm:block hidden`}>
          <div className="p-4 h-full flex flex-col bg-gradient-to-b from-white to-[#F8FAFC]">
            <div className="flex-1 overflow-y-auto">
              <LegalLibrary onLegalTopicSelect={handleLegalTopicSelect} />
            </div>
          </div>
        </aside>

        {/* 移动端侧边栏遮罩 */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 sm:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>

      {/* 移动端底部弹窗 */}
      {showSidebar && (
        <div className="fixed bottom-0 left-0 right-0 h-[70vh] bg-white rounded-t-xl shadow-lg z-50 sm:hidden">
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#1A1A1A]">法律库</h2>
              <button 
                onClick={() => setShowSidebar(false)}
                className="text-[#666666] hover:text-[#1A1A1A]"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <LegalLibrary onLegalTopicSelect={handleLegalTopicSelect} />
            </div>
          </div>
        </div>
      )}

      {/* 固定底部输入区域 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#EEEEEE] bg-white/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          {/* 快捷提问按钮 */}
          {messages.length > 0 && (
            <div className="flex space-x-2 mb-3 overflow-x-auto pb-2">
              {['民事纠纷', '合同审查', '劳动权益'].map((label, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(quickQuestions[index])}
                  className="flex-shrink-0 px-4 py-1.5 text-xs bg-gradient-to-r from-[#DBEAFE] to-[#BFDBFE] text-[#1E40AF] rounded-full border-2 border-[#3B82F6]/30 hover:from-[#3B82F6] hover:to-[#2563EB] hover:text-white hover:border-[#1E40AF] transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <ChatInput 
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}