#!/usr/bin/env python3
"""
Copyright (c) 2025 develper21

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.

IMPORTANT: Removal of this header violates the license terms.
This code remains the property of develper21 and is protected
under intellectual property laws.
"""

import pytest
from fastapi.testclient import TestClient
from main import app # Assuming main.py has the 'app' instance

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert "AccuRead API" in response.json()["message"]

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "metrics" in response.json()

def test_ocr_extraction_simulation():
    # Simulate a POST request to OCR endpoint
    payload = {"image": "base64_string_here", "template_id": "standard_meter"}
    response = client.post("/extract", json=payload)
    # Even if it's a mock, we check if API structure is correct
    assert response.status_code in [200, 422] # 422 if validation fails, 200 if processed

def test_fraud_detection_api():
    response = client.post("/detect-fraud", json={"image": "test_uri"})
    data = response.json()
    assert "is_tampered" in data
    assert "liveness_score" in data
