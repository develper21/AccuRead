# AccuRead Mobile App 📱

🚀 **Enterprise Smart Meter OCR Mobile Application**

## 📱 About

AccuRead is a cutting-edge React Native + Expo application for automated smart meter reading using AI and computer vision. Built with TypeScript and featuring 15+ advanced capabilities.

## 🌟 Key Features

### 🔥 Core Features
- **📷 Smart Camera**: Real-time AR guide with quality detection
- **🤖 AI OCR**: Advanced text extraction from meter displays
- **📍 GPS Geotagging**: Location validation & fraud prevention
- **📊 Confidence Scoring**: Reliability indicators for each reading
- **💾 Offline Mode**: Local storage with cloud sync
- **🎨 Industrial UI**: High contrast design for field workers

### 🎯 Advanced Features
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

## 🛠 Tech Stack

- **React Native 0.82.1** + **TypeScript**
- **Expo Router** - Modern navigation
- **Firebase Auth** - Authentication
- **React Native Vision Camera** - Advanced camera
- **React Native Chart Kit** - Analytics
- **Expo Location** - GPS services
- **AsyncStorage** - Offline storage
- **React Native Share** - File sharing
- **Expo AV** - Audio recording
- **Expo Barcode Scanner** - QR/Barcode
- **Crypto-JS** - Encryption
- **React Native Image Resizer** - Compression

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Expo Go app (for development)
- Firebase project (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AccuRead
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npx expo start
   ```

4. **Run on device**
   - Scan QR code with Expo Go app
   - Or use Android emulator/iOS simulator

## 📁 Project Structure

```
AccuRead/
├── app/                     # Expo Router file-based routing
│   ├── (tabs)/             # Tab navigation
│   │   ├── index.tsx       # Camera tab (main feature)
│   │   └── history.tsx     # Reading history
│   └── _layout.tsx         # Root layout
├── screens/                # App screens
│   ├── HomeScreen.tsx      # Main camera interface
│   ├── AuthScreen.tsx      # Authentication
│   ├── DashboardScreen.tsx # Analytics dashboard
│   ├── ExportScreen.tsx    # Data export
│   ├── BarcodeScannerScreen.tsx # QR scanner
│   └── HistoryScreen.tsx   # Reading history
├── services/               # Core business logic
│   ├── auth.ts            # Firebase authentication
│   ├── storage.ts         # Local storage management
│   ├── i18n.ts            # Multi-language support
│   ├── exportService.ts   # Data export functionality
│   ├── barcodeService.ts  # Barcode scanning
│   ├── voiceService.ts    # Voice recording
│   ├── cloudStorage.ts    # Cloud integration
│   ├── imageCompression.ts # Image optimization
│   └── encryption.ts      # Data encryption
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts         # Authentication state
│   ├── useLocation.ts     # GPS location
│   └── useTranslation.ts  # Language switching
├── types/                 # TypeScript definitions
│   └── index.ts           # Core data types
├── utils/                 # Utilities
│   └── theme.ts           # App theme & colors
├── package.json           # Dependencies & scripts
├── app.json              # Expo configuration
├── tsconfig.json         # TypeScript setup
└── README.md             # This file
```

## 🔧 Configuration

### Firebase Setup
1. Create Firebase project
2. Enable Authentication & Google Sign-In
3. Add Firebase config to `services/auth.ts`

### Environment Variables
Create `.env` file:
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## 📱 App Usage

### 1. Authentication
- Login with email/password
- Google Sign-In option
- Secure session management

### 2. Camera & OCR
- Point camera at meter display
- AR guide helps with alignment
- Automatic quality check
- AI extracts reading data

### 3. Dashboard
- View reading trends
- Energy consumption charts
- Statistics and insights
- Period-based filtering

### 4. Export Data
- CSV for Excel analysis
- PDF reports for sharing
- Date range selection
- Multiple sorting options

### 5. Advanced Features
- Scan QR codes for meter IDs
- Record voice notes
- Multi-language support
- Cloud sync and backup

## 🌍 Supported Languages

- **English** (en-US)
- **Hindi** (hi-IN)
- **Bengali** (bn-IN)
- **Telugu** (te-IN)
- **Marathi** (mr-IN)
- **Tamil** (ta-IN)
- **Gujarati** (gu-IN)
- **Punjabi** (pa-IN)

## 🔒 Security Features

- **AES-256 Encryption**: Sensitive data protection
- **Secure Authentication**: Firebase Auth integration
- **API Rate Limiting**: Prevent abuse
- **Data Integrity**: Validation and checksums
- **Secure Storage**: Encrypted local storage

## 📊 Performance

- **Image Compression**: Smart optimization
- **Lazy Loading**: Efficient memory usage
- **Background Sync**: Seamless data sync
- **Caching**: Improved response times
- **Offline Support**: Full offline capability

## 🛠 Development

### Scripts
```bash
npm start          # Start development server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web
npm test            # Run tests
```

### Code Quality
- TypeScript for type safety
- ESLint for code formatting
- Prettier for consistent style
- Husky for git hooks

## 📱 Platform Support

- **Android**: Full support with camera permissions
- **iOS**: Full support with camera permissions
- **Web**: Limited support (no camera)
- **Expo Go**: Development and testing

## 🔧 Troubleshooting

### Common Issues
1. **Camera not working**: Check permissions
2. **Firebase auth failing**: Verify configuration
3. **OCR not accurate**: Ensure good lighting
4. **Export failing**: Check storage permissions

### Debug Mode
Enable debug mode in `app.json`:
```json
{
  "expo": {
    "debug": true
  }
}
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit your changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check documentation
- Join our Discord community

---

**Built with ❤️ using Expo & React Native**
