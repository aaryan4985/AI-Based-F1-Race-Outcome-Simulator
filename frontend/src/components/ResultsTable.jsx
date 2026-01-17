import React from 'react';
import { Flag, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export function ResultsTable({ results }) {
    if (!results.length) return null;

    return (
        <div className="p-6 rounded-xl glass space-y-4">
            <div className="flex items-center gap-2 text-f1-red font-bold uppercase tracking-wider">
                <Flag size={18} />
                <h2>Predicted Classification</h2>
            </div>

            <div className="space-y-2">
                {results.map((r, i) => (
                    <motion.div
                        key={r.code}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center p-3 bg-f1-gray/40 rounded-lg border border-white/5"
                    >
                        <div className="w-8 font-mono font-bold text-lg text-white/50">{r.predicted_rank}</div>
                        <div className="w-16 font-bold text-xl">{r.code}</div>

                        <div className="flex-1 flex items-center justify-end gap-2">
                            <span className="text-sm text-white/30 mr-4">From P{r.start_pos}</span>

                            {r.gain_loss > 0 ? (
                                <div className="flex items-center text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded">
                                    <ArrowUp size={14} />
                                    <span>{r.gain_loss}</span>
                                </div>
                            ) : r.gain_loss < 0 ? (
                                <div className="flex items-center text-red-400 font-bold bg-red-400/10 px-2 py-1 rounded">
                                    <ArrowDown size={14} />
                                    <span>{Math.abs(r.gain_loss)}</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-white/40 font-bold px-2 py-1">
                                    <Minus size={14} />
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
