import React from "react";

type CoreCardProps = {
  index: number;
  usage: number;     
  freqMHz?: number;  
};

const CoreCard = React.memo(({ index, usage, freqMHz }: CoreCardProps) => {
  const percent = Math.max(0, Math.min(100, usage));

  return (
    <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/50">
      <div className="flex justify-between items-center mb-2 text-xs text-slate-400">
        <span>#{index}</span>
        <span>{percent.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full rounded bg-slate-800 overflow-hidden mb-1">
        <div
          className="h-full bg-slate-200"
          style={{ width: `${percent}%` }}
        />
      </div>
      {Number.isFinite(freqMHz) && (
        <div className="text-[11px] text-slate-400">
          {(freqMHz! / 1000).toFixed(2)} GHz
        </div>
      )}
    </div>
  );
});

export default CoreCard;
