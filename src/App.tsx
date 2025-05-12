import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardUI from "./components/DashboardUI";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Sistem Prediksi Konsumsi Energi
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Prediksi konsumsi energi untuk tahun 2024 berdasarkan data historis
          </p>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardUI />
        </Suspense>
      </div>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
