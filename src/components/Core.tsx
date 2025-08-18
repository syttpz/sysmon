import React from "react";

type CoreCardProps = {
  index: number;
  usage: number;     
  freqMHz?: number;  
};

const CoreCard = React.memo(({ index, usage, freqMHz }: CoreCardProps) => {
  const percent = Math.max(0, Math.min(100, usage));

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-2 text-xs text-gray-400">
        <span>#{index}</span>
        <span>{percent.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden mb-1">
        <div className="h-full bg-gray-300" style={{ width: `${percent}%` }} />
      </div>
      {freqMHz != null && (
        <div className="text-[11px] text-gray-400">
          {(freqMHz / 1000).toFixed(2)} GHz
        </div>
      )}
    </div>
  );
});

export default CoreCard;
