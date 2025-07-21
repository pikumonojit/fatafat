# Kolkata Fatafat Mobile App

A React Native Android application for Kolkata Fatafat predictions with sophisticated sequence analysis and real-time updates.

## Features

🎯 **Current Round Predictions**
- Live prediction for current/next round
- Real-time countdown to next draw
- Confidence scoring based on historical analysis

📊 **Number-wise Analysis**
- Individual probability for each number (0-9)
- Color-coded prediction grid
- Ranking system (#1 Most Likely, etc.)

🔄 **Sequence Pattern Analysis**
- Single number transitions (what follows each number)
- Pair transitions (what follows number combinations)
- Triple transitions (advanced sequence patterns)

📈 **Statistical Insights**
- Hot and cold number analysis
- Recent trend visualization
- Historical frequency data

⏰ **Accurate Timing**
- Follows real Kolkata Fatafat schedule
- Results announced every 1.5 hours starting 10:30 AM
- 8 rounds daily: 10:30, 12:00, 13:30, 15:00, 16:30, 18:00, 19:30, 21:00

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
2. **React Native CLI**
3. **Android Studio** with Android SDK
4. **Java Development Kit (JDK 11)**

## Setup Instructions

### 1. Install Dependencies

```bash
cd kolkata_fatafat_mobile
npm install
```

### 2. Configure API Connection

Edit `App.js` and update the API_BASE_URL:

```javascript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000';
```

Replace `YOUR_COMPUTER_IP` with your computer's local IP address where the Flask server is running.

### 3. Android Setup

#### Option A: Using Android Studio
1. Open Android Studio
2. Open the `android` folder as a project
3. Let Gradle sync complete
4. Connect your Android device or start an emulator
5. Click "Run" button

#### Option B: Using Command Line
```bash
# Make sure Flask server is running first
cd ../
python app.py

# In a new terminal, start Metro bundler
cd kolkata_fatafat_mobile
npx react-native start

# In another terminal, run on Android
npx react-native run-android
```

### 4. Build APK for Distribution

```bash
# Generate release APK
cd android
./gradlew assembleRelease

# APK will be generated at:
# android/app/build/outputs/apk/release/app-release.apk
```

## App Architecture

```
KolkataFatafatMobile/
├── App.js                 # Main application component
├── index.js               # Entry point
├── package.json           # Dependencies and scripts
├── babel.config.js        # Babel configuration
├── metro.config.js        # Metro bundler config
├── app.json              # App metadata
└── android/              # Android-specific files
```

## Key Components

### Main App Features
- **Real-time Data Fetching**: Connects to Flask API every 30 seconds
- **Pull-to-Refresh**: Swipe down to manually refresh data
- **Responsive Design**: Optimized for various Android screen sizes
- **Error Handling**: Graceful error messages and retry mechanisms

### Prediction Algorithm Integration
The mobile app connects to the sophisticated prediction system that includes:

1. **Historical Analysis** (25% weight)
2. **Sequence Transitions** (35% weight)
   - Single number patterns
   - Pair combinations
   - Triple sequences
3. **Recent Trends** (20% weight)
4. **Hot/Cold Analysis** (10% weight)
5. **Time-based Patterns** (8% weight)
6. **Mathematical Patterns** (3% weight)

## API Endpoints Used

- `GET /api/current-prediction` - Current round prediction
- `GET /api/number-wise-predictions` - All number probabilities
- `GET /api/statistics` - Statistical data
- `GET /api/refresh` - Refresh prediction data

## Troubleshooting

### Common Issues

1. **Metro bundler not starting**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build fails**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

3. **Network connection issues**
   - Ensure Flask server is running on your computer
   - Check if your phone and computer are on the same WiFi network
   - Update API_BASE_URL with correct IP address

4. **App crashes on startup**
   - Check if all dependencies are installed
   - Verify Android SDK is properly configured
   - Check device logs: `npx react-native log-android`

### Getting Your Computer's IP Address

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter.

**Mac/Linux:**
```bash
ifconfig
```
Look for your WiFi interface IP address.

## Performance Optimization

- **Auto-refresh**: Data updates every 30 seconds
- **Caching**: Predictions cached locally for offline viewing
- **Lazy Loading**: Components load as needed
- **Memory Management**: Efficient state management

## Security & Disclaimer

⚠️ **Important Notice:**
- This app is for entertainment and educational purposes only
- Lottery games involve financial risk
- Past results do not guarantee future outcomes
- Please play responsibly

## Support

For technical support or feature requests:
1. Check the troubleshooting section above
2. Ensure Flask server is running correctly
3. Verify network connectivity between devices

## Version History

- **v1.0.0**: Initial release with full prediction features
  - Current round predictions
  - Number-wise analysis
  - Sequence pattern recognition
  - Real-time updates
  - Android native UI
