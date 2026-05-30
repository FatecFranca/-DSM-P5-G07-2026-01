"""
Como executar:
    uvicorn scripts.api_vibe:app --reload

Ou, se estiver dentro da pasta scripts:
    uvicorn api_vibe:app --reload

Endpoint:
    POST /predict-vibe
"""

from pathlib import Path
from typing import Dict

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "modelos" / "model.pkl"
SCALER_PATH = BASE_DIR / "modelos" / "scaler.pkl"
FEATURES_PATH = BASE_DIR / "modelos" / "features.pkl"


app = FastAPI(
    title="Music Selector - API de Vibe",
    description="API para prever a vibe musical a partir de atributos musicais.",
    version="1.0.0",
)


model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
features = joblib.load(FEATURES_PATH)


class VibeRequest(BaseModel):
    danceability: float = Field(..., ge=0, le=1)
    energy: float = Field(..., ge=0, le=1)
    valence: float = Field(..., ge=0, le=1)
    acousticness: float = Field(..., ge=0, le=1)
    instrumentalness: float = Field(..., ge=0, le=1)
    speechiness: float = Field(..., ge=0, le=1)
    tempo: float = Field(..., ge=0)


class VibeResponse(BaseModel):
    vibe: str
    scores: Dict[str, float]
    features_used: Dict[str, float]


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "Music Selector ML API está funcionando."
    }


@app.get("/features")
def get_features():
    return {
        "features": features
    }


@app.post("/predict-vibe", response_model=VibeResponse)
def predict_vibe(request: VibeRequest):
    input_data = request.model_dump()

    df = pd.DataFrame([input_data])
    df = df[features]

    df_scaled = scaler.transform(df)

    predicted_vibe = model.predict(df_scaled)[0]

    scores = {}

    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(df_scaled)[0]
        classes = model.classes_

        scores = {
            str(classes[i]): round(float(probabilities[i]), 4)
            for i in range(len(classes))
        }

    return {
        "vibe": str(predicted_vibe),
        "scores": scores,
        "features_used": input_data,
    }
