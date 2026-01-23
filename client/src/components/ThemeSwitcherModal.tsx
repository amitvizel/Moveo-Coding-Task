import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  const themes = [
    {
      id: 'minimal' as const,
      name: 'Minimal Finance',
      description: 'Clean, professional, and distraction-free.',
      previewBg: 'bg-gray-50',
      previewCard: 'bg-white',
      previewText: 'text-gray-900',
      previewAccent: 'bg-blue-600',
    },
    {
      id: 'neon' as const,
      name: 'Neon Trader',
      description: 'Dark mode with cyber-punk vibes.',
      previewBg: 'bg-slate-900',
      previewCard: 'bg-slate-800',
      previewText: 'text-slate-50',
      previewAccent: 'bg-cyan-500',
    },
    {
      id: 'meme' as const,
      name: 'Meme Mode',
      description: 'To the moon! 🚀 Fun and colorful.',
      previewBg: 'bg-yellow-200',
      previewCard: 'bg-white',
      previewText: 'text-violet-900',
      previewAccent: 'bg-pink-500',
    },
  ];

  const handleSelectTheme = (selectedTheme: typeof theme) => {
    setTheme(selectedTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl bg-skin-card rounded-lg shadow-xl overflow-hidden border border-skin-border">
        <div className="p-6 border-b border-skin-border flex justify-between items-center">
          <h2 className="text-2xl font-bold text-skin-text-primary">Choose Theme</h2>
          <button onClick={onClose} className="text-skin-text-muted hover:text-skin-text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTheme(t.id)}
              className={`relative group flex flex-col h-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                theme === t.id
                  ? 'border-skin-primary ring-2 ring-skin-primary ring-opacity-50'
                  : 'border-transparent hover:border-skin-border hover:shadow-lg'
              }`}
            >
              {/* Preview Area */}
              <div className={`h-24 w-full ${t.previewBg} p-3 flex items-center justify-center`}>
                <div className={`w-3/4 h-3/4 ${t.previewCard} rounded shadow-sm p-2 flex flex-col gap-2`}>
                   <div className={`w-1/2 h-2 ${t.previewText} opacity-20 rounded bg-current`}></div>
                   <div className={`w-full h-2 ${t.previewText} opacity-10 rounded bg-current`}></div>
                   <div className={`mt-auto w-1/4 h-2 ${t.previewAccent} rounded`}></div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4 bg-skin-base flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-skin-text-primary">{t.name}</h3>
                  {theme === t.id && (
                    <span className="text-skin-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-xs text-skin-text-muted">{t.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-skin-base border-t border-skin-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-skin-text-secondary hover:text-skin-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcherModal;
