#!/usr/bin/env python3
"""
Kolkata Fatafat Prediction Web App
=================================

A Flask web application that provides predictions for Kolkata Fatafat
based on historical data analysis and statistical patterns.
"""

from flask import Flask, render_template, jsonify, request
import json
import numpy as np
from datetime import datetime, timedelta
import random
from collections import Counter, defaultdict
import os

app = Flask(__name__)

class FatafatPredictor:
    def __init__(self):
        self.historical_data = []
        self.analysis_cache = {}
        self.load_sample_data()
    
    def load_sample_data(self):
        """Load or generate sample historical data for predictions"""
        # Generate realistic sample data for demonstration
        self.historical_data = []
        
        # Generate last 30 days of data
        for days_back in range(30, 0, -1):
            date = datetime.now() - timedelta(days=days_back)
            
            # Generate 8 draws per day (4 on Sunday)
            num_draws = 4 if date.weekday() == 6 else 8
            
            for draw in range(1, num_draws + 1):
                # Generate realistic results with some patterns
                result = self.generate_realistic_number()
                
                self.historical_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'time': f"{9 + draw}:30",
                    'draw': draw,
                    'result': result,
                    'day_of_week': date.strftime('%A')
                })
    
    def generate_realistic_number(self):
        """Generate realistic lottery numbers with weighted probabilities"""
        # Some numbers are more common in real lottery data
        weights = [8, 12, 10, 9, 11, 13, 9, 14, 12, 10]  # 0-9
        return random.choices(range(10), weights=weights)[0]
    
    def analyze_patterns(self):
        """Analyze patterns in historical data including sequence transitions"""
        if 'patterns' in self.analysis_cache:
            return self.analysis_cache['patterns']
        
        patterns = {
            'frequency': Counter(),
            'time_patterns': defaultdict(list),
            'day_patterns': defaultdict(list),
            'recent_trends': [],
            'hot_numbers': [],
            'cold_numbers': [],
            'single_transitions': defaultdict(Counter),  # What follows each number
            'pair_transitions': defaultdict(Counter),    # What follows each pair
            'triple_transitions': defaultdict(Counter)   # What follows each triple
        }
        
        # Analyze frequency and build sequence data
        sequence_data = []
        for entry in self.historical_data:
            result = entry['result']
            patterns['frequency'][result] += 1
            patterns['time_patterns'][entry['time']].append(result)
            patterns['day_patterns'][entry['day_of_week']].append(result)
            sequence_data.append(result)
        
        # Analyze single number transitions (what comes after each number)
        for i in range(len(sequence_data) - 1):
            current_num = sequence_data[i]
            next_num = sequence_data[i + 1]
            patterns['single_transitions'][current_num][next_num] += 1
        
        # Analyze pair transitions (what comes after each pair of numbers)
        for i in range(len(sequence_data) - 2):
            pair = (sequence_data[i], sequence_data[i + 1])
            next_num = sequence_data[i + 2]
            patterns['pair_transitions'][pair][next_num] += 1
        
        # Analyze triple transitions (what comes after each triple)
        for i in range(len(sequence_data) - 3):
            triple = (sequence_data[i], sequence_data[i + 1], sequence_data[i + 2])
            next_num = sequence_data[i + 3]
            patterns['triple_transitions'][triple][next_num] += 1
        
        # Get recent trends (last 10 results)
        patterns['recent_trends'] = sequence_data[-10:] if sequence_data else []
        
        # Identify hot and cold numbers
        freq_items = patterns['frequency'].most_common()
        patterns['hot_numbers'] = [num for num, count in freq_items[:3]]
        patterns['cold_numbers'] = [num for num, count in freq_items[-3:]]
        
        self.analysis_cache['patterns'] = patterns
        return patterns
    
    def get_current_round_info(self):
        """Get information about the current round"""
        now = datetime.now()
        current_time = now.strftime('%H:%M')
        current_hour = now.hour
        current_minute = now.minute
        
        # Kolkata Fatafat schedule: 8 rounds daily, results announced every 1.5 hours
        # Round END times (when results are announced): 10:30, 12:00, 13:30, 15:00, 16:30, 18:00, 19:30, 21:00
        result_announcement_times = ["10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00"]
        
        # Find current or next draw
        current_draw = None
        next_draw_time = None
        draw_number = 0
        time_to_next = None
        
        for idx, result_time in enumerate(result_announcement_times):
            result_hour, result_minute = map(int, result_time.split(':'))
            result_total_minutes = result_hour * 60 + result_minute
            current_total_minutes = current_hour * 60 + current_minute
            
            # Check if we're before this result announcement time
            if current_total_minutes < result_total_minutes:
                next_draw_time = result_time
                draw_number = idx + 1
                minutes_diff = result_total_minutes - current_total_minutes
                time_to_next = f"{minutes_diff // 60}h {minutes_diff % 60}m" if minutes_diff >= 60 else f"{minutes_diff}m"
                break
            # Check if we're within 15 minutes after result announcement (live result period)
            elif current_total_minutes <= result_total_minutes + 15:  # 15 min window after result
                current_draw = result_time
                draw_number = idx + 1
                break
        
        # If no more draws today, show next day's first draw
        if not next_draw_time and not current_draw:
            next_draw_time = "10:30"
            draw_number = 1
            # Calculate time to tomorrow's first draw
            tomorrow = now.replace(hour=10, minute=30, second=0, microsecond=0) + timedelta(days=1)
            time_diff = tomorrow - now
            hours = time_diff.seconds // 3600
            minutes = (time_diff.seconds % 3600) // 60
            time_to_next = f"{hours}h {minutes}m"
        
        return {
            'current_time': current_time,
            'current_draw': current_draw,
            'next_draw_time': next_draw_time,
            'draw_number': draw_number,
            'time_to_next': time_to_next,
            'total_draws_today': len(result_announcement_times)
        }
    
    def get_sequence_transition_bonus(self, patterns, target_num):
        """Calculate bonus based on sequence transition patterns"""
        recent_trends = patterns['recent_trends']
        if not recent_trends:
            return 0
        
        total_bonus = 0
        
        # Single number transition (what comes after last number)
        if len(recent_trends) >= 1:
            last_num = recent_trends[-1]
            single_transitions = patterns['single_transitions'].get(last_num, Counter())
            if single_transitions:
                total_occurrences = sum(single_transitions.values())
                target_count = single_transitions.get(target_num, 0)
                if target_count > 0:
                    single_probability = (target_count / total_occurrences) * 100
                    total_bonus += single_probability * 0.3  # 30% weight for single transitions
        
        # Pair transition (what comes after last two numbers)
        if len(recent_trends) >= 2:
            last_pair = (recent_trends[-2], recent_trends[-1])
            pair_transitions = patterns['pair_transitions'].get(last_pair, Counter())
            if pair_transitions:
                total_occurrences = sum(pair_transitions.values())
                target_count = pair_transitions.get(target_num, 0)
                if target_count > 0:
                    pair_probability = (target_count / total_occurrences) * 100
                    total_bonus += pair_probability * 0.25  # 25% weight for pair transitions
        
        # Triple transition (what comes after last three numbers)
        if len(recent_trends) >= 3:
            last_triple = (recent_trends[-3], recent_trends[-2], recent_trends[-1])
            triple_transitions = patterns['triple_transitions'].get(last_triple, Counter())
            if triple_transitions:
                total_occurrences = sum(triple_transitions.values())
                target_count = triple_transitions.get(target_num, 0)
                if target_count > 0:
                    triple_probability = (target_count / total_occurrences) * 100
                    total_bonus += triple_probability * 0.2  # 20% weight for triple transitions
        
        return min(total_bonus, 35)  # Cap at 35% bonus
    
    def get_number_wise_predictions(self):
        """Calculate probability for each number (0-9) based on historical analysis including sequence patterns"""
        patterns = self.analyze_patterns()
        
        # Initialize base probabilities
        number_probabilities = {i: 5.0 for i in range(10)}  # Start with lower base (5% each)
        
        # Factor 1: Historical frequency (reduced weight to make room for sequence analysis)
        total_occurrences = sum(patterns['frequency'].values())
        if total_occurrences > 0:
            for num in range(10):
                freq = patterns['frequency'].get(num, 0)
                frequency_weight = (freq / total_occurrences) * 100
                number_probabilities[num] += frequency_weight * 0.25  # Reduced to 25% weight
        
        # Factor 2: Recent trend analysis (reduced weight)
        recent_trends = patterns['recent_trends'][-5:] if patterns['recent_trends'] else []
        for num in range(10):
            recent_count = recent_trends.count(num)
            if recent_count > 0:
                recent_bonus = (recent_count / len(recent_trends)) * 20  # Reduced to 20%
                number_probabilities[num] += recent_bonus
        
        # Factor 3: NEW - Sequence Transition Analysis (Major Factor - 35% max)
        for num in range(10):
            sequence_bonus = self.get_sequence_transition_bonus(patterns, num)
            number_probabilities[num] += sequence_bonus
        
        # Factor 4: Hot/Cold number analysis (reduced)
        hot_numbers = patterns['hot_numbers'][:3] if patterns['hot_numbers'] else []
        cold_numbers = patterns['cold_numbers'][:3] if patterns['cold_numbers'] else []
        
        for num in range(10):
            # Hot number bonus (reduced)
            if num in hot_numbers:
                number_probabilities[num] += 10
            
            # Cold number penalty (reduced)
            if num in cold_numbers:
                number_probabilities[num] -= 5
        
        # Factor 5: Time-based patterns (reduced)
        now = datetime.now()
        hour_factor = (now.hour % 10) / 10 * 8  # Reduced to 8% max influence
        for num in range(10):
            if num == (now.hour % 10):
                number_probabilities[num] += hour_factor
        
        # Factor 6: Mathematical pattern bonus (reduced)
        for num in range(10):
            if num in [1, 2, 3, 5, 8]:  # Fibonacci-like
                number_probabilities[num] += 3
        
        # Ensure minimum and maximum bounds
        for num in range(10):
            number_probabilities[num] = max(1.0, min(50.0, number_probabilities[num]))
        
        # Normalize to ensure total is approximately 100%
        total_prob = sum(number_probabilities.values())
        if total_prob > 0:
            for num in range(10):
                number_probabilities[num] = (number_probabilities[num] / total_prob) * 100
        
        # Sort by probability
        sorted_predictions = sorted(number_probabilities.items(), key=lambda x: x[1], reverse=True)
        
        # Get sequence analysis details for display
        sequence_analysis = self.get_sequence_analysis_details(patterns)
        
        return {
            'probabilities': number_probabilities,
            'sorted_predictions': sorted_predictions,
            'top_prediction': sorted_predictions[0][0],
            'top_probability': sorted_predictions[0][1],
            'sequence_analysis': sequence_analysis
        }
    
    def get_sequence_analysis_details(self, patterns):
        """Get detailed sequence analysis for display"""
        recent_trends = patterns['recent_trends']
        analysis = {
            'last_number': None,
            'last_pair': None,
            'last_triple': None,
            'single_followers': {},
            'pair_followers': {},
            'triple_followers': {}
        }
        
        if not recent_trends:
            return analysis
        
        # Last number and its most common followers
        if len(recent_trends) >= 1:
            last_num = recent_trends[-1]
            analysis['last_number'] = last_num
            single_transitions = patterns['single_transitions'].get(last_num, Counter())
            if single_transitions:
                top_followers = single_transitions.most_common(3)
                analysis['single_followers'] = {num: count for num, count in top_followers}
        
        # Last pair and its most common followers
        if len(recent_trends) >= 2:
            last_pair = (recent_trends[-2], recent_trends[-1])
            analysis['last_pair'] = last_pair
            pair_transitions = patterns['pair_transitions'].get(last_pair, Counter())
            if pair_transitions:
                top_followers = pair_transitions.most_common(3)
                analysis['pair_followers'] = {num: count for num, count in top_followers}
        
        # Last triple and its most common followers
        if len(recent_trends) >= 3:
            last_triple = (recent_trends[-3], recent_trends[-2], recent_trends[-1])
            analysis['last_triple'] = last_triple
            triple_transitions = patterns['triple_transitions'].get(last_triple, Counter())
            if triple_transitions:
                top_followers = triple_transitions.most_common(3)
                analysis['triple_followers'] = {num: count for num, count in top_followers}
        
        return analysis
    
    def get_current_prediction(self):
        """Generate prediction for current/next round only"""
        patterns = self.analyze_patterns()
        round_info = self.get_current_round_info()
        number_wise = self.get_number_wise_predictions()
        
        # Use top prediction from number-wise analysis
        prediction = number_wise['top_prediction']
        confidence = number_wise['top_probability']
        
        # Determine status
        if round_info['current_draw']:
            status = "LIVE NOW"
            target_time = round_info['current_draw']
        else:
            status = "NEXT ROUND"
            target_time = round_info['next_draw_time']
        
        return {
            'predicted_number': prediction,
            'confidence': confidence,
            'method': self.get_prediction_method(patterns, prediction),
            'status': status,
            'target_time': target_time,
            'draw_number': round_info['draw_number'],
            'time_to_next': round_info['time_to_next'],
            'round_info': round_info,
            'number_wise_predictions': number_wise
        }
    
    def calculate_smart_prediction(self, patterns, draw_offset):
        """Calculate prediction using multiple algorithms"""
        methods = []
        
        # Method 1: Frequency-based prediction
        if patterns['hot_numbers']:
            methods.append(random.choice(patterns['hot_numbers']))
        
        # Method 2: Pattern-based prediction
        recent = patterns['recent_trends']
        if len(recent) >= 3:
            # Look for patterns in recent results
            if recent[-1] == recent[-2]:  # If last two are same, predict different
                methods.append((recent[-1] + random.randint(1, 5)) % 10)
            else:
                methods.append(recent[-1])  # Follow last trend
        
        # Method 3: Mathematical sequence
        if recent:
            avg = sum(recent) / len(recent)
            methods.append(int(avg + random.randint(-2, 2)) % 10)
        
        # Method 4: Random with bias toward middle numbers
        methods.append(random.choice([2, 3, 4, 5, 6, 7]))
        
        # Choose final prediction
        if methods:
            return random.choice(methods)
        return random.randint(0, 9)
    
    def calculate_confidence(self, patterns, prediction):
        """Calculate confidence score for prediction"""
        confidence = 50  # Base confidence
        
        # Increase confidence if prediction is a hot number
        if prediction in patterns['hot_numbers']:
            confidence += 20
        
        # Increase confidence if prediction follows recent pattern
        if patterns['recent_trends'] and prediction in patterns['recent_trends'][-3:]:
            confidence += 15
        
        # Add some randomness
        confidence += random.randint(-10, 10)
        
        return min(max(confidence, 30), 85)  # Keep between 30-85%
    
    def get_prediction_method(self, patterns, prediction):
        """Get description of prediction method used"""
        if prediction in patterns['hot_numbers']:
            return "Hot Number Analysis"
        elif patterns['recent_trends'] and prediction in patterns['recent_trends'][-3:]:
            return "Recent Trend Analysis"
        else:
            return "Statistical Pattern"
    
    def get_statistics(self):
        """Get overall statistics"""
        patterns = self.analyze_patterns()
        
        total_draws = len(self.historical_data)
        
        stats = {
            'total_draws_analyzed': total_draws,
            'most_frequent_number': patterns['hot_numbers'][0] if patterns['hot_numbers'] else 0,
            'least_frequent_number': patterns['cold_numbers'][0] if patterns['cold_numbers'] else 0,
            'recent_trend': patterns['recent_trends'][-5:] if patterns['recent_trends'] else [],
            'frequency_distribution': dict(patterns['frequency'])
        }
        
        return stats

# Initialize predictor
predictor = FatafatPredictor()

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/mobile')
def mobile():
    """Mobile app page"""
    return render_template('mobile.html')

@app.route('/api/current-prediction')
def get_current_prediction():
    """API endpoint for current round prediction"""
    try:
        prediction = predictor.get_current_prediction()
        return jsonify({
            'success': True,
            'prediction': prediction,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/number-wise-predictions')
def get_number_wise_predictions():
    """API endpoint for number-wise predictions"""
    try:
        number_wise = predictor.get_number_wise_predictions()
        round_info = predictor.get_current_round_info()
        return jsonify({
            'success': True,
            'number_wise_predictions': number_wise,
            'round_info': round_info,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/statistics')
def get_statistics():
    """API endpoint for statistics"""
    try:
        stats = predictor.get_statistics()
        return jsonify({
            'success': True,
            'statistics': stats
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/refresh')
def refresh_data():
    """Refresh predictions and data"""
    try:
        # Clear cache to force new analysis
        predictor.analysis_cache = {}
        return jsonify({
            'success': True,
            'message': 'Data refreshed successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Kolkata Fatafat Prediction Server...")
    print("Access the app at: http://localhost:5000")
    # Use environment port for deployment, fallback to 5000 for local
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
