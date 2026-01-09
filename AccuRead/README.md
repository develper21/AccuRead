# 📱 AccuRead Mobile App

🎯 **Enterprise-Grade Smart Meter OCR Mobile Application**

A cutting-edge React Native + Expo application for automated smart meter reading using AI and computer vision, featuring comprehensive backend integration and 15+ advanced capabilities.

## 🛠️ Complete Technology Stack

### 📱 **Frontend Technologies**
<div align="center">

| Technology | Version | Purpose |
|------------|---------|---------|
| **⚛️ React Native** | 0.82.1 | Mobile App Framework |
| **📘 TypeScript** | Latest | Type Safety & Development |
| **📱 Expo Router** | Latest | Modern Navigation System |
| **📷 React Native Vision Camera** | Latest | Advanced Camera Processing |
| **🔥 Firebase Authentication** | Latest | User Auth & Sign-In |
| **📊 React Native Chart Kit** | Latest | Analytics Visualization |
| **📍 Expo Location** | Latest | GPS Services |
| **💾 AsyncStorage** | Latest | Offline Storage |
| **📤 React Native Share** | Latest | File Sharing |
| **📁 React Native FS** | Latest | File System Access |
| **🎵 Expo AV** | Latest | Audio Recording & Playback |
| **📱 Expo Barcode Scanner** | Latest | QR/Barcode Scanning |
| **🔐 Crypto-JS** | Latest | Data Encryption |
| **🖼️ React Native Image Resizer** | Latest | Image Compression |

</div>

### 🚀 **Backend Integration**
<div align="center">

| Technology | Purpose |
|------------|---------|
| **⚡ FastAPI** | Python Backend API |
| **🧠 PaddleOCR** | AI Text Extraction |
| **👁️ OpenCV** | Image Processing |
| **🔴 Redis** | Rate Limiting & Caching |
| **🎫 JWT** | Authentication Tokens |
| **🐳 Docker** | Backend Containerization |
| **⚙️ Uvicorn** | ASGI Server |

</div>

## 🌟 Key Features

### 🔥 **Core Features**
- **📷 Smart Camera**: Real-time AR guide with quality detection
- **🤖 AI OCR**: Advanced text extraction from meter displays
- **📍 GPS Geotagging**: Location validation & fraud prevention
- **📊 Confidence Scoring**: Reliability indicators for each reading
- **💾 Offline Mode**: Local storage with cloud sync
- **🎨 Industrial UI**: High contrast design for field workers

### 🎯 **Advanced Features**
- **🔐 Firebase Authentication**: Secure login with Google Sign-In
- **📈 Analytics Dashboard**: Reading trends & consumption charts
- **🌍 Multi-language**: 8 Indian languages (Hindi, Bengali, Telugu, etc.)
- **📤 Data Export**: CSV, Excel, PDF reports with sharing
- **📱 QR/Barcode Scanner**: Quick meter identification
- **🎤 Voice Notes**: Field comments with transcription
- **☁️ Cloud Storage**: AWS S3 & Azure integration
- **🔒 Data Encryption**: AES-256 security
- **⚡ Image Compression**: Smart optimization
- **🛡️ Rate Limiting**: API protection

## 🚀 Quick Start

