import React from 'react';

const CardContentSkeleton: React.FC = () => {
  const bar = 'bg-blackinverse-a12 animate-pulse';
  return (
    <div className="flex flex-col gap-[12px] w-full py-[16px]">
      {/* Header row */}
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-[4px] items-center">
          <div className={`h-[16px] w-[48px] rounded-[2px] ${bar}`} />
          <div className={`size-[4px] rounded-full ${bar}`} />
          <div className={`h-[16px] w-[64px] rounded-[2px] ${bar}`} />
        </div>
        <div className={`h-[16px] w-[80px] rounded-[2px] ${bar}`} />
      </div>

      {/* Two text lines */}
      <div className="flex flex-col gap-[4px] w-full">
        <div className={`h-[16px] w-full rounded-[2px] ${bar}`} />
        <div className={`h-[16px] w-[125px] rounded-[2px] ${bar}`} />
      </div>

      {/* Circle + bar */}
      <div className="flex items-center gap-[7px]">
        <div className={`size-[16px] rounded-full shrink-0 ${bar}`} />
        <div className={`h-[12px] w-[74px] rounded-[2px] ${bar}`} />
      </div>

      {/* Three text lines */}
      <div className="flex flex-col gap-[4px] w-full">
        <div className={`h-[12px] w-full rounded-[2px] ${bar}`} />
        <div className={`h-[12px] w-full rounded-[2px] ${bar}`} />
        <div className={`h-[12px] w-[125px] rounded-[2px] ${bar}`} />
      </div>

      {/* Bottom block */}
      <div className={`h-[28px] w-full rounded-[2px] ${bar}`} />
    </div>
  );
};

export default CardContentSkeleton;
