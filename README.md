# AccuRead - AI Powered Smart Meter OCR System

An end-to-end mobile application for automated smart meter reading extraction using AI and computer vision.

## 🏆 Project Highlights

**Technical Excellence Features:**
- **Real-time AR Guide**: Camera overlay with green box alignment guide
- **Glare/Blur Detection**: Automatic quality check before capture  
- **AI-Powered OCR**: Advanced text extraction from meter displays
- **Confidence Scoring**: Reliability indicators for each reading
- **Offline Mode**: Local storage with sync when online
- **GPS Geotagging**: Location validation for fraud prevention
- **Industrial UI**: High contrast design for field workers

## 📱 Tech Stack

### Frontend (React Native + TypeScript)
- **React Native 0.82.1** with TypeScript
- **React Native Vision Camera** - Advanced camera with frame processing
- **React Navigation** - Navigation stack
- **AsyncStorage** - Offline storage
- **React Native Geolocation** - GPS services
- **Linear Gradient** - Beautiful animations
- **React Native Reanimated** - Smooth animations

### Backend (Python FastAPI)
- **FastAPI** web framework
- **OpenCV** (image processing)
- **PaddleOCR** (text extraction)
- **NumPy** (numerical operations)
- **Pillow** (image manipulation)

## 🏗️ Project Structure

```
accuread/
├── frontend/                 # ✅ Proper React Native TypeScript Project
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── CameraView.tsx        # Camera with AR overlay & quality detection
│   │   │   ├── ResultCard.tsx        # Results with confidence indicators
│   │   │   └── ProcessingScreen.tsx  # Loading with radar animations
│   │   ├── screens/          # App screens
│   │   │   └── HomeScreen.tsx        # Main camera screen
│   │   ├── services/         # API and storage services
│   │   │   ├── api.ts               # Backend API client
│   │   │   └── storage.ts           # Local storage management
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Theme and utilities
│   │   └── navigation/      # Navigation setup
│   ├── android/             # ✅ Android permissions configured
│   ├── ios/                 # iOS setup ready
│   ├── package.json         # ✅ All dependencies installed
│   └── App.tsx              # Main app component
├── backend/                 # Python FastAPI AI backend
│   ├── main.py              # FastAPI server
│   ├── ocr_engine.py        # OCR processing engine
│   ├── utils.py             # Image processing utilities
│   └── requirements.txt     # Python dependencies
├── setup.sh                 # ✅ Automated setup script
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.9+
- React Native CLI
- Android Studio / Xcode

### Automated Setup (Recommended)

```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

2. **Frontend Setup:**
```bash
cd frontend
npm install
npx react-native run-android  # or run-ios
```

## 📡 API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /extract-meter-reading` - Extract meter reading from image
- `POST /mock-extract` - Mock endpoint for testing

## 🎯 Key Features Implemented

### ✅ Frontend Features
- [x] **Proper React Native TypeScript project** (v0.82.1)
- [x] **Industrial dark theme** with high contrast
- [x] **AR Camera component** with overlay guide box
- [x] **Real-time quality indicators** (blur/glare detection)
- [x] **Processing screen** with radar animations
- [x] **Results review** with confidence scoring
- [x] **Offline storage** with AsyncStorage
- [x] **GPS geotagging** support
- [x] **Edit mode** for manual corrections
- [x] **All Android permissions** configured

### ✅ Backend Features
- [x] **FastAPI server** with CORS support
- [x] **Image preprocessing** pipeline
- [x] **OCR engine** with PaddleOCR
- [x] **Regex validation** for meter fields
- [x] **Confidence scoring** algorithm
- [x] **Mock endpoint** for testing
- [x] **Error handling** and logging

### ✅ Integration Features
- [x] **Frontend-backend API** integration
- [x] **Image upload** and processing
- [x] **Real-time quality** feedback
- [x] **Local storage** with sync capability
- [x] **Location-based** validation

## 🧪 Testing

For frontend testing without actual OCR processing, use the mock endpoint:
- URL: `http://localhost:8000/mock-extract`
- Returns predefined meter readings with high confidence scores

## 🎨 Design System

**Industrial Theme:**
- Primary: Deep Blue (#1E3A8A) - Trust & Professionalism
- Action: Safety Orange (#F97316) - Camera button, alerts
- Success: Green (#10B981) - Successful captures
- Background: Dark Gray (#111827) - High contrast
- Typography: Clean, large text for field use

## 📋 Field Types Extracted

1. **Meter Serial Number** - Alphanumeric (8-12 chars)
2. **kWh (Total Energy)** - Decimal number
3. **kVAh** - Decimal number  
4. **Maximum Demand (kW)** - Decimal number
5. **Demand kVA** - Decimal number

## 🔧 Configuration

### Backend Configuration
- Edit `main.py` to change server settings
- GPU support: Set `use_gpu=True` in `ocr_engine.py` if available
- Adjust confidence thresholds in OCR engine

### Frontend Configuration
- API URL: Change in `src/services/api.ts`
- Theme colors: Modify in `src/utils/theme.ts`
- Camera settings: Adjust in `CameraView.tsx`

## 🚀 Production Deployment

### Backend
- Use Docker containerization
- Set up proper CORS origins
- Enable GPU acceleration for OCR
- Add authentication and rate limiting

### Frontend
- Build production APK/IPA
- Configure proper app signing
- Set up crash reporting
- Add analytics and monitoring

## 🏅 Hackathon Ready

This project demonstrates:
- **Technical Excellence**: Full-stack AI implementation with proper React Native
- **Real-world Impact**: Solves actual field worker problems
- **Innovation**: AR guidance + AI OCR
- **User Experience**: Industrial design for field conditions
- **Scalability**: Offline-first architecture

**✅ Ready to win Technical Excellence!** 🏆

---

## 📞 Support

For any issues or questions:
1. Check the setup script output
2. Verify all dependencies are installed
3. Ensure Android permissions are granted
4. Test with mock endpoint first

**Built with ❤️ for Hackathon Technical Excellence**
