# AccuRead Backend

Python FastAPI backend for AI-powered smart meter OCR system.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /extract-meter-reading` - Extract meter reading from image
- `POST /mock-extract` - Mock endpoint for testing

## Testing

Use the mock endpoint for frontend testing without actual OCR processing.
