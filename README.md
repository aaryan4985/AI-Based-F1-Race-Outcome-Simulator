# F1 Race Outcome Simulator

An AI-powered F1 race predictor using historical data (FastF1) and XGBoost.

## Project Structure

- **backend/**: Python Flask API and Machine Learning model.
  - `train.py`: Fetches data from FastF1, trains the XGBoost model, and saves `f1_model.pkl`.
  - `app.py`: Serves the API for the frontend, handling race data and predictions.
- **frontend/**: React + Vite application with Tailwind CSS.
  - `src/components/`: Reusable UI components.

## How to Run

### Prerequisites
- Python 3.8+
- Node.js & npm

### One-Click Start (Windows)
Run the `start_simulator.bat` file in this directory.

### Manual Start

1. **Backend**
   ```bash
   pip install -r backend/requirements.txt
   python backend/train.py  # Run once to train model
   python backend/app.py
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Navigate to `http://localhost:5173` to use the simulator.

## Features
- **Historical Data**: Loads real race grids and results from 2023.
- **Strategy Engine**: Modify driver tyre compounds and pit stops.
- **Prediction**: Predicts final finishing positions and highlights gain/loss.
