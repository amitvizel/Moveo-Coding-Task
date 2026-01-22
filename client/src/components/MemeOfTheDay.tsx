import React from 'react';

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
  if (!meme) {
    return (
      <div className="bg-white p-6 rounded-lg shadow min-h-[300px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No meme available today</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg shadow overflow-hidden h-full">
      {/* Decorative gradient background for header */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-yellow-100 via-orange-50 to-red-50 opacity-70"></div>
      
      <div className="relative p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-3 shadow-sm">
            <svg 
              className="w-5 h-5 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Meme of the Day
            </h3>
            <p className="text-xs text-gray-500">Daily dose of fun</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h4 className="font-medium text-gray-900 mb-3 text-center px-2 line-clamp-2">
            {meme.title}
          </h4>
          
          <div className="relative flex-1 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center min-h-[200px] group cursor-pointer">
            <a 
              href={meme.permalink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <img 
                src={meme.url} 
                alt={meme.title}
                className="w-full h-full object-contain max-h-[400px]"
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

          <div className="mt-3 flex justify-between items-center text-xs text-gray-500 px-1">
            <span>By u/{meme.author}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeOfTheDay;
