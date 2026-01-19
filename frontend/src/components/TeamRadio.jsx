import React, { useState, useEffect } from 'react';
import { Mic, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TeamRadio({ messages }) {
    const [queue, setQueue] = useState([]);
    const [currentMsg, setCurrentMsg] = useState(null);

    useEffect(() => {
        if (messages && messages.length > 0) {
            // Add new messages to queue if not already seen
            // Simple implementation: Just reset queue on new messages batch
            setQueue(messages);
        }
    }, [messages]);

    useEffect(() => {
        if (!currentMsg && queue.length > 0) {
            const next = queue[0];
            setCurrentMsg(next);
            setQueue(prev => prev.slice(1));

            // Auto dismiss after 5 seconds
            const timer = setTimeout(() => {
                setCurrentMsg(null);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [queue, currentMsg]);

    if (!currentMsg) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-8 right-8 z-50 max-w-sm w-full"
            >
                <div className="bg-f1-dark rounded-xl border-2 border-white/20 shadow-2xl overflow-hidden relative">
                    {/* Header */}
                    <div className="bg-black/50 p-3 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-2 text-f1-red font-bold uppercase text-xs tracking-widest animate-pulse">
                            <Mic size={14} /> Team Radio
                        </div>
                        <div className="text-xs font-bold text-white/50">{currentMsg.driver}</div>
                    </div>

                    {/* Content */}
                    <div className="p-5 relative">
                        {/* Audio Wave Visual (CSS Animation) */}
                        <div className="absolute right-4 top-4 flex gap-1 items-end h-4 opacity-50">
                            {[1, 2, 3, 4, 3, 2].map((x, i) => (
                                <div key={i} className="w-1 bg-f1-red animate-pulse" style={{ height: `${x * 20}%`, animationDuration: '0.5s', animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>

                        <p className="font-mono text-lg font-bold italic leading-tight pr-6">
                            "{currentMsg.message}"
                        </p>

                        <div className="mt-2 text-[10px] text-white/30 uppercase tracking-widest">
                            Lap: {currentMsg.lap}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
