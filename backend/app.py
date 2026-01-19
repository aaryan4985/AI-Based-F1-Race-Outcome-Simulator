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
        # Try fetching from FastF1 first
        try:
            schedule = fastf1.get_event_schedule(year)
            races = schedule[schedule['EventFormat'] == 'conventional'][['RoundNumber', 'EventName', 'Location', 'Country']].to_dict('records')
        except:
            races = []
            
        # If no races found (e.g., Early 2026 or API issue), use Mock Schedule for 2026+
        if not races and year >= 2026:
            races = [
                {'RoundNumber': 1, 'EventName': 'Bahrain Grand Prix', 'Location': 'Sakhir', 'Country': 'Bahrain'},
                {'RoundNumber': 2, 'EventName': 'Saudi Arabian Grand Prix', 'Location': 'Jeddah', 'Country': 'Saudi Arabia'},
                {'RoundNumber': 3, 'EventName': 'Australian Grand Prix', 'Location': 'Melbourne', 'Country': 'Australia'},
                {'RoundNumber': 4, 'EventName': 'Japanese Grand Prix', 'Location': 'Suzuka', 'Country': 'Japan'},
                {'RoundNumber': 5, 'EventName': 'Chinese Grand Prix', 'Location': 'Shanghai', 'Country': 'China'},
                {'RoundNumber': 6, 'EventName': 'Miami Grand Prix', 'Location': 'Miami', 'Country': 'USA'},
                {'RoundNumber': 7, 'EventName': 'Emilia Romagna Grand Prix', 'Location': 'Imola', 'Country': 'Italy'},
                {'RoundNumber': 8, 'EventName': 'Monaco Grand Prix', 'Location': 'Monaco', 'Country': 'Monaco'},
                {'RoundNumber': 9, 'EventName': 'Canadian Grand Prix', 'Location': 'Montreal', 'Country': 'Canada'},
                {'RoundNumber': 10, 'EventName': 'Spanish Grand Prix', 'Location': 'Barcelona', 'Country': 'Spain'},
                # ... extend as needed or keep it simple
            ]
            
        return jsonify(races)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/race/<int:year>/<int:round_num>', methods=['GET'])
def get_race_data(year, round_num):
    try:
        # Check if we can fetch real data
        use_mock = False
        try:
            session = fastf1.get_session(year, round_num, 'R')
            # Check if session has happened by checking a date or if load fails
            # simplest is to try loading
            session.load(telemetry=False, weather=False, messages=False)
            if len(session.laps) == 0:
                use_mock = True
        except:
            use_mock = True

        if use_mock:
            # Generate Mock Data for Future/Upcoming Races
            # 2026 Projected Lineup (simplified for demo)
            mock_drivers = [
                {'code': 'VER', 'name': 'Max Verstappen', 'team': 'Red Bull Racing', 'grid': 1, 'start_compound': 'Medium'},
                {'code': 'NOR', 'name': 'Lando Norris', 'team': 'McLaren', 'grid': 2, 'start_compound': 'Medium'},
                {'code': 'LEC', 'name': 'Charles Leclerc', 'team': 'Ferrari', 'grid': 3, 'start_compound': 'Medium'},
                {'code': 'HAM', 'name': 'Lewis Hamilton', 'team': 'Ferrari', 'grid': 4, 'start_compound': 'Medium'},
                {'code': 'PIA', 'name': 'Oscar Piastri', 'team': 'McLaren', 'grid': 5, 'start_compound': 'Medium'},
                {'code': 'RUS', 'name': 'George Russell', 'team': 'Mercedes', 'grid': 6, 'start_compound': 'Medium'},
                {'code': 'SAI', 'name': 'Carlos Sainz', 'team': 'Williams', 'grid': 7, 'start_compound': 'Hard'},
                {'code': 'ALO', 'name': 'Fernando Alonso', 'team': 'Aston Martin', 'grid': 8, 'start_compound': 'Medium'},
                {'code': 'ALB', 'name': 'Alexander Albon', 'team': 'Williams', 'grid': 9, 'start_compound': 'Hard'},
                {'code': 'TSU', 'name': 'Yuki Tsunoda', 'team': 'RB', 'grid': 10, 'start_compound': 'Soft'},
            ]
            
            # Enrich with default stats
            drivers_data = []
            for d in mock_drivers:
                d['stops'] = 1
                d['pace_delta'] = float(np.random.normal(0, 0.5)) # Randomize slightly
                d['consistency'] = float(np.random.uniform(0.2, 0.8))
                drivers_data.append(d)
                
            return jsonify({
                'year': year,
                'round': round_num,
                'event': f"Round {round_num} (Simulation)",
                'is_wet': False,
                'drivers': drivers_data
            })

        # Real Data Logic (Existing)
        laps = session.laps
        results = session.results
        
        quick_laps = laps.pick_quicklaps()
        if len(quick_laps) > 0:
            field_avg = quick_laps.groupby('Team')['LapTime'].mean().dt.total_seconds().mean()
        else:
            field_avg = 90.0 # fallback

        drivers_data = []
        for drv in session.drivers:
            try:
                d_res = results.loc[drv]
                d_laps = laps.pick_driver(drv)
                
                if len(d_laps) == 0: continue
                
                stints = d_laps['Stint'].unique()
                stops = len(stints) - 1 if len(stints) > 0 else 0
                start_compound = d_laps.iloc[0]['Compound']
                
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
                    'start_compound': str(start_compound),
                    'stops': int(stops),
                    'pace_delta': float(pace_delta) if not pd.isna(pace_delta) else 0.0,
                    'consistency': float(consistency) if not pd.isna(consistency) else 0.0
                })
            except:
                continue
        
        wet_counts = laps['Compound'].value_counts()
        wet_laps = wet_counts.get('INTERMEDIATE', 0) + wet_counts.get('WET', 0)
        is_wet = bool((wet_laps / len(laps) > 0.1) if len(laps) > 0 else False)
        
        return jsonify({
            'year': year,
            'round': round_num,
            'event': session.event['EventName'],
            'is_wet': is_wet,
            'drivers': drivers_data
        })
        
    except Exception as e:
        print(f"Error in get_race_data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/race/<int:year>/<int:round_num>/strategy', methods=['GET'])
def get_strategy_data(year, round_num):
    try:
        # Try real data
        try:
            session = fastf1.get_session(year, round_num, 'R')
            session.load(telemetry=False, weather=False, messages=False)
            
            strategy_data = []
            for drv in session.drivers:
                d_laps = session.laps.pick_driver(drv)
                if len(d_laps) == 0: continue
                
                stints = []
                for stint_num in d_laps['Stint'].unique():
                    s_laps = d_laps[d_laps['Stint'] == stint_num]
                    stints.append({
                        'compound': s_laps.iloc[0]['Compound'],
                        'start_lap': int(s_laps.iloc[0]['LapNumber']),
                        'end_lap': int(s_laps.iloc[-1]['LapNumber']),
                        'color': fastf1.plotting.COMPOUND_COLORS.get(s_laps.iloc[0]['Compound'], '#ffffff')
                    })
                
                strategy_data.append({
                    'driver': drv,
                    'stints': stints
                })
            return jsonify(strategy_data)
        except:
            # Mock Strategy Data for Future/Simulated
            return jsonify([]) # Return empty for now or generate mock if critical
            
    except Exception as e:
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
