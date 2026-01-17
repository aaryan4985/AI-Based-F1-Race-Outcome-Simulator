import React, { useState } from 'react';
import axios from 'axios';
import { RaceSelector } from './components/RaceSelector';
import { DriverControl } from './components/DriverControl';
import { ResultsTable } from './components/ResultsTable';
import { CloudRain, PlayCircle } from 'lucide-react';

function App() {
  const [raceData, setRaceData] = useState(null);
  const [prediction, setPrediction] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRaceSelect = async (year, round) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/race/${year}/${round}`);
      setRaceData({
        ...res.data,
        drivers: res.data.drivers.sort((a, b) => a.grid - b.grid)
      });
      setPrediction([]);
    } catch (e) {
      alert("Error fetching race data");
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-f1-dark text-white p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            <span className="text-f1-red">F1</span> PREDICTOR
          </h1>
          <p className="text-white/50 text-sm">AI-Powered Race Strategy Simulator</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Controls */}
        <div className="lg:col-span-2 space-y-6">
          <RaceSelector onRaceSelect={handleRaceSelect} />

          {raceData && (
            <div className="p-6 rounded-xl glass flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${raceData.is_wet ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  <CloudRain size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Conditions</h3>
                  <p className="text-sm text-white/50">{raceData.is_wet ? 'Wet / Inter' : 'Dry'}</p>
                </div>
              </div>

              <button
                onClick={toggleWeather}
                className="text-sm underline text-white/50 hover:text-white"
              >
                Toggle Weather
              </button>
            </div>
          )}

          {raceData && (
            <div className="relative">
              <DriverControl drivers={raceData.drivers} onUpdate={handleUpdateDrivers} />

              <div className="sticky bottom-4 mt-4 flex justify-end">
                <button
                  onClick={runSimulation}
                  disabled={loading}
                  className="shadow-xl bg-f1-red hover:bg-red-600 text-white font-bold rounded-full py-4 px-8 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                  <PlayCircle size={24} />
                  {loading ? 'Simulating...' : 'Run Prediction'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-1">
          {prediction.length > 0 ? (
            <ResultsTable results={prediction} />
          ) : (
            <div className="h-full rounded-xl border border-dashed border-white/10 flex items-center justify-center text-white/20 p-8 text-center">
              {raceData ? "Ready to Simulate" : "Select a Race to Begin"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
