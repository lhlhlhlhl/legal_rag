"use client";
import React from 'react';

interface LegalLibraryProps {
  onLegalTopicSelect?: (topic: string) => void;
}

const LegalLibrary: React.FC<LegalLibraryProps> = ({ onLegalTopicSelect }) => {
  // 法律领域分类数据
  const legalCategories = [
    {
      name: "民事纠纷",
      topics: [
        { name: "合同纠纷处理", status: "已收录条文", available: true },
        { name: "侵权责任认定", status: "已收录条文", available: true },
        { name: "婚姻家庭法律", status: "已收录条文", available: true },
        { name: "房产纠纷处理", status: "待收录", available: false },
        { name: "债权债务处理", status: "待收录", available: false },
      ]
    },
    {
      name: "合同审查",
      topics: [
        { name: "劳动合同审查要点", status: "已收录条文", available: true },
        { name: "租赁合同注意事项", status: "已收录条文", available: true },
        { name: "买卖合同法律条款", status: "已收录条文", available: true },
        { name: "服务合同法律风险", status: "待收录", available: false },
      ]
    },
    {
      name: "劳动权益",
      topics: [
        { name: "工资福利权益保护", status: "已收录条文", available: true },
        { name: "工伤赔偿法律程序", status: "已收录条文", available: true },
        { name: "解雇赔偿标准", status: "已收录条文", available: true },
        { name: "社保权益维护", status: "待收录", available: false },
      ]
    },
    {
      name: "消费者权益",
      topics: [
        { name: "商品质量维权", status: "已收录条文", available: true },
        { name: "服务投诉处理", status: "已收录条文", available: true },
        { name: "网络购物维权", status: "已收录条文", available: true },
      ]
    },
    {
      name: "知识产权",
      topics: [
        { name: "商标权保护", status: "已收录条文", available: true },
        { name: "著作权维权", status: "已收录条文", available: true },
        { name: "专利侵权处理", status: "待收录", available: false },
      ]
    },
    {
      name: "诉讼程序",
      topics: [
        { name: "民事诉讼流程", status: "已收录条文", available: true },
        { name: "行政诉讼程序", status: "已收录条文", available: true },
        { name: "仲裁程序规则", status: "待收录", available: false },
      ]
    }
  ];

  const handleTopicClick = (topicName: string, available: boolean) => {
    if (available && onLegalTopicSelect) {
      onLegalTopicSelect(topicName);
    }
  };

  return (
    <div className="space-y-5">
      {legalCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="bg-gradient-to-br from-white to-[#F8FAFC] rounded-xl p-4 border-2 border-[#E2E8F0] shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="font-bold text-[#1E40AF] mb-3 text-sm flex items-center">
            <div className="w-1.5 h-4 bg-gradient-to-b from-[#3B82F6] to-[#2563EB] rounded-full mr-2"></div>
            {category.name}
          </h3>
          <div className="space-y-1.5">
            {category.topics.map((topic, topicIndex) => (
              <button
                key={topicIndex}
                onClick={() => handleTopicClick(topic.name, topic.available)}
                disabled={!topic.available}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-300 border ${
                  topic.available
                    ? 'hover:bg-gradient-to-r hover:from-[#DBEAFE] hover:to-[#BFDBFE] cursor-pointer border-transparent hover:border-[#3B82F6] hover:shadow-sm'
                    : 'text-[#94A3B8] cursor-not-allowed border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${topic.available ? 'text-[#334155]' : 'text-[#94A3B8]'}`}>
                    {topic.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    topic.available
                      ? 'bg-gradient-to-r from-[#DCFCE7] to-[#BBF7D0] text-[#15803D] border border-[#22C55E]/30'
                      : 'bg-[#F1F5F9] text-[#CBD5E1]'
                  }`}>
                    {topic.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LegalLibrary;
