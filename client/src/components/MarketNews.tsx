import React from 'react';
import FeedbackButtons, { FeedbackContentType } from './FeedbackButtons';
import { useTheme } from '../context/ThemeContext';

interface NewsItem {
  id: number;
  title: string;
  url: string | null;
  domain: string;
  created_at: string;
}

interface MarketNewsProps {
  news: NewsItem[];
}

const MarketNews: React.FC<MarketNewsProps> = ({ news }) => {
  const { theme } = useTheme();
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!news || news.length === 0) {
    return (
      <div className="text-center py-8 text-skin-text-muted">
        <p>No news available at the moment</p>
        <p className="text-sm mt-2">Check back later for updates</p>
      </div>
    );
  }

  // In Meme Mode, use a much larger max-height since cards are in a narrower 3-column grid
  // This prevents bottom cutoff while still allowing scrolling for long lists
  const maxHeightClass = theme === 'meme' ? 'max-h-[600px]' : 'max-h-96';
  
  return (
    <div className={`space-y-3 ${maxHeightClass} overflow-y-auto pb-4`}>
      {news.map((item) => {
        return (
          <div
            key={item.id}
            className="block p-4 bg-skin-base rounded-lg border border-skin-border"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-3">
                <h4 className="font-medium text-skin-text-primary mb-1 line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-skin-text-muted">
                  <span className="flex items-center">
                    <span className="mr-1">🌐</span>
                    {item.domain}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <span className="mr-1">🕐</span>
                    {formatTimeAgo(item.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                <FeedbackButtons 
                  contentType={FeedbackContentType.NEWS} 
                  contentId={item.id.toString()} 
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MarketNews;
