import React from 'react';

/**
 * Word document icon component
 * Blue color scheme matching Microsoft Word branding
 * 80x80px size matching other file type icons
 */
export const IconDoc: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={`flex items-center justify-center w-80 h-80 bg-gray-50 rounded-12 ${className || ''}`}
    >
      <div className="text-center">
        <div className="text-[24px] mb-1">📝</div>
        <div className="bg-blue-700 text-white text-10 font-semibold px-6 py-[2px] rounded uppercase">
          DOC
        </div>
      </div>
    </div>
  );
};
