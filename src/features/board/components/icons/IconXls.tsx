import React from 'react';

/**
 * Excel file icon placeholder component
 * TODO: Replace with actual Figma icon design
 * Figma reference: https://www.figma.com/design/DjwUE4wL1Jd0CH3vTPPebE/%E2%9C%8F%EF%B8%8F-Diary?node-id=1138-30152&m=dev
 */
export const IconXls: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={`flex items-center justify-center w-80 h-80 bg-gray-50 rounded-12 ${className || ''}`}
    >
      <div className="text-center">
        <div className="text-[24px] mb-1">📊</div>
        <div className="bg-green-600 text-white text-10 font-semibold px-6 py-[2px] rounded uppercase">
          XLS
        </div>
      </div>
    </div>
  );
};
