from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import fastf1
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load Model
MODEL_PATH = 'f1_model.pkl'
FEATURES_PATH = 'model_features.pkl'

model = None
model_features = None

if os.path.exists('cache'):
    try:
        fastf1.Cache.enable_cache('cache')
    except:
        pass # Cache might be locked or issues

def load_model():
    global model, model_features
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        model_features = joblib.load(FEATURES_PATH)
        print("Model loaded.")
    else:
        print("Model not found. Please run train.py first.")

load_model()

COMPOUND_MAP = {
    'SOFT': 1, 'MEDIUM': 2, 'HARD': 3,
    'INTERMEDIATE': 4, 'WET': 5,
    'UNKNOWN': 2
}

@app.route('/races/<int:year>', methods=['GET'])
def get_races(year):
    try:
        schedule = fastf1.get_event_schedule(year)
        # Filter strictly for standard races to avoid sprint complications for this demo
        races = schedule[schedule['EventFormat'] == 'conventional'][['RoundNumber', 'EventName', 'Location', 'Country']].to_dict('records')
        return jsonify(races)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/race/<int:year>/<int:round_num>', methods=['GET'])
def get_race_data(year, round_num):
    # Fetch actual data to populate the UI defaults
    try:
        session = fastf1.get_session(year, round_num, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        
        laps = session.laps
        results = session.results
        
        # Calculate Field Average Pace for Delta
        quick_laps = laps.pick_quicklaps()
        field_avg = quick_laps.groupby('Team')['LapTime'].mean().dt.total_seconds().mean()
        
        drivers_data = []
        for drv in session.drivers:
            try:
                d_res = results.loc[drv]
                d_laps = laps.pick_driver(drv)
                
                if len(d_laps) == 0: continue
                
                stints = d_laps['Stint'].unique()
                stops = len(stints) - 1 if len(stints) > 0 else 0
                start_compound = d_laps.iloc[0]['Compound']
                
                # Pace
                d_quick = d_laps.pick_quicklaps()
                if len(d_quick) > 0:
                    d_pace = d_quick['LapTime'].mean().total_seconds()
                    pace_delta = d_pace - field_avg
                    consistency = d_quick['LapTime'].std().total_seconds()
                else:
                    pace_delta = 0
                    consistency = 0
                    
                drivers_data.append({
                    'code': d_res['Abbreviation'],
                    'name': d_res['BroadcastName'] or d_res['FullName'],
                    'team': d_res['TeamName'],
                    'grid': int(d_res['GridPosition']),
                    'start_compound': str(start_compound), # Keep string for UI
                    'stops': int(stops),
                    'pace_delta': float(pace_delta) if not pd.isna(pace_delta) else 0.0,
                    'consistency': float(consistency) if not pd.isna(consistency) else 0.0
                })
            except:
                continue
        
        # Determine if it was a wet race (simple heuristic)
        wet_counts = laps['Compound'].value_counts()
        wet_laps = wet_counts.get('INTERMEDIATE', 0) + wet_counts.get('WET', 0)
        is_wet = bool((wet_laps / len(laps) > 0.1))
        
        return jsonify({
            'year': year,
            'round': round_num,
            'event': session.event['EventName'],
            'is_wet': is_wet,
            'drivers': drivers_data
        })
        
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not loaded'}), 503
        
    data = request.json
    # data: { drivers: [...], weather: { is_wet: bool } }
    
    drivers_input = data.get('drivers', [])
    is_wet = 1 if data.get('weather', {}).get('is_wet', False) else 0
    
    rows = []
    
    for d in drivers_input:
        # Prepare row for DataFrame
        # Features: ['GridPosition', 'StartCompound', 'Stops', 'PaceDelta', 'Consistency', 'IsWet']
        compound_val = COMPOUND_MAP.get(d['start_compound'].upper(), 2)
        
        rows.append({
            'GridPosition': d['grid'],
            'StartCompound': compound_val,
            'Stops': int(d['stops']),
            'PaceDelta': d['pace_delta'],
            'Consistency': d['consistency'],
            'IsWet': is_wet,
            'DriverCode': d['code'] # tracking
        })
        
    df = pd.DataFrame(rows)
    
    # Predict
    # Model predicts PositionDelta (Finish - Start)
    # Finish = Grid + PredDelta
    
    X = df[model_features]
    preds = model.predict(X)
    
    results = []
    for i, pred_delta in enumerate(preds):
        row = rows[i]
        predicted_pos = row['GridPosition'] + pred_delta
        results.append({
            'code': row['DriverCode'],
            'predicted_position_raw': float(predicted_pos),
            'start_pos': row['GridPosition'],
            'delta': float(pred_delta)
        })
        
    # Sort and Assign integer rank
    results.sort(key=lambda x: x['predicted_position_raw'])
    
    final_order = []
    for rank, res in enumerate(results, 1):
        res['predicted_rank'] = rank
        # Calculate actual Gain/Loss based on rank
        # Gain = Start - Finish (Positive = Good)
        res['gain_loss'] = res['start_pos'] - rank 
        final_order.append(res)
        
    return jsonify(final_order)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
