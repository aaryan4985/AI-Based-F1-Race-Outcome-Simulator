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
            <div className="flex items-center gap-2 text-f1-red font-bold uppercase tracking-wider">
                <Settings2 size={18} />
                <h2>Strategy Configuration</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-white/50 border-b border-white/10">
                        <tr>
                            <th className="p-3">POS</th>
                            <th className="p-3">DRIVER</th>
                            <th className="p-3">TEAM</th>
                            <th className="p-3">START TYRE</th>
                            <th className="p-3">STOPS</th>
                            <th className="p-3 text-right">PACE DELTA (s)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {drivers.map((d, i) => (
                            <tr key={d.code} className="hover:bg-white/5 transition-colors">
                                <td className="p-3 font-mono text-white/70">{d.grid}</td>
                                <td className="p-3 font-bold">{d.code}</td>
                                <td className="p-3 text-white/50">{d.team}</td>
                                <td className="p-3">
                                    <select
                                        value={d.start_compound}
                                        onChange={(e) => handleChange(i, 'start_compound', e.target.value)}
                                        className="bg-black/30 text-xs p-1 rounded border border-white/10 outline-none focus:border-f1-red"
                                    >
                                        <option value="SOFT">SOFT</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HARD">HARD</option>
                                        <option value="INTERMEDIATE">INTER</option>
                                        <option value="WET">WET</option>
                                    </select>
                                </td>
                                <td className="p-3">
                                    <input
                                        type="number"
                                        min="0" max="5"
                                        value={d.stops}
                                        onChange={(e) => handleChange(i, 'stops', parseInt(e.target.value))}
                                        className="w-16 bg-black/30 text-xs p-1 rounded border border-white/10 outline-none focus:border-f1-red"
                                    />
                                </td>
                                <td className="p-3 text-right">
                                    <input
                                        type="number"
                                        step="0.05"
                                        value={d.pace_delta}
                                        onChange={(e) => handleChange(i, 'pace_delta', parseFloat(e.target.value))}
                                        className="w-20 bg-black/30 text-xs p-1 rounded border border-white/10 outline-none focus:border-f1-red text-right"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
