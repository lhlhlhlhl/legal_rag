"use client";
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: any) => void;
  handleSubmit: (e: any) => void;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
}: ChatInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await handleSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-3">
      {/* 输入框 */}
      <div className="flex-1 relative">
        <Input
          onChange={handleInputChange}
          value={input}
          placeholder="输入你的法律问题，如'劳动合同纠纷如何处理？'或'租房合同注意事项有哪些？'"
          className="w-full h-12 px-4 pr-12 rounded-2xl border-2 border-[#CBD5E1] focus:border-[#3B82F6] focus:ring-0 focus:ring-offset-0 bg-white text-[#334155] placeholder:text-[#94A3B8] transition-all duration-300 shadow-sm focus:shadow-md"
          disabled={isSubmitting}
        />

        {/* 输入状态指示 */}
        {isSubmitting && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-[#64748B]">发送中...</span>
          </div>
        )}
      </div>

      {/* 发送按钮 */}
      <Button
        type="submit"
        disabled={!input.trim() || isSubmitting}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1E40AF] disabled:bg-[#CBD5E1] disabled:cursor-not-allowed border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center p-0"
      >
        <Send className="w-5 h-5 text-white" />
      </Button>
    </form>
  );
}