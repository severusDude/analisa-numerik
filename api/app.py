from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import base64
import io

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
    data = request.get_json()

    if data is None or "provinsi" not in data:
        return jsonify({"error": "Invalid input data."}), 400

    provinsi = data["provinsi"]
    dataset = pd.read_csv("data/dummy_data.csv")
    dataset = dataset[dataset["Nama Provinsi"] == provinsi]

    if dataset.empty:
        return jsonify({"error": "Data not found for the selected province."}), 404

    # Pastikan kolom sudah sesuai dan ubah nama kolom jika perlu
    df = dataset.rename(
        columns={
            "Jumlah Penduduk (juta)": "Penduduk",
            "Pendapatan (juta IDR/kapita/tahun)": "Pendapatan",
            "Konsumsi Energi (kkal/kap/hari)": "KonsumsiEnergi",
        }
    )[["Tahun", "Penduduk", "Pendapatan", "KonsumsiEnergi"]]

    # Fungsi untuk menghitung rata-rata pertumbuhan
    def rata_pertumbuhan(data_series):
        growth_rates = []
        for i in range(1, len(data_series)):
            growth = (data_series.iloc[i] - data_series.iloc[i - 1]) / data_series.iloc[
                i - 1
            ]
            growth_rates.append(growth)
        return sum(growth_rates) / len(growth_rates), growth_rates

    # Hitung pertumbuhan
    growth_penduduk, _ = rata_pertumbuhan(df["Penduduk"])
    growth_pendapatan, _ = rata_pertumbuhan(df["Pendapatan"])

    # Estimasi 2024
    penduduk_2024 = df["Penduduk"].iloc[-1] * (1 + growth_penduduk)
    pendapatan_2024 = df["Pendapatan"].iloc[-1] * (1 + growth_pendapatan)

    print(f"Rata-rata Pertumbuhan Penduduk per tahun: {growth_penduduk * 100:.2f}%")
    print(f"Rata-rata Pertumbuhan Pendapatan per tahun: {growth_pendapatan * 100:.2f}%")
    print(f"Estimasi Penduduk 2024: {penduduk_2024:.2f} juta")
    print(f"Estimasi Pendapatan 2024: {pendapatan_2024:.2f} juta IDR/kapita/tahun")

    # Regresi Linear
    X = df[["Penduduk", "Pendapatan"]]
    y = df["KonsumsiEnergi"]

    model = LinearRegression()
    model.fit(X, y)

    # Prediksi konsumsi energi 2024
    prediksi_2024 = model.predict([[penduduk_2024, pendapatan_2024]])
    print(
        f"Prediksi Konsumsi Energi tahun 2024 untuk {provinsi}: {prediksi_2024[0]:.2f} kkal/kap/hari"
    )

    print(prediksi_2024)

    return {
        "message": "Berhasil menghitung regresi linear",
        "data": prediksi_2024[0],
        "provinsi": provinsi,
        "penduduk_2024": penduduk_2024,
        "pendapatan_2024": pendapatan_2024,
        "growth_penduduk": growth_penduduk,
        "growth_pendapatan": growth_pendapatan,
    }


if __name__ == "__main__":
    app.run(debug=True, port=5000)
