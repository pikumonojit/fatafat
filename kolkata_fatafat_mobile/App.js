import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

const {width, height} = Dimensions.get('window');

// Configure your Flask server URL
const API_BASE_URL = 'http://192.168.1.14:5000'; // Change this to your computer's IP

const App = () => {
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [numberWisePredictions, setNumberWisePredictions] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadCurrentPrediction(),
        loadNumberWisePredictions(),
        loadStatistics(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCurrentPrediction = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/current-prediction`);
      if (response.data.success) {
        setCurrentPrediction(response.data.prediction);
      }
    } catch (error) {
      console.error('Error loading current prediction:', error);
    }
  };

  const loadNumberWisePredictions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/number-wise-predictions`);
      if (response.data.success) {
        setNumberWisePredictions(response.data.number_wise_predictions);
      }
    } catch (error) {
      console.error('Error loading number-wise predictions:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/statistics`);
      if (response.data.success) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const refreshPredictions = async () => {
    setLoading(true);
    try {
      await axios.get(`${API_BASE_URL}/api/refresh`);
      await loadAllData();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh predictions');
    }
    setLoading(false);
  };

  const renderCurrentPrediction = () => {
    if (!currentPrediction) return null;

    const statusText = currentPrediction.status === 'LIVE NOW' 
      ? `🔴 LIVE NOW - Round ${currentPrediction.draw_number}`
      : `⏰ NEXT ROUND - Round ${currentPrediction.draw_number}`;

    const timeText = currentPrediction.status === 'LIVE NOW'
      ? `Current Draw: ${currentPrediction.target_time}`
      : `Next Draw: ${currentPrediction.target_time}`;

    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.currentPredictionCard}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        
        <Text style={styles.roundStatus}>{statusText}</Text>
        <Text style={styles.roundTime}>{timeText}</Text>
        
        <View style={styles.predictionMain}>
          <View style={styles.predictionNumberLarge}>
            <Text style={styles.predictionNumberText}>
              {currentPrediction.predicted_number}
            </Text>
          </View>
          <View style={styles.predictionDetails}>
            <Text style={styles.confidenceLarge}>
              {Math.round(currentPrediction.confidence)}% Confidence
            </Text>
            <Text style={styles.methodLarge}>
              Top Prediction from Analysis
            </Text>
            {currentPrediction.time_to_next && (
              <View style={styles.countdown}>
                <Text style={styles.countdownText}>
                  Time Remaining: {currentPrediction.time_to_next}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderNumberWisePredictions = () => {
    if (!numberWisePredictions) return null;

    const probabilities = numberWisePredictions.probabilities;
    const sortedPredictions = numberWisePredictions.sorted_predictions;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="calculate" size={24} color="#667eea" />
          <Text style={styles.cardTitle}>Number-wise Predictions</Text>
        </View>
        
        <View style={styles.numberGrid}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
            const probability = probabilities[num] || 0;
            const rank = sortedPredictions.findIndex(item => item[0] === num) + 1;
            
            let itemStyle = [styles.numberItem];
            if (rank === 1) {
              itemStyle.push(styles.topPrediction);
            } else if (probability >= 15) {
              itemStyle.push(styles.highProbability);
            } else if (probability >= 8) {
              itemStyle.push(styles.mediumProbability);
            } else {
              itemStyle.push(styles.lowProbability);
            }

            return (
              <View key={num} style={itemStyle}>
                <Text style={[
                  styles.numberDisplay,
                  rank === 1 && styles.topPredictionText
                ]}>
                  {num}
                </Text>
                <Text style={[
                  styles.probabilityText,
                  rank === 1 && styles.topPredictionText
                ]}>
                  {Math.round(probability)}%
                </Text>
                <View style={styles.probabilityBar}>
                  <View 
                    style={[
                      styles.probabilityFill,
                      {width: `${probability}%`},
                      rank === 1 && styles.topPredictionFill
                    ]} 
                  />
                </View>
                <Text style={[
                  styles.rankText,
                  rank === 1 && styles.topPredictionText
                ]}>
                  #{rank}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="bar-chart" size={24} color="#667eea" />
          <Text style={styles.cardTitle}>Quick Stats</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.total_draws_analyzed}</Text>
            <Text style={styles.statLabel}>Total Draws</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.most_frequent_number}</Text>
            <Text style={styles.statLabel}>Hot Number</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.least_frequent_number}</Text>
            <Text style={styles.statLabel}>Cold Number</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.recent_trend?.length || 0}</Text>
            <Text style={styles.statLabel}>Recent Trend</Text>
          </View>
        </View>

        {statistics.recent_trend && (
          <View style={styles.trendContainer}>
            <Text style={styles.trendTitle}>Recent Results</Text>
            <View style={styles.trendBubbles}>
              {statistics.recent_trend.map((result, index) => (
                <View key={index} style={styles.trendBubble}>
                  <Text style={styles.trendBubbleText}>{result}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading && !currentPrediction) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Icon name="analytics" size={60} color="white" />
        <Text style={styles.loadingText}>Loading Predictions...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Icon name="trending-up" size={32} color="white" />
        <Text style={styles.headerTitle}>Kolkata Fatafat</Text>
        <Text style={styles.headerSubtitle}>Live Predictions</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshPredictions}
          disabled={loading}>
          <Icon name="refresh" size={20} color="white" />
          <Text style={styles.refreshButtonText}>
            {loading ? 'Refreshing...' : 'Refresh Predictions'}
          </Text>
        </TouchableOpacity>

        {renderCurrentPrediction()}
        {renderNumberWisePredictions()}
        {renderStatistics()}

        <View style={styles.disclaimer}>
          <Icon name="warning" size={16} color="white" />
          <Text style={styles.disclaimerText}>
            These predictions are for entertainment purposes only. 
            Lottery games involve risk - play responsibly.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
    marginTop: 5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  liveText: {
    color: 'white',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  refreshButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginVertical: 20,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  currentPredictionCard: {
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  roundStatus: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  roundTime: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  predictionMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  predictionNumberLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  predictionNumberText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#667eea',
  },
  predictionDetails: {
    alignItems: 'flex-start',
  },
  confidenceLarge: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  methodLarge: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 15,
  },
  countdown: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  countdownText: {
    color: 'white',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  numberItem: {
    width: (width - 80) / 5,
    aspectRatio: 1,
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  topPrediction: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  highProbability: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e8',
  },
  mediumProbability: {
    borderColor: '#FF9800',
    backgroundColor: '#fff3e0',
  },
  lowProbability: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  numberDisplay: {
    fontSize: 20,
    fontWeight: '900',
    color: '#667eea',
    marginBottom: 4,
  },
  topPredictionText: {
    color: 'white',
  },
  probabilityText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  probabilityBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginBottom: 4,
  },
  probabilityFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  topPredictionFill: {
    backgroundColor: 'white',
  },
  rankText: {
    fontSize: 8,
    opacity: 0.7,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: (width - 80) / 2,
    backgroundColor: '#f8f9ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  trendContainer: {
    marginTop: 15,
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  trendBubbles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  trendBubble: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  trendBubbleText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  disclaimer: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerText: {
    color: '#667eea',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default App;
