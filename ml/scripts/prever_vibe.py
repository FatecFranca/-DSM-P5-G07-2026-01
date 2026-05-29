import joblib
import pandas as pd

model = joblib.load("../notebooks/modelos/model.pkl")
scaler = joblib.load("../notebooks/modelos/scaler.pkl")
features = joblib.load("../notebooks/modelos/features.pkl")


def predict_vibe(data):
    df = pd.DataFrame([data])

    df = df[features]

    df_scaled = scaler.transform(df)

    prediction = model.predict(df_scaled)[0]

    return prediction


if __name__ == "__main__":

    exemplo = {
        "danceability": 0.5,
        "energy": 0.2,
        "valence": 0.4,
        "acousticness": 0.1,
        "instrumentalness": 0.05,
        "speechiness": 0.05,
        "tempo": 140
    }

    vibe = predict_vibe(exemplo)

    print("Vibe prevista:", vibe)