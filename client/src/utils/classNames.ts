export const getCardClassName = (additionalClasses = '') => {
  const baseClasses = 'bg-skin-card p-6 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border-[length:var(--border-width-card)] border-skin-border transition-all duration-300';
  return additionalClasses ? `${baseClasses} ${additionalClasses}` : baseClasses;
};

export const getMemeCardClassName = (additionalClasses = '') => {
  const baseClasses = 'h-full bg-skin-card rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border-[length:var(--border-width-card)] border-skin-border transition-all duration-300 overflow-hidden';
  return additionalClasses ? `${baseClasses} ${additionalClasses}` : baseClasses;
};

export const getHeaderClassName = () => {
  return 'bg-skin-card shadow-[var(--shadow-card)] border-b-[length:var(--border-width-card)] border-skin-border transition-all duration-300 relative z-10';
};
