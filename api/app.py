from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
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

    y_pred = model.predict(X)
    mse = mean_squared_error(y, y_pred)
    r2 = r2_score(y, y_pred)

    print(f"\nEvaluasi Model:")
    print(f"Mean Squared Error (MSE): {mse:.2f}")
    print(f"R-squared (R²): {r2:.4f}")

    # Buat plot dengan memanggil fungsi terpisah
    plot_base64 = generate_plot(
        provinsi=provinsi,
        historical_data=df[["Tahun", "KonsumsiEnergi"]],
        prediction_2024=float(prediksi_2024[0]),
    )

    return {
        "message": "Berhasil menghitung regresi linear",
        "data": prediksi_2024[0],
        "provinsi": provinsi,
        "penduduk_2024": penduduk_2024,
        "pendapatan_2024": pendapatan_2024,
        "growth_penduduk": growth_penduduk,
        "growth_pendapatan": growth_pendapatan,
        "plot": plot_base64,
        "galat": mse,
        "accurate": r2,
    }


def generate_plot(provinsi, historical_data, prediction_2024):
    """
    Fungsi terpisah untuk membuat plot konsumsi energi
    :param provinsi: Nama provinsi
    :param historical_data: DataFrame dengan kolom Tahun dan KonsumsiEnergi
    :param prediction_2024: Nilai prediksi untuk tahun 2024
    :return: Base64 encoded plot image
    """
    # Konversi prediksi ke float jika masih array
    if isinstance(prediction_2024, np.ndarray):
        prediction_2024 = float(prediction_2024)

    # Buat plot
    plt.figure(figsize=(10, 6))

    # Plot data historis
    plt.plot(
        historical_data["Tahun"],
        historical_data["KonsumsiEnergi"],
        marker="o",
        linestyle="-",
        color="b",
        label="Data Historis",
    )

    # Plot prediksi 2024
    plt.scatter(
        2024, prediction_2024, color="r", s=100, label="Prediksi 2024", zorder=5
    )

    # Anotasi untuk prediksi
    plt.annotate(
        f"{prediction_2024:.2f}",
        (2024, prediction_2024),
        textcoords="offset points",
        xytext=(0, 10),
        ha="center",
    )

    # Format plot
    plt.title(f"Konsumsi Energi di {provinsi} (2019-2024)")
    plt.xlabel("Tahun")
    plt.ylabel("Konsumsi Energi (kkal/kap/hari)")
    plt.legend()
    plt.grid(True)

    # Konversi plot ke base64
    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=100, bbox_inches="tight")
    buf.seek(0)
    plot_base64 = base64.b64encode(buf.read()).decode("utf-8")
    plt.close()

    return plot_base64


if __name__ == "__main__":
    app.run(debug=True, port=5000)
