import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xl">Loading map...</div>
    </div>
  ),
});

interface Polygon {
  id: string;
  nama: string;
  rw: string;
  jumlah_kk: number;
  jumlah_penduduk: number;
  ketua_rw: string;
  coordinates: [number, number][];
}

export default function Home() {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPolygons();
  }, []);

  const fetchPolygons = async () => {
    try {
      const response = await fetch("/api/polygons");
      const result = await response.json();

      if (result.success) {
        setPolygons(result.data);
      } else {
        setError("Failed to load polygons");
      }
    } catch (err) {
      setError("Error loading data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Peta Interaktif RW
          </h1>
          <Link
            href="/admin"
            className="bg-primary hover:bg-secondary text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Admin Panel
          </Link>
        </div>
      </div>

      {/* Map */}
      <div className="w-full h-full pt-16">
        <MapComponent polygons={polygons} showWhiteBackground={true} />
      </div>

      {/* Stats Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white bg-opacity-90 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {polygons.length}
              </div>
              <div className="text-sm text-gray-600">Total Area</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {polygons.reduce((sum, p) => sum + p.jumlah_kk, 0)}
              </div>
              <div className="text-sm text-gray-600">Total KK</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {polygons.reduce((sum, p) => sum + p.jumlah_penduduk, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Penduduk</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
