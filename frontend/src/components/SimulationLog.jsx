import React, { useEffect, useRef } from 'react';
import { Radio, AlertCircle, CheckCircle2 } from 'lucide-react';

export function SimulationLog({ logs }) {
    const scrollRef = useRef(null);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    if (!logs || logs.length === 0) return null;

    return (
        <div className="p-6 rounded-xl glass h-full max-h-[400px] flex flex-col">
            <div className="flex items-center gap-2 text-f1-red font-bold uppercase tracking-wider mb-4">
                <Radio size={18} className="animate-pulse" />
                <h2>Race Directors Log</h2>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar"
            >
                {logs.map((log, i) => (
                    <div
                        key={i}
                        className="bg-black/30 p-3 rounded-lg border-l-2 border-f1-red text-sm flex gap-3 animate-fade-in"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        <div className="mt-0.5 min-w-[16px]">
                            {log.includes('win') ? <CheckCircle2 size={16} className="text-green-400" /> :
                                log.includes('problems') || log.includes('struggles') ? <AlertCircle size={16} className="text-orange-400" /> :
                                    <div className="w-2 h-2 rounded-full bg-white/50 mt-1.5" />}
                        </div>
                        <p className="text-white/80 leading-snug">{log}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
