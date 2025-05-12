from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import base64
import io

from main import rata_pertumbuhan

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

with app.app_context():
    global dataset
    try:
        url = "dataset.csv"
        dataset = pd.read_csv(url)

        # Check for null values
        null_counts = dataset.isnull().sum()
        if null_counts.sum() > 0:
            print("Warning: Dataset contains null values:", null_counts)

    except Exception as e:
        print(f"Error loading dataset: {e}")

@app.route("/api/getprovinces", methods=["GET"])
def get_provinces():
    return dataset["provinsi"].unique().tolist()

@app.route("/api/linearregression", methods=["POST"])
def linear_regression():
    # Hitung pertumbuhan dan simpan dalam persen
    growth_penduduk, growth_list_penduduk = rata_pertumbuhan(dataset['jumlahpenduduk'])
    growth_pendapatan, growth_list_pendapatan = rata_pertumbuhan(dataset['pendapatan'])

    growth_penduduk_pct = growth_penduduk * 100
    growth_pendapatan_pct = growth_pendapatan * 100

    # Estimasi nilai tahun 2024
    penduduk_2024 = dataset['jumlahpenduduk'].iloc[-1] * (1 + growth_penduduk)
    pendapatan_2024 = dataset['pendapatan'].iloc[-1] * (1 + growth_pendapatan)

    # Model Regresi Linear
    X = dataset[['jumlahpenduduk', 'pendapatan']]
    y = dataset['konsumsienergi']

    model = LinearRegression()
    model.fit(X, y)

    # Prediksi konsumsi energi tahun 2024
    prediksi_2024 = model.predict([[penduduk_2024, pendapatan_2024]])

    return prediksi_2024[0]

if __name__ == "__main__":
    app.run(debug=True, port=5000)