### **Prerequisites**
- **Node.js 20+**
- **Expo Go app** (for development)
- **Firebase project** (for authentication)
- **Backend API** (running on http://localhost:8000)

### **Installation & Setup**

#### **1. Clone the Repository**
```bash
git clone https://github.com/develper21/AccuRead.git
cd AccuRead/AccuRead
```

#### **2. Install Dependencies**
```bash
npm install
```

#### **3. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# - Firebase configuration
# - Backend API URL
# - Cloud storage credentials
```

#### **4. Start Development Server**
```bash
# Start Expo development server
npm start

# Scan QR code with Expo Go app
# or run on simulator/device
npm run android  # or npm run ios
```

#### **5. Backend Setup (Required)**
```bash
# In another terminal
cd ../backend
pip install -r requirements.txt
python main.py
# Backend runs on http://localhost:8000
```

## 📱 App Architecture

### **Project Structure**
```
AccuRead/
├── app/                      # Expo Router file-based routing
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Camera capture screen
│   │   ├── history.tsx      # Reading history
│   │   ├── dashboard.tsx    # Analytics dashboard
│   │   └── settings.tsx     # App settings
│   ├── (auth)/              # Authentication flow
│   │   ├── login.tsx        # Login screen
│   │   └── register.tsx     # Registration
│   ├── _layout.tsx          # Root layout with theme
│   └── modal.tsx            # Global modal system
├── services/                # Core business logic
│   ├── auth.ts              # Firebase authentication
│   ├── storage.ts           # Local data management
│   ├── api.ts               # Backend communication
│   ├── cameraService.ts     # Camera operations
│   ├── ocrService.ts        # OCR processing
│   ├── locationService.ts   # GPS and geofencing
│   ├── exportService.ts     # Data export functionality
│   ├── barcodeService.ts    # QR/Barcode scanning
│   ├── voiceService.ts      # Audio recording
│   ├── cloudStorage.ts      # Cloud integration
│   ├── imageCompression.ts  # Image optimization
│   ├── encryption.ts        # Data security
│   ├── i18n.ts              # Internationalization
│   └── analyticsService.ts  # User behavior tracking
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts           # Authentication state
│   ├── useLocation.ts       # GPS location
│   ├── useTranslation.ts    # Language switching
│   ├── useCamera.ts         # Camera permissions & state
│   ├── useOfflineSync.ts    # Data synchronization
│   └── useAnalytics.ts      # Event tracking
├── components/              # Reusable UI components
│   ├── CameraView.tsx       # AR camera with overlay
│   ├── QualityIndicator.tsx # Image quality feedback
│   ├── ResultCard.tsx       # Reading display
│   ├── ExportButton.tsx     # Data export
│   ├── LanguageSelector.tsx # Multi-language support
│   ├── ThemeProvider.tsx    # Industrial theme system
│   └── ErrorBoundary.tsx    # Error handling
├── types/                   # TypeScript definitions
│   ├── index.ts            # Core data models
│   ├── api.ts              # API response types
│   ├── user.ts             # User profile types
│   └── meter.ts            # Meter reading types
├── utils/                   # Helper functions
│   ├── theme.ts            # Color scheme and styling
│   ├── validation.ts       # Input validation
│   ├── formatting.ts       # Data formatting utilities
│   └── constants.ts        # App constants
└── assets/                  # Static resources
    ├── images/             # Icons and illustrations
    ├── fonts/              # Custom typography
    └── sounds/             # Audio feedback files
```

### **Key Features Implementation**

#### **📷 Smart Camera System**
- **AR-Guided Capture**: Real-time overlay with alignment guides
- **Quality Detection**: Blur, glare, and lighting assessment
- **Frame Processing**: 30fps real-time analysis
- **Touch-to-Capture**: Automatic quality validation

#### **🤖 AI OCR Integration**
- **Backend API Communication**: RESTful API integration
- **Image Preprocessing**: Client-side optimization
- **Confidence Scoring**: Multi-factor accuracy assessment
- **Error Handling**: Comprehensive retry mechanisms

#### **💾 Offline-First Architecture**
- **Local Storage**: AsyncStorage for data persistence
- **Sync Queue**: Offline operation queuing
- **Conflict Resolution**: Smart merge strategies
- **Background Sync**: Automatic data synchronization

#### **🌍 Multi-Language Support**
- **8 Indian Languages**: Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam
- **Dynamic Switching**: Runtime language changes
- **RTL Support**: Right-to-left language readiness
- **Font Optimization**: Multi-language font loading

## 🔧 Configuration

### **Environment Variables**
```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Backend API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_WS_URL=ws://localhost:8000

# Cloud Storage Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=accuread-uploads

# App Configuration
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_BUILD_ENVIRONMENT=development
```

### **Firebase Setup**
1. **Create Firebase Project** at [Firebase Console](https://console.firebase.google.com)
2. **Enable Authentication** with Google Sign-In
3. **Configure Storage** for file uploads
4. **Download Configuration** and update environment variables

### **Backend API Integration**
The mobile app integrates with the FastAPI backend for:
- **OCR Processing**: Image upload and text extraction
- **Authentication**: JWT token validation
- **Data Sync**: Reading synchronization
- **Analytics**: Usage statistics

## 🧪 Testing

### **Unit Tests**
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### **Integration Tests**
```bash
# Run integration tests
npm run test:integration

# Test with mock backend
npm run test:mock
```

### **E2E Tests**
```bash
# Run end-to-end tests
npm run test:e2e
```

## 📱 Build & Deployment

### **Development Build**
```bash
# Build for development
npx expo export --platform web
npx expo export --platform android
```

### **Production Build**
```bash
# Build for production
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

### **Preview Build**
```bash
# Create preview build
npx eas build --platform all --profile preview
```

## 🔒 Security Implementation

### **Data Protection**
- **AES-256 Encryption**: Sensitive data encryption
- **Secure Storage**: Encrypted local storage
- **API Security**: HTTPS communication
- **Authentication**: Firebase Auth with JWT tokens

### **Privacy Features**
- **Location Privacy**: User consent for GPS
- **Data Minimization**: Collect only necessary data
- **Secure Upload**: Encrypted file transmission
- **Local Storage**: Offline data protection

## 📊 Performance Optimization

### **Image Optimization**
- **Smart Compression**: Automatic image resizing
- **Format Optimization**: JPEG for photos, PNG for graphics
- **Quality Balance**: Size vs quality optimization
- **Caching Strategy**: Intelligent image caching

### **Memory Management**
- **Resource Cleanup**: Automatic memory release
- **Background Processing**: Non-blocking operations
- **Cache Management**: Efficient storage usage
- **Performance Monitoring**: Real-time performance tracking

## 🌍 Internationalization

### **Supported Languages**
- **English** (Default)
- **हिन्दी** (Hindi)
- **বাংলা** (Bengali)
- **తెలుగు** (Telugu)
- **தமிழ்** (Tamil)
- **मराठी** (Marathi)
- **ગુજરાતી** (Gujarati)
- **ಕನ್ನಡ** (Kannada)
- **മലയാളം** (Malayalam)

### **Translation Management**
- **JSON Structure**: Organized translation files
- **Dynamic Loading**: On-demand language loading
- **Fallback Mechanism**: Graceful degradation
- **RTL Support**: Right-to-left language compatibility

## 📞 Support & Documentation

### **Documentation Links**
- **[Complete Documentation](../docs/README.md)** - Full project documentation
- **[Frontend Implementation](../docs/FRONTEND_IMPLEMENTATION.md)** - Detailed frontend guide
- **[Backend Integration](../docs/BACKEND_IMPLEMENTATION.md)** - Backend API documentation
- **[Testing Strategy](../docs/TESTING_STRATEGY.md)** - Quality assurance guide

### **Getting Help**
1. **Check Documentation** - Review implementation guides
2. **Backend Status** - Ensure backend API is running
3. **Firebase Setup** - Verify Firebase configuration
4. **Environment Variables** - Check all required variables

---

**📱 AccuRead Mobile App - Transforming Utility Operations**

*Enterprise-grade smart meter OCR solution with comprehensive backend integration*

*Last Updated: January 2026*  
*Version: 1.0*  
*Status: Production Ready*
