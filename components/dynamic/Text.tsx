import React from 'react';

interface TextProps {
  content: string;
  className?: string;
}

export const Text: React.FC<TextProps> = ({ content, className = '' }) => {
  return (
    <span className={className}>
      {content}
    </span>
  );
};

export default Text;