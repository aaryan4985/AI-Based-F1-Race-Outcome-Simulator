import React, { useState } from 'react';
import axios from 'axios';
import { RaceSelector } from './components/RaceSelector';
import { DriverControl } from './components/DriverControl';
import { ResultsTable } from './components/ResultsTable';
import { TyreStrategy } from './components/TyreStrategy'; // Import new component
import { CloudRain, PlayCircle, Gauge, Trophy } from 'lucide-react'; // Added generic icons

function App() {
  const [raceData, setRaceData] = useState(null);
  const [strategyData, setStrategyData] = useState([]); // New state
  const [prediction, setPrediction] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRaceSelect = async (year, round) => {
    setLoading(true);
    try {
      const [raceRes, stratRes] = await Promise.all([
        axios.get(`http://localhost:5000/race/${year}/${round}`),
        axios.get(`http://localhost:5000/race/${year}/${round}/strategy`)
      ]);

      setRaceData({
        ...raceRes.data,
        drivers: raceRes.data.drivers.sort((a, b) => a.grid - b.grid)
      });
      setStrategyData(stratRes.data);
      setPrediction([]);
    } catch (e) {
      alert("Error fetching race data");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDrivers = (updatedDrivers) => {
    setRaceData(prev => ({ ...prev, drivers: updatedDrivers }));
  };

  const toggleWeather = () => {
    setRaceData(prev => ({ ...prev, is_wet: !prev.is_wet }));
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const payload = {
        drivers: raceData.drivers,
        weather: { is_wet: raceData.is_wet }
      };

      const res = await axios.post('http://localhost:5000/predict', payload);
      setPrediction(res.data);
    } catch (e) {
      alert("Error running simulation. Ensure backend is running and model is trained.");
    } finally {
      setLoading(false); // Fix: Ensure loading is off after prediction
    }
  };

  return (
    <div className="min-h-screen bg-f1-dark text-white p-4 md:p-8 font-sans selection:bg-f1-red selection:text-white">
      <header className="max-w-7xl mx-auto mb-10 flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic flex items-center gap-2">
            <span className="text-f1-red">F1</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">PREDICTOR</span>
          </h1>
          <p className="text-white/50 text-sm mt-1 flex items-center gap-2">
            <Gauge size={14} /> AI-Powered Race Strategy Simulator
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="font-bold text-sm">SEASON 2026 READY</div>
            <div className="text-xs text-white/40">v3.0.0</div>
          </div>
          <Trophy className="text-f1-red" size={32} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls & Input */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RaceSelector onRaceSelect={handleRaceSelect} />

            {raceData && (
              <div className="p-6 rounded-xl glass flex flex-col justify-center space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg transition-colors ${raceData.is_wet ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      <CloudRain size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold">Track Conditions</h3>
                      <p className="text-sm text-white/50">{raceData.is_wet ? 'Wet / Intermediate' : 'Dry Conditions'}</p>
                    </div>
                  </div>
                  <button onClick={toggleWeather} className="text-xs font-bold uppercase tracking-wider border border-white/20 hover:bg-white/10 px-3 py-1 rounded transition-all">
                    Toggle
                  </button>
                </div>

                <div className="h-px bg-white/10 w-full" />

                <div className="flex justify-between items-center px-2">
                  <div className="text-sm text-white/50">Laps</div>
                  <div className="font-mono font-bold">57</div>
                </div>
              </div>
            )}
          </div>

          {strategyData.length > 0 && (
            <TyreStrategy strategyData={strategyData} />
          )}

          {raceData && (
            <div className="relative">
              <DriverControl drivers={raceData.drivers} onUpdate={handleUpdateDrivers} />

              <div className="sticky bottom-6 mt-6 flex justify-end z-10">
                <button
                  onClick={runSimulation}
                  disabled={loading}
                  className="shadow-2xl shadow-f1-red/20 bg-f1-red hover:bg-red-600 text-white font-bold rounded-full py-4 px-10 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 border border-red-400/20"
                >
                  <PlayCircle size={24} className={loading ? "animate-spin" : ""} />
                  {loading ? 'Simulating Race...' : 'Run Prediction'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 space-y-6">
            {prediction.length > 0 ? (
              <ResultsTable results={prediction} />
            ) : (
              <div className="h-64 rounded-xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/20 p-8 text-center bg-black/20">
                <Trophy size={48} className="mb-4 opacity-20" />
                <p className="font-bold">Ready to Simulate</p>
                <p className="text-sm mt-2">Select a race and configure drivers to see predictions.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
