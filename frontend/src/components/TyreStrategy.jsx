import React from 'react';

export function TyreStrategy({ strategyData }) {
    if (!strategyData || strategyData.length === 0) return null;

    // Find total laps to normalize the width
    const maxLaps = Math.max(
        ...strategyData.map(d => d.stints[d.stints.length - 1]?.end_lap || 0)
    );

    return (
        <div className="p-6 rounded-xl glass space-y-4">
            <h3 className="font-bold text-xl uppercase tracking-wider flex items-center gap-2">
                <span className="text-f1-red">///</span> Tyre Strategy
            </h3>

            <div className="space-y-3 overflow-x-auto">
                <div className="min-w-[500px]">
                    {/* Header Scale */}
                    <div className="flex ml-12 text-xs text-white/30 mb-2 border-b border-white/10 pb-1">
                        {[0, 25, 50, 75, 100].map(pct => (
                            <div key={pct} style={{ width: '25%' }}>{Math.round(maxLaps * (pct / 100))} L</div>
                        ))}
                    </div>

                    {strategyData.map((driverData) => (
                        <div key={driverData.driver} className="flex items-center gap-4 group">
                            <div className="w-8 font-bold text-f1-red text-sm">{driverData.driver}</div>

                            <div className="flex-1 h-8 bg-black/40 rounded flex overflow-hidden relative">
                                {driverData.stints.map((stint, i) => {
                                    const length = stint.end_lap - stint.start_lap + 1; // inclusive
                                    const widthPct = (length / maxLaps) * 100;

                                    // Custom colors mapping if backend sends hex, or fallback
                                    let bg = stint.color;

                                    return (
                                        <div
                                            key={i}
                                            style={{ width: `${widthPct}%`, backgroundColor: bg }}
                                            className="h-full border-r border-black/50 hover:brightness-110 transition-all relative group/stint"
                                            title={`${stint.compound} (${stint.start_lap}-${stint.end_lap})`}
                                        >
                                            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-black font-bold opacity-0 group-hover/stint:opacity-60 transition-opacity">
                                                {stint.compound[0]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-4 text-xs mt-4 justify-end text-white/60">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#da291c]"></div> Soft</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#ffd12e]"></div> Medium</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full border border-white bg-white/90"></div> Hard</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#43b02a]"></div> Inter</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#0067a5]"></div> Wet</div>
            </div>
        </div>
    );
}
