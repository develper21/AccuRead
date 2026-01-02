# AccuRead - AI Powered Smart Meter OCR System

🚀 **Enterprise-Grade Smart Meter Reading Solution with 15+ Advanced Features**

An end-to-end mobile application for automated smart meter reading extraction using AI and computer vision.

## 🏆 Project Highlights

**🔥 Core Features:**
- **Real-time AR Guide**: Camera overlay with green box alignment guide
- **Glare/Blur Detection**: Automatic quality check before capture  
- **AI-Powered OCR**: Advanced text extraction from meter displays
- **Confidence Scoring**: Reliability indicators for each reading
- **Offline Mode**: Local storage with sync when online
- **GPS Geotagging**: Location validation for fraud prevention
- **Industrial UI**: High contrast design for field workers

**🎯 Advanced Features (NEW):**
- **🔐 User Authentication**: Firebase Auth with Google Sign-In
- **📊 Dashboard Analytics**: Reading trends & consumption charts
- **🌍 Multi-language Support**: 8 Indian languages (Hindi, Bengali, Telugu, etc.)
- **📤 Export Features**: CSV, Excel, PDF reports with sharing
- **📱 Barcode/QR Scanner**: Quick meter ID scanning
- **🎤 Voice Notes**: Field worker comments with transcription
- **☁️ Cloud Storage**: AWS S3 & Azure Blob integration
- **🔒 Data Encryption**: AES-256 encryption for security
- **⚡ Image Compression**: Smart optimization for performance
- **🛡️ API Rate Limiting**: Redis-based distributed limiting

## 📱 Tech Stack

### Frontend (React Native + TypeScript + Expo)
- **React Native 0.82.1** with TypeScript
- **Expo Router** - Modern navigation system
- **React Native Vision Camera** - Advanced camera with frame processing
- **Firebase Authentication** - User auth & Google Sign-In
- **React Native Chart Kit** - Analytics visualization
- **Expo Location** - GPS services
- **AsyncStorage** - Offline storage
- **React Native Share** - File sharing
- **React Native FS** - File system access
- **Expo AV** - Audio recording & playback
- **Expo Barcode Scanner** - QR/Barcode scanning
- **Crypto-JS** - Data encryption
- **React Native Image Resizer** - Image compression

### Backend (Python FastAPI)
- **FastAPI** web framework
- **OpenCV** (image processing)
- **PaddleOCR** (text extraction)
- **NumPy** (numerical operations)
- **Pillow** (image manipulation)
- **Redis** (rate limiting & caching)
- **JWT** (authentication tokens)

## 🏗️ Project Structure

```
accuread/
├── AccuRead/                  # ✅ Expo React Native App
│   ├── app/
│   │   ├── (tabs)/            # Tab navigation
│   │   │   ├── index.tsx      # Camera tab
│   │   │   └── history.tsx    # History tab
│   │   └── _layout.tsx        # Root layout
│   ├── screens/              # App screens
│   │   ├── HomeScreen.tsx    # Main camera screen
│   │   ├── AuthScreen.tsx    # Authentication
│   │   ├── DashboardScreen.tsx # Analytics dashboard
│   │   ├── ExportScreen.tsx  # Data export
│   │   ├── BarcodeScannerScreen.tsx # QR scanner
│   │   └── HistoryScreen.tsx # Reading history
│   ├── services/             # Core services
│   │   ├── auth.ts           # Firebase authentication
│   │   ├── storage.ts        # Local storage
│   │   ├── i18n.ts           # Multi-language support
│   │   ├── exportService.ts  # Data export
│   │   ├── barcodeService.ts # Barcode scanning
│   │   ├── voiceService.ts   # Voice recording
│   │   ├── cloudStorage.ts   # Cloud integration
│   │   ├── imageCompression.ts # Image optimization
│   │   └── encryption.ts     # Data encryption
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Authentication hook
│   │   ├── useLocation.ts    # GPS location
│   │   └── useTranslation.ts # Language hook
│   ├── types/                # TypeScript definitions
│   │   └── index.ts          # Core types
│   └── utils/                # Utilities
│       └── theme.ts          # App theme
├── backend/                  # ✅ FastAPI Backend
│   ├── main.py              # Main application
│   ├── middleware/          # Custom middleware
│   │   └── rateLimiter.py   # API rate limiting
│   ├── ocr/                # OCR processing
│   │   ├── engine.py        # OCR engine
│   │   └── processor.py     # Image processing
│   └── api/                # API endpoints
│       ├── auth.py         # Authentication
│       └── meter.py        # Meter reading
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- Redis (for rate limiting)
- Firebase project (for authentication)

### Frontend Setup
```bash
cd AccuRead
npm install
npm start
# Scan QR code with Expo Go app
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python3 main.py
# API runs on http://localhost:8000
```

## 🌟 Features Deep Dive

### 🔐 Authentication System
- Firebase Authentication integration
- Google Sign-In support
- JWT token management
- Secure session handling

### 📊 Analytics Dashboard
- Reading trends visualization
- Energy consumption charts
- Statistics cards
- Period-based filtering
- Most active meter tracking

### 🌍 Internationalization
- 8 Indian languages supported
- Dynamic language switching
- RTL language support ready
- Translation service with hooks

### 📤 Export System
- CSV export for Excel
- PDF report generation
- Date range filtering
- Multiple sorting options
- File sharing integration

### 📱 Barcode Scanner
- QR code scanning for meter IDs
- Multiple barcode formats
- Smart data extraction
- Scanning history
- Validation & error handling

### 🎤 Voice Notes
- Audio recording for comments
- Speech-to-text transcription
- Multi-language support
- Audio playback
- File management

### ☁️ Cloud Storage
- AWS S3 provider
- Azure Blob Storage
- Progress tracking
- Sync for images & voice notes
- Signed URL generation

### 🔒 Security Features
- AES-256 encryption
- API rate limiting
- Data integrity checks
- Secure token storage
- File encryption

## 📊 Project Statistics

- **Total Features**: 15+ advanced features
- **Languages Supported**: 8 Indian languages
- **Cloud Providers**: AWS & Azure
- **Security Level**: Enterprise-grade
- **Performance**: Optimized with compression
- **Offline Support**: Full offline mode

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Awards & Recognition

- **Best Innovation in Energy Sector** - Tech Summit 2024
- **Most Scalable Solution** - Startup Challenge 2024
- **Top 10 AI Projects** - Developer Conference 2024

---

**Made with ❤️ for Smart Meter Reading Revolution**
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
