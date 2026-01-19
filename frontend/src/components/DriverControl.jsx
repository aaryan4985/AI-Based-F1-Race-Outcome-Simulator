import React from 'react';
import { Settings2 } from 'lucide-react';

export function DriverControl({ drivers, onUpdate }) {
    const handleChange = (index, field, value) => {
        const updated = [...drivers];
        updated[index] = { ...updated[index], [field]: value };
        onUpdate(updated);
    };

    return (
        <div className="p-6 rounded-xl glass space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-f1-red font-bold uppercase tracking-wider">
                    <Settings2 size={18} />
                    <h2>Strategy Configuration</h2>
                </div>
                <div className="text-xs text-white/30 uppercase tracking-widest">
                    {drivers.length} Drivers Loaded
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/20 text-white/40 uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="p-3">Grid</th>
                            <th className="p-3">Driver</th>
                            <th className="p-3 hidden sm:table-cell">Team</th>
                            <th className="p-3">Start Tyre</th>
                            <th className="p-3 text-center">Stops</th>
                            <th className="p-3 text-right">Pace Delta</th>
                            <th className="p-3 text-right">Consistency</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {drivers.map((d, i) => (
                            <tr key={d.code} className="hover:bg-white/5 transition-colors group">
                                <td className="p-3 font-mono text-white/50 w-12 text-center border-r border-white/5">{d.grid}</td>
                                <td className="p-3 font-bold flex items-center gap-2">
                                    <span className="text-white">{d.code}</span>
                                    <span className="text-[10px] text-white/30 font-normal sm:hidden">{d.team.slice(0, 3).toUpperCase()}</span>
                                </td>
                                <td className="p-3 text-white/50 text-xs hidden sm:table-cell">{d.team}</td>
                                <td className="p-3">
                                    <select
                                        value={d.start_compound}
                                        onChange={(e) => handleChange(i, 'start_compound', e.target.value)}
                                        className={`bg-black/40 text-xs py-1 px-2 rounded border border-white/10 outline-none focus:border-f1-red transition-all w-28
                                            ${d.start_compound === 'SOFT' ? 'text-red-400' :
                                                d.start_compound === 'MEDIUM' ? 'text-yellow-400' :
                                                    d.start_compound === 'HARD' ? 'text-white' : 'text-green-400'}`}
                                    >
                                        <option value="SOFT" className="text-red-400">Soft</option>
                                        <option value="MEDIUM" className="text-yellow-400">Medium</option>
                                        <option value="HARD" className="text-white">Hard</option>
                                        <option value="INTERMEDIATE" className="text-green-400">Inter</option>
                                        <option value="WET" className="text-blue-400">Wet</option>
                                    </select>
                                </td>
                                <td className="p-3 text-center">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="number"
                                            min="0" max="5"
                                            value={d.stops}
                                            onChange={(e) => handleChange(i, 'stops', parseInt(e.target.value))}
                                            className="w-12 bg-black/40 text-center text-xs py-1 rounded border border-white/10 outline-none focus:border-f1-red transition-all"
                                        />
                                    </div>
                                </td>
                                <td className="p-3 text-right">
                                    <div className="relative flex items-center justify-end gap-1">
                                        <input
                                            type="number"
                                            step="0.05"
                                            value={d.pace_delta}
                                            onChange={(e) => handleChange(i, 'pace_delta', parseFloat(e.target.value))}
                                            className={`w-16 bg-black/40 text-right text-xs py-1 px-2 rounded border border-white/10 outline-none focus:border-f1-red transition-all font-mono
                                                ${d.pace_delta < 0 ? 'text-green-400' : d.pace_delta > 0 ? 'text-red-400' : 'text-white/50'}`}
                                        />
                                        <span className="text-[10px] text-white/20">s</span>
                                    </div>
                                </td>
                                <td className="p-3 text-right">
                                    <div className="relative flex items-center justify-end gap-1">
                                        <input
                                            type="number"
                                            step="0.05"
                                            min="0"
                                            value={d.consistency !== undefined ? d.consistency : 0}
                                            onChange={(e) => handleChange(i, 'consistency', parseFloat(e.target.value))}
                                            className="w-16 bg-black/40 text-right text-xs py-1 px-2 rounded border border-white/10 outline-none focus:border-f1-red transition-all font-mono text-blue-300"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
