# AccuRead Backend API 🚀

🔥 **Enterprise AI-Powered Smart Meter OCR Backend**

## 📋 About

High-performance Python FastAPI backend for AccuRead smart meter OCR system. Features advanced AI processing, real-time rate limiting, and enterprise-grade security.

## 🌟 Key Features

### 🤖 AI & OCR
- **Advanced OCR Engine**: PaddleOCR with OpenCV integration
- **Image Processing**: Automatic quality enhancement
- **Confidence Scoring**: Reliability metrics for readings
- **Multi-format Support**: Various meter types supported
- **Batch Processing**: Handle multiple images efficiently

### 🛡️ Security & Performance
- **API Rate Limiting**: Redis-based distributed limiting
- **JWT Authentication**: Secure token-based auth
- **Data Encryption**: AES-256 encryption for sensitive data
- **Input Validation**: Comprehensive security checks
- **CORS Support**: Cross-origin resource sharing

### 📊 Analytics & Monitoring
- **Request Logging**: Detailed audit trails
- **Performance Metrics**: Response time tracking
- **Error Handling**: Comprehensive error reporting
- **Health Checks**: System status monitoring

## 🛠 Tech Stack

- **FastAPI** - Modern Python web framework
- **OpenCV** - Computer vision & image processing
- **PaddleOCR** - Advanced OCR engine
- **NumPy** - Numerical computations
- **Pillow** - Image manipulation
- **Redis** - Rate limiting & caching
- **JWT** - Authentication tokens
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Redis server
- GPU (optional, for faster OCR)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start Redis server**
   ```bash
   redis-server
   ```

5. **Run the application**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── middleware/             # Custom middleware
│   └── rateLimiter.py     # API rate limiting
├── ocr/                   # OCR processing modules
│   ├── engine.py          # OCR engine core
│   └── processor.py       # Image preprocessing
├── api/                   # API endpoints
│   ├── auth.py           # Authentication endpoints
│   ├── meter.py          # Meter reading endpoints
│   └── health.py         # Health check endpoints
├── models/                # Data models
│   ├── meter.py          # Meter reading models
│   └── user.py           # User models
├── utils/                 # Utility functions
│   ├── image.py          # Image processing utils
│   ├── encryption.py     # Data encryption
│   └── logger.py         # Logging configuration
├── config/                # Configuration files
│   ├── settings.py       # App settings
│   └── database.py       # Database config
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# JWT Configuration
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# OCR Configuration
OCR_MODEL_PATH=models/ocr
OCR_CONFIDENCE_THRESHOLD=0.8
GPU_ENABLED=true

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=AccuRead Backend
DEBUG=false
```

### Redis Setup
```bash
# Install Redis
sudo apt-get install redis-server  # Ubuntu
brew install redis                 # macOS

# Start Redis
redis-server

# Test Redis
redis-cli ping
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout

### Meter Reading
- `POST /api/v1/meter/extract` - Extract reading from image
- `GET /api/v1/meter/history` - Get reading history
- `POST /api/v1/meter/save` - Save meter reading
- `GET /api/v1/meter/stats` - Get statistics

### Data Export
- `POST /api/v1/export/csv` - Export CSV data
- `POST /api/v1/export/pdf` - Export PDF report
- `GET /api/v1/export/status` - Export status

### Health & Monitoring
- `GET /health` - Health check
- `GET /metrics` - Performance metrics
- `GET /status` - System status

## 🔄 Rate Limiting

### Rate Limits by Endpoint
- **Default**: 100 requests/minute
- **OCR**: 30 requests/minute
- **Auth**: 5 requests/5 minutes
- **Export**: 3 requests/5 minutes
- **Admin**: 200 requests/minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
Retry-After: 60
```

## 🤖 OCR Processing

### Supported Meter Types
- **Digital Meters**: LED/LCD displays
- **Analog Meters**: Dial-based meters
- **Smart Meters**: Digital with communication
- **Hybrid Meters**: Combination displays

### Image Requirements
- **Format**: JPEG, PNG, BMP
- **Size**: Minimum 640x480 pixels
- **Quality**: Clear, well-lit images
- **Angle**: Straight-on view preferred

### Processing Pipeline
1. **Image Preprocessing**
   - Noise reduction
   - Contrast enhancement
   - Perspective correction
   - Glare removal

2. **Text Detection**
   - Region of interest detection
   - Text area identification
   - Character segmentation

3. **OCR Recognition**
   - Character recognition
   - Number extraction
   - Confidence scoring

4. **Post Processing**
   - Result validation
   - Format standardization
   - Error correction

## 📊 Response Format

### Successful Response
```json
{
  "success": true,
  "data": {
    "serialNumber": "ABC123456789",
    "reading": "1450.5",
    "unit": "kWh",
    "confidence": 0.95,
    "timestamp": "2024-01-01T12:00:00Z",
    "location": {
      "latitude": 28.6139,
      "longitude": 77.2090
    }
  },
  "message": "Meter reading extracted successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "OCR_ERROR",
    "message": "Unable to extract meter reading",
    "details": "Image quality too low"
  }
}
```

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Token expiration handling
- Refresh token mechanism
- Secure password hashing

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

### Rate Limiting
- Redis-based distributed limiting
- User-specific limits
- IP-based blocking
- Admin override capabilities

## 📈 Performance

### Optimization Features
- **Image Caching**: Redis-based caching
- **Batch Processing**: Handle multiple requests
- **GPU Acceleration**: CUDA support for OCR
- **Connection Pooling**: Database connection reuse
- **Async Processing**: Non-blocking operations

### Benchmarks
- **OCR Processing**: ~2 seconds per image
- **API Response**: <500ms average
- **Concurrent Users**: 1000+ supported
- **Throughput**: 1000+ requests/minute

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t accuread-backend .
```

### Run with Docker
```bash
docker run -p 8000:8000 accuread-backend
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - REDIS_HOST=redis
    depends_on:
      - redis
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests
pytest tests/unit/

# Integration tests
pytest tests/integration/

# Performance tests
pytest tests/performance/

# Coverage report
pytest --cov=. tests/
```

### Test Categories
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability scanning

## 📝 Logging

### Log Levels
- `DEBUG`: Detailed debugging information
- `INFO`: General information messages
- `WARNING`: Warning messages
- `ERROR`: Error messages
- `CRITICAL`: Critical errors

### Log Format
```
2024-01-01 12:00:00,000 - INFO - Request processed successfully
2024-01-01 12:00:01,000 - ERROR - OCR processing failed
```

## 🔧 Troubleshooting

### Common Issues
1. **Redis Connection Failed**
   - Check Redis server status
   - Verify connection settings
   - Check network connectivity

2. **OCR Processing Slow**
   - Enable GPU acceleration
   - Optimize image size
   - Check system resources

3. **Memory Issues**
   - Increase system RAM
   - Optimize image processing
   - Enable garbage collection

### Debug Mode
Enable debug mode:
```bash
export DEBUG=true
python main.py
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check API documentation
- Review troubleshooting guide

---

**Built with ❤️ using FastAPI & Python**

## Testing

Use the mock endpoint for frontend testing without actual OCR processing.
