import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function EnergyPredictionApp() {
	const [method, setMethod] = useState("regression");
	const [x1, setX1] = useState(0); // Jumlah Penduduk
	const [x2, setX2] = useState(0); // Pendapatan per Kapita
	const [years, setYears] = useState(
		"2020,2400\n2021,2450\n2022,2500\n2023,2550\n2024,2600"
	);
	const [prediction, setPrediction] = useState("");

	const handlePredict = () => {
		if (method === "regression") {
			// Koefisien dummy dari hasil LINEST misalnya
			const intercept = 1861.696284;
			const coefX1 = 2.066805807;
			const coefX2 = 4.434248106;
			const y = intercept + coefX1 * x1 + coefX2 * x2;
			setPrediction(`${y.toFixed(2)}`);
		} else {
			// Ekstrapolasi linier berdasarkan data waktu
			const rows = years.split("\n").map((row) => row.split(",").map(Number));
			const n = rows.length;
			const last = rows[n - 1];
			const first = rows[0];
			const slope = (last[1] - first[1]) / (last[0] - first[0]);
			const predictedYear = last[0] + 1;
			const predictedY = last[1] + slope;
			setPrediction(
				`${predictedYear}: ${predictedY.toFixed(2)} kkal/kapita/hari`
			);
		}
	};

	return (
		<div className="max-w-xl mx-auto p-4 space-y-6">
			<Card>
				<CardContent className="space-y-4 pt-4">
					<Label className="text-lg font-semibold">Pilih Metode Prediksi</Label>
					<div className="flex gap-4">
						<Button
							variant={method === "regression" ? "default" : "outline"}
							onClick={() => setMethod("regression")}
						>
							Regresi Linear
						</Button>
						<Button
							variant={method === "extrapolation" ? "default" : "outline"}
							onClick={() => setMethod("extrapolation")}
						>
							Ekstrapolasi
						</Button>
					</div>

					{method === "regression" ? (
						<>
							<Label>Jumlah Penduduk (X1)</Label>
							<Input
								type="number"
								value={x1}
								onChange={(e) => setX1(Number(e.target.value))}
							/>
							<Label>Pendapatan per Kapita (X2)</Label>
							<Input
								type="number"
								value={x2}
								onChange={(e) => setX2(Number(e.target.value))}
							/>
						</>
					) : (
						<>
							<Label>Data Konsumsi Energi per Tahun (Tahun,Y)</Label>
							<textarea
								className="w-full border rounded p-2 text-sm"
								rows={5}
								value={years}
								onChange={(e) => setYears(e.target.value)}
							/>
						</>
					)}

					<Button onClick={handlePredict}>Prediksi</Button>

					{prediction && (
						<div className="mt-4 p-4 bg-green-100 rounded">
							<strong>Hasil Prediksi:</strong> {prediction} kkal/kapita/hari
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
