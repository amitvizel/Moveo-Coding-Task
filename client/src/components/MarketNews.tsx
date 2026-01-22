import React from 'react';

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
      <div className="text-center py-8 text-gray-500">
        <p>No news available at the moment</p>
        <p className="text-sm mt-2">Check back later for updates</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {news.map((item) => {
        const hasUrl = item.url && item.url.trim() !== '';
        const content = (
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-3">
              <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">
                {item.title}
              </h4>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
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
            {hasUrl && (
              <div className="flex-shrink-0 text-gray-400 hover:text-blue-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            )}
          </div>
        );

        if (hasUrl) {
          return (
            <a
              key={item.id}
              href={item.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition-all border border-transparent hover:border-blue-200"
            >
              {content}
            </a>
          );
        }

        return (
          <div
            key={item.id}
            className="block p-4 bg-gray-50 rounded-lg"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
};

export default MarketNews;
