"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, HelpCircle, Info, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HistoricalDataType = {
  year: number;
  consumption: number;
  isPrediction?: boolean;
};

const historicalData: HistoricalDataType[] = [
  { year: 2017, consumption: 42500 },
  { year: 2018, consumption: 45200 },
  { year: 2019, consumption: 48700 },
  { year: 2020, consumption: 46300 },
  { year: 2021, consumption: 49800 },
  { year: 2022, consumption: 52400 },
  { year: 2023, consumption: 55100 },
];

export default function DashboardUI() {
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState("linear-regression");
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<null | {
    consumption?: number;
    confidence?: number;
    growthRate?: number;
    dataPredction?: number;
    growthPendapatan?: number;
    growthPenduduk?: number;
    pendapatan_2024?: number;
    penduduk_2024?: number;
    image?: string;
    galat?: number;
    accurate?: number;
  }>(null);
  const [chartData, setChartData] = useState(historicalData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/getprovinces");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setProvinces(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handlePredict = async () => {
    if (!selectedProvince) {
      return;
    }

    setIsLoading(true);

    console.log(selectedAlgorithm);

    const url =
      selectedAlgorithm === "linear-regression"
        ? "http://127.0.0.1:5000/api/linearregression"
        : "http://127.0.0.1:5000/api/extrapolation";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provinsi: selectedProvince,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      setPredictionResult({
        dataPredction: data.data as number,
        image: data.plot,
        growthPendapatan: data.growth_penduduk,
        growthPenduduk: data.growth_pendapatan,
        accurate: data.accurate,
        galat: data.galat,
      });
    } catch (error) {
      throw new Error(`Error fetching prediction: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prediksi Konsumsi Energi</CardTitle>
          <CardDescription>
            Pilih provinsi dan algoritma prediksi untuk memperkirakan konsumsi
            energi pada tahun 2024
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="province" className="text-sm font-medium">
                  Provinsi
                </label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Pilih provinsi untuk melihat dan memprediksi konsumsi
                        energinya
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <Select
                value={selectedProvince}
                onValueChange={setSelectedProvince}
              >
                <SelectTrigger id="province" className="w-full">
                  <SelectValue placeholder="Pilih provinsi" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province: string) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="algorithm" className="text-sm font-medium">
                  Algoritma Prediksi
                </label>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Pilih algoritma yang digunakan untuk perhitungan
                        prediksi
                      </p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <Tabs
                value={selectedAlgorithm}
                onValueChange={setSelectedAlgorithm}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="linear-regression">
                    Regresi Linier
                  </TabsTrigger>
                  <TabsTrigger value="extrapolation">Ekstrapolasi</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <Button
            onClick={handlePredict}
            disabled={!selectedProvince || isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghitung...
              </>
            ) : (
              "Prediksi Konsumsi Energi"
            )}
          </Button>

          {!selectedProvince && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Bidang wajib</AlertTitle>
              <AlertDescription>
                Silakan pilih provinsi untuk melakukan prediksi.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-8">
            <h3 className="mb-4 text-lg font-medium">
              Konsumsi Historis & Prediksi
            </h3>
            <div className="h-[400px] md:h-[360px] w-full">
              {predictionResult?.image && (
                <img
                  className="w-full h-full object-contain"
                  src={`data:image/png;base64,${predictionResult?.image}`}
                  alt="Plot Konsumsi Energi"
                />
              )}
            </div>
          </div>

          {predictionResult && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Prediksi Konsumsi (2024)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-sky-600">
                    {formatNumber(predictionResult?.dataPredction!)}{" "}
                    kkal/kap/hari
                  </div>
                  <Badge className="mt-2 bg-orange-500">
                    {selectedProvince
                      ? provinces.find(
                          (p: string) => p.toLowerCase() === selectedProvince
                        )
                      : "N/A"}
                  </Badge>
                </CardContent>
              </Card>

              {selectedAlgorithm === "linear-regression" && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Tingkat Akurasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-sky-600">
                      {predictionResult?.accurate?.toFixed(3)}%
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Berdasarkan{" "}
                      {selectedAlgorithm === "linear-regression"
                        ? "Regresi Linier"
                        : "Ekstrapolasi"}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Pertumbuhan Penduduk Tahunan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-sky-600">
                    +{predictionResult?.growthPenduduk?.toFixed(3)}%
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Dibandingkan tahun 2023
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Pertumbuhan Penghasilan Tahunan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-sky-600">
                    +{predictionResult?.growthPendapatan?.toFixed(3)}%
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Dibandingkan tahun 2023
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="model-info">
              <AccordionTrigger className="text-base font-medium">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Informasi Model
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm">
                <div className="space-y-4 rounded-md bg-gray-50 p-4">
                  <div>
                    <h4 className="font-medium">Regresi Linier</h4>
                    <p className="text-gray-600">
                      Regresi linier memprediksi nilai masa depan dengan mencari
                      garis lurus terbaik yang cocok dengan data historis. Cocok
                      untuk data dengan tren konsisten dan variasi musiman yang
                      minim.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Ekstrapolasi</h4>
                    <p className="text-gray-600">
                      Ekstrapolasi memperluas tren masa lalu ke masa depan
                      dengan mempertimbangkan pola terbaru secara lebih dominan.
                      Cocok untuk menangkap percepatan atau perlambatan konsumsi
                      energi.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Ekspor ke PDF</Button>
        <Button variant="outline">Ekspor ke CSV</Button>
      </div>
    </div>
  );
}
