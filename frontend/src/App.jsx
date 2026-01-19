import React, { useState } from 'react';
import axios from 'axios';
import { RaceSelector } from './components/RaceSelector';
import { DriverControl } from './components/DriverControl';
import { ResultsTable } from './components/ResultsTable';
import { TyreStrategy } from './components/TyreStrategy';
import { CircuitInfo } from './components/CircuitInfo';
import { SimulationLog } from './components/SimulationLog';
import { CloudRain, PlayCircle, Gauge, Activity, Trophy } from 'lucide-react';

function App() {
  const [raceData, setRaceData] = useState(null);
  const [strategyData, setStrategyData] = useState([]);
  const [prediction, setPrediction] = useState(null); // Changed to object {classification, story}
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
      setPrediction(null);
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
      setPrediction(res.data); // Expecting { classification: [], story: [] }
    } catch (e) {
      alert("Error running simulation. Ensure backend is running and model is trained.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-f1-dark text-white p-4 md:p-6 font-sans selection:bg-f1-red selection:text-white">
      <header className="max-w-[1600px] mx-auto mb-8 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic flex items-center gap-2">
            <span className="text-f1-red">F1</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">PREDICTOR</span>
            <span className="text-xs bg-f1-red/20 text-f1-red px-2 py-0.5 rounded ml-2 not-italic tracking-normal">ULTIMATE</span>
          </h1>
          <p className="text-white/50 text-xs mt-1 flex items-center gap-2 uppercase tracking-widest">
            <Gauge size={12} /> Advanced Strategy Simulation Engine
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="font-bold text-sm text-f1-red">SEASON 2026 READY</div>
            <div className="text-[10px] text-white/30 tracking-widest uppercase">v4.0.0 Peak Edition</div>
          </div>
          <Activity className="text-f1-red animate-pulse" size={24} />
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Setup & Context (3 cols) */}
        <div className="xl:col-span-3 space-y-6">
          <RaceSelector onRaceSelect={handleRaceSelect} />

          {raceData && raceData.circuit_info && (
            <CircuitInfo info={raceData.circuit_info} />
          )}

          {raceData && (
            <div className="p-6 rounded-xl glass flex flex-col justify-center space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg transition-colors ${raceData.is_wet ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    <CloudRain size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase">Track Stat</h3>
                    <p className="text-xs text-white/50">{raceData.is_wet ? 'Wet / Inter' : 'Dry / Optimal'}</p>
                  </div>
                </div>
                <button onClick={toggleWeather} className="text-[10px] font-bold uppercase tracking-wider border border-white/20 hover:bg-white/10 px-3 py-1 rounded transition-all">
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          {raceData && (
            <button
              onClick={runSimulation}
              disabled={loading}
              className="w-full shadow-2xl shadow-f1-red/20 bg-f1-red hover:bg-red-600 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 border border-red-400/20"
            >
              <PlayCircle size={24} className={loading ? "animate-spin" : ""} />
              {loading ? 'CALCULATING...' : 'RUN SIMULATION'}
            </button>
          )}
        </div>

        {/* MIDDLE COLUMN: Data & Inputs (6 cols) */}
        <div className="xl:col-span-6 space-y-6">
          {strategyData.length > 0 && (
            <TyreStrategy strategyData={strategyData} />
          )}

          {raceData && (
            <DriverControl drivers={raceData.drivers} onUpdate={handleUpdateDrivers} />
          )}
        </div>

        {/* RIGHT COLUMN: Results & Narrative (3 cols) */}
        <div className="xl:col-span-3 space-y-6">
          {prediction ? (
            <>
              <ResultsTable results={prediction.classification} />
              <SimulationLog logs={prediction.story} />
            </>
          ) : (
            <div className="h-full min-h-[400px] rounded-xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/20 p-8 text-center bg-black/20">
              <Trophy size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Awaiting Prediction</p>
              <p className="text-xs mt-2 max-w-[200px]">Data loaded. Adjust strategy and run simulation to view results.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default App;
