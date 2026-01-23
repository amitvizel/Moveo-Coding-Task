import React from 'react';
import FeedbackButtons, { FeedbackContentType } from './FeedbackButtons';
import { useTheme } from '../context/ThemeContext';

interface AIInsightProps {
  insight: string | null;
}

const AIInsight: React.FC<AIInsightProps> = ({ insight }) => {
  const { theme } = useTheme();
  if (!insight) {
    return (
      <div className="text-center py-8 text-skin-text-muted">
        <p>Generating your personalized insight...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Decorative gradient background - only show in light themes */}
      {theme !== 'neon' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50 pointer-events-none"></div>
      )}
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-xl mr-3">💡</span>
            <div>
              <h3 className="text-sm font-semibold text-skin-text-secondary uppercase tracking-wide">
                AI Insight of the Day
              </h3>
              <p className="text-xs text-skin-text-muted">Updated daily</p>
            </div>
          </div>
          <FeedbackButtons 
            contentType={FeedbackContentType.AI_INSIGHT} 
            contentId={new Date().toISOString().split('T')[0]} 
          />
        </div>

        {/* Insight text */}
        <div className="prose prose-sm max-w-none">
          <p className="text-skin-text-primary leading-relaxed text-base">
            {insight}
          </p>
        </div>

      </div>
    </div>
  );
};

export default AIInsight;
