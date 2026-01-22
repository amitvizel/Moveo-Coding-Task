import React from 'react';

interface AIInsightProps {
  insight: string | null;
}

const AIInsight: React.FC<AIInsightProps> = ({ insight }) => {
  if (!insight) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Generating your personalized insight...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg opacity-50"></div>
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header with icon */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              AI-Powered Insight
            </h3>
            <p className="text-xs text-gray-500">Personalized for you</p>
          </div>
        </div>

        {/* Insight text */}
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 leading-relaxed text-base">
            {insight}
          </p>
        </div>

        {/* Decorative quote marks */}
        <div className="absolute top-4 right-4 text-blue-200 text-6xl font-serif leading-none">
          "
        </div>
      </div>
    </div>
  );
};

export default AIInsight;
