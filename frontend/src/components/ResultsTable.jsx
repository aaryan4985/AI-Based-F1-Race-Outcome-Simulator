import React from 'react';
import { Flag, ArrowUp, ArrowDown, Minus, Trophy, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

export function ResultsTable({ results }) {
    if (!results.length) return null;

    // Find biggest climber
    const climber = [...results].sort((a, b) => b.gain_loss - a.gain_loss)[0];

    return (
        <div className="space-y-6">
            {/* Highlight Card */}
            {climber && climber.gain_loss > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl relative overflow-hidden group border border-f1-red/30 bg-gradient-to-br from-f1-red/20 to-black/80"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy size={64} />
                    </div>
                    <div className="relative z-10">
                        <div className="text-f1-red font-bold text-xs uppercase tracking-widest mb-1">Highest Climber</div>
                        <div className="text-3xl font-black italic">{climber.code}</div>
                        <div className="flex items-center gap-2 mt-2 text-green-400 font-bold bg-green-400/10 w-fit px-2 py-1 rounded">
                            <ArrowUp size={16} />
                            <span>+{climber.gain_loss} Positions</span>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="p-6 rounded-xl glass space-y-4">
                <div className="flex items-center justify-between text-white/50 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm">
                        <Flag size={16} />
                        <h2>Classification</h2>
                    </div>
                    <div className="text-xs uppercase tracking-widest">
                        Predicted Outcome
                    </div>
                </div>

                <div className="space-y-1">
                    {/* Header */}
                    <div className="grid grid-cols-12 text-[10px] uppercase tracking-wider text-white/30 px-3 pb-2">
                        <div className="col-span-1">Pos</div>
                        <div className="col-span-3">Driver</div>
                        <div className="col-span-2 text-center">Start</div>
                        <div className="col-span-2 text-center">Pts</div>
                        <div className="col-span-4 text-right">Gain/Loss</div>
                    </div>

                    {results.map((r, i) => (
                        <motion.div
                            key={r.code}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`grid grid-cols-12 items-center p-3 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all
                                ${i === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20' :
                                    i === 1 ? 'bg-gradient-to-r from-gray-400/10 to-transparent border-gray-400/20' :
                                        i === 2 ? 'bg-gradient-to-r from-orange-700/10 to-transparent border-orange-700/20' : ''}
                            `}
                        >
                            <div className={`col-span-1 font-mono font-bold text-lg ${i === 0 ? 'text-yellow-400' :
                                i === 1 ? 'text-gray-300' :
                                    i === 2 ? 'text-orange-400' : 'text-white/40'
                                }`}>{r.predicted_rank}</div>

                            <div className="col-span-3 font-bold text-sm tracking-wide">{r.code}</div>

                            <div className="col-span-2 text-center text-xs text-white/40 font-mono">
                                P{r.start_pos}
                            </div>

                            <div className="col-span-2 text-center text-sm font-bold text-white/80">
                                {r.points > 0 ? `+${r.points}` : '-'}
                            </div>

                            <div className="col-span-4 flex justify-end">
                                {r.gain_loss > 0 ? (
                                    <div className="flex items-center gap-1 text-green-400 font-bold text-xs bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
                                        <ArrowUp size={12} />
                                        <span>{r.gain_loss}</span>
                                    </div>
                                ) : r.gain_loss < 0 ? (
                                    <div className="flex items-center gap-1 text-red-400 font-bold text-xs bg-red-400/10 px-2 py-1 rounded border border-red-400/20">
                                        <ArrowDown size={12} />
                                        <span>{Math.abs(r.gain_loss)}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-white/20 font-bold text-xs px-2 py-1">
                                        <Minus size={12} />
                                        <span>-</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
