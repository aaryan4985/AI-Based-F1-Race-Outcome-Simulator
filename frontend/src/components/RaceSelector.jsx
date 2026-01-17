import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar } from 'lucide-react';

export function RaceSelector({ onRaceSelect }) {
    const [year, setYear] = useState(2023);
    const [races, setRaces] = useState([]);
    const [selectedRace, setSelectedRace] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch races for the year
        const fetchRaces = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/races/${year}`);
                setRaces(res.data);
            } catch (e) {
                console.error("Failed to fetch races", e);
            }
        };
        fetchRaces();
    }, [year]);

    const handleLoad = () => {
        if (selectedRace) {
            onRaceSelect(year, selectedRace);
        }
    };

    return (
        <div className="p-6 rounded-xl glass space-y-4">
            <div className="flex items-center gap-2 text-f1-red font-bold uppercase tracking-wider">
                <Calendar size={18} />
                <h2>Select Event</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="bg-f1-gray/50 border border-white/10 rounded-lg p-3 outline-none focus:border-f1-red"
                >
                    <option value={2023}>2023</option>
                    <option value={2022}>2022</option>
                </select>

                <select
                    value={selectedRace}
                    onChange={(e) => setSelectedRace(e.target.value)}
                    className="bg-f1-gray/50 border border-white/10 rounded-lg p-3 outline-none focus:border-f1-red"
                >
                    <option value="">Select a Race...</option>
                    {races.map(r => (
                        <option key={r.RoundNumber} value={r.RoundNumber}>
                            {r.EventName}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleLoad}
                    disabled={!selectedRace}
                    className="bg-f1-red hover:bg-red-600 text-white font-bold rounded-lg p-3 disabled:opacity-50 transition-colors"
                >
                    Load Data
                </button>
            </div>
        </div>
    );
}
