import React from 'react';
import { Map, MapPin, Flag } from 'lucide-react';

export function CircuitInfo({ info }) {
    if (!info) return null;

    return (
        <div className="p-6 rounded-xl glass relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-f1-red/10 to-transparent opacity-50" />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-f1-red font-bold uppercase tracking-wider text-sm mb-2">
                        <Map size={16} /> Circuit Data
                    </h3>
                    <h2 className="text-2xl font-black italic tracking-tighter max-w-[80%]">
                        {info.name}
                    </h2>
                </div>

                <div className="mt-6 flex items-center justify-between opacity-80">
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-red-400" />
                        <span>{info.location}, {info.country}</span>
                    </div>
                    <Flag size={24} className="opacity-20 rotate-12" />
                </div>
            </div>

            {/* Decorative Track Line (Abstract) */}
            <svg className="absolute right-[-20px] bottom-[-20px] w-32 h-32 opacity-10 text-white" viewBox="0 0 100 100">
                <path d="M10,50 Q30,10 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="5" />
            </svg>
        </div>
    );
}
