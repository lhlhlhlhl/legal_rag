"use client";
import React from 'react';

interface EmptyStateProps {
  onQuestionClick: (question: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onQuestionClick }) => {
  const exampleQuestions = [
    "Mavic 4 Pro 的最大续航时间是多少？",
    "DJI Mini 4 Pro 的摄像头规格如何？",
    "Air 3S 和 Mavic 4 Pro 有什么区别？"
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* AI回答 区域 */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          {/* DJI-DroneMind*/}
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-tech-gray font-source-han">
              DJI-DroneMind
            </h1>
          </div>
        </div>
        
        <p className="text-lg text-tech-text-light font-source-han max-w-md mx-auto">
          提问关于大疆无人机的任何问题，如参数、故障解决
        </p>
      </div>

      {/* 示例问题卡片 */}
      <div className="grid gap-4 w-full max-w-2xl">
        <h3 className="text-center text-tech-text font-medium mb-2 font-source-han">
          试试这些问题：
        </h3>
        
        {exampleQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="group p-4 bg-white border border-tech-border rounded-xl 
                     hover:border-dji-red hover:shadow-tech-hover 
                     transition-all duration-200 text-left
                     transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-dji-red-light rounded-full flex items-center justify-center
                              group-hover:bg-dji-red group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <span className="text-tech-text group-hover:text-dji-red transition-colors font-source-han">
                {question}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="mt-8 text-center">
        <p className="text-sm text-tech-text-light font-source-han">
          支持查询技术参数、故障排除、机型对比等专业问题
        </p>
      </div>
    </div>
  );
};

export default EmptyState;