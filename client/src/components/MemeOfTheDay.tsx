import React from 'react';
import FeedbackButtons, { FeedbackContentType } from './FeedbackButtons';
import { useTheme } from '../context/ThemeContext';

interface MemeData {
  title: string;
  url: string;
  author: string;
  permalink: string;
}

interface MemeOfTheDayProps {
  meme: MemeData | null;
}

const MemeOfTheDay: React.FC<MemeOfTheDayProps> = ({ meme }) => {
  const { theme } = useTheme();
  if (!meme) {
    return (
      <div className="p-6 h-full flex items-center justify-center">
        <div className="text-center text-skin-text-muted">
          <p>No meme available today</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Decorative gradient background for header - only show in light themes */}
      {theme !== 'neon' && (
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-yellow-100 via-orange-50 to-red-50 opacity-70 pointer-events-none"></div>
      )}
      
      <div className="relative p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-xl mr-3">😂</span>
            <div>
              <h3 className="text-sm font-semibold text-skin-text-secondary uppercase tracking-wide">
                Fresh meme
              </h3>
              <p className="text-xs text-skin-text-muted">Daily dose of fun</p>
            </div>
          </div>
          <FeedbackButtons 
            contentType={FeedbackContentType.MEME} 
            contentId={new Date().toISOString().split('T')[0]} 
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative flex-1 bg-skin-base rounded-[var(--radius-card)] overflow-hidden flex items-center justify-center min-h-[200px] group cursor-pointer border-[length:var(--border-width-card)] border-skin-border">
            <a 
              href={meme.permalink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <img 
                src={meme.url} 
                alt={meme.title}
                className="w-full h-full object-contain max-h-[500px]"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 transition-all duration-300 flex items-center justify-center group-hover:bg-black/10">
                <span className="opacity-0 group-hover:opacity-100 bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-900 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  View on Reddit ↗
                </span>
              </div>
            </a>
          </div>

          <div className="mt-3 flex justify-between items-center text-xs text-skin-text-muted px-1">
            <span>By u/{meme.author}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeOfTheDay;
