import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MapViewMode } from "@/components/MapComponent";
import borderData from "@/data/border.json";
import RwDetailSidebar from "@/components/RwDetailSidebar";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-100 dark:bg-slate-900">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Memuat peta...</span>
      </div>
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
  jumlah_rt: number;
  jumlah_mesjid: number;
  coordinates: [number, number][];
}

const POLYGON_COLORS = [
  "#EF4444",
  "#14B8A6",
  "#EAB308",
  "#3B82F6",
  "#8B5CF6",
  "#F97316",
  "#22C55E",
];

export default function Home() {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(
    null,
  );
  const [activeRw, setActiveRw] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<MapViewMode>("polygons");

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
        setError("Gagal memuat data polygon");
      }
    } catch (err) {
      setError("Error loading data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Group polygons by RW for sidebar
  const rwGroups = useMemo(() => {
    const groups: Record<string, Polygon[]> = {};
    polygons.forEach((p) => {
      if (!groups[p.rw]) groups[p.rw] = [];
      groups[p.rw].push(p);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [polygons]);

  // Stats
  const totalArea = polygons.length;
  const totalKK = polygons.reduce((sum, p) => sum + p.jumlah_kk, 0);
  const totalPenduduk = polygons.reduce((sum, p) => sum + p.jumlah_penduduk, 0);
  const maxPenduduk = Math.max(...polygons.map((p) => p.jumlah_penduduk), 1);

  // Selected polygon for right sidebar
  const selectedPolygon = useMemo(() => {
    if (!selectedPolygonId) return null;
    return polygons.find((p) => p.id === selectedPolygonId) || null;
  }, [selectedPolygonId, polygons]);

  const selectedPolygonColor = useMemo(() => {
    if (!selectedPolygonId) return "#0d9488";
    const idx = polygons.findIndex((p) => p.id === selectedPolygonId);
    return idx >= 0 ? POLYGON_COLORS[idx % POLYGON_COLORS.length] : "#0d9488";
  }, [selectedPolygonId, polygons]);

  const handlePolygonSelect = (polygon: Polygon) => {
    setSelectedPolygonId(polygon.id);
    setActiveRw(polygon.rw);
  };

  const handleRwClick = (rw: string, polygonsInRw: Polygon[]) => {
    setActiveRw(rw);
    if (polygonsInRw.length > 0) {
      setSelectedPolygonId(polygonsInRw[0].id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-red-400 block mb-4">
            error
          </span>
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <span className="material-symbols-outlined text-white">
                  map
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Peta Interaktif RW
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              >
                {darkMode ? (
                  <span className="material-symbols-outlined text-yellow-400">
                    light_mode
                  </span>
                ) : (
                  <span className="material-symbols-outlined">dark_mode</span>
                )}
              </button>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">
                  admin_panel_settings
                </span>
                Admin Panel
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-[1440px] mx-auto flex min-h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:block overflow-y-auto">
            <div className="p-6">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                Daftar Wilayah
              </p>
              <nav className="space-y-1">
                {rwGroups.map(([rw, items]) => (
                  <div key={rw}>
                    <button
                      onClick={() => handleRwClick(rw, items)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                        activeRw === rw
                          ? "bg-primary/10 text-primary border-r-4 border-primary"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-xl transition-colors ${
                          activeRw === rw
                            ? "text-primary"
                            : "group-hover:text-primary"
                        }`}
                      >
                        {activeRw === rw ? "domain" : "location_city"}
                      </span>
                      <span
                        className={
                          activeRw === rw ? "font-semibold" : "font-medium"
                        }
                      >
                        RW {rw}
                      </span>
                      <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {items.length}
                      </span>
                    </button>
                    {/* Sub-items when active */}
                    {activeRw === rw && items.length > 1 && (
                      <div className="ml-8 mt-1 space-y-1">
                        {items.map((item) => {
                          const colorIdx = polygons.findIndex(
                            (p) => p.id === item.id,
                          );
                          return (
                            <button
                              key={item.id}
                              onClick={() => setSelectedPolygonId(item.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all ${
                                selectedPolygonId === item.id
                                  ? "bg-primary/5 text-primary font-medium"
                                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor:
                                    POLYGON_COLORS[
                                      colorIdx % POLYGON_COLORS.length
                                    ],
                                }}
                              />
                              <span className="truncate">{item.nama}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 px-4 md:px-6 py-8 space-y-8 overflow-y-auto">
            {/* Map Section */}
            <section className="relative bg-white dark:bg-slate-800 rounded-large shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="relative w-full h-[350px] lg:h-[450px]">
                <MapComponent
                  polygons={polygons}
                  borderCoordinates={borderData.border as [number, number][]}
                  viewMode={viewMode}
                  showWhiteBackground={true}
                  focusPolygonId={selectedPolygonId}
                  onPolygonClick={handlePolygonSelect}
                />
                <div className="map-gradient-overlay absolute inset-0 pointer-events-none" />
              </div>
              {/* View Mode Toggle */}
              <div className="absolute top-4 right-4 z-[1000] flex bg-white/90 dark:bg-slate-700/90 backdrop-blur rounded-lg shadow-md border border-slate-200 dark:border-slate-600 overflow-hidden">
                <button
                  onClick={() => setViewMode("polygons")}
                  className={`px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    viewMode === "polygons"
                      ? "bg-primary text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    grid_view
                  </span>
                  RW
                </button>
                <button
                  onClick={() => setViewMode("border")}
                  className={`px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 border-x border-slate-200 dark:border-slate-600 ${
                    viewMode === "border"
                      ? "bg-primary text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    crop_free
                  </span>
                  Batas
                </button>
                <button
                  onClick={() => setViewMode("combined")}
                  className={`px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    viewMode === "combined"
                      ? "bg-primary text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    layers
                  </span>
                  Semua
                </button>
              </div>

              <div className="absolute bottom-3 right-3 z-[500] bg-white/90 dark:bg-slate-800/90 backdrop-blur p-1.5 px-3 rounded text-[10px] text-slate-500 dark:text-slate-400">
                © OpenStreetMap contributors
              </div>
            </section>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-large shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-6 group hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">
                    home_work
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {totalArea}
                  </p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Area
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-large shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-6 group hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">
                    family_restroom
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {totalKK.toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total KK
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-large shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-6 group hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">
                    groups
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {totalPenduduk.toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Penduduk
                  </p>
                </div>
              </div>
            </div>

            {/* Population Distribution Chart */}
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-large border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold">
                    Distribusi Populasi per Wilayah
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Analisis kepadatan penduduk setiap area
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Aktif
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between h-56 gap-2 md:gap-4">
                {polygons.map((polygon, index) => {
                  const heightPercent =
                    (polygon.jumlah_penduduk / maxPenduduk) * 100;
                  const color = POLYGON_COLORS[index % POLYGON_COLORS.length];
                  const percent =
                    totalPenduduk > 0
                      ? Math.round(
                          (polygon.jumlah_penduduk / totalPenduduk) * 100,
                        )
                      : 0;
                  return (
                    <div
                      key={polygon.id}
                      className="flex-1 rounded-t-lg relative group cursor-pointer transition-all"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: `${color}33`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${color}33`;
                      }}
                      onClick={() => handlePolygonSelect(polygon)}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {percent}% ({polygon.jumlah_penduduk} Jiwa)
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between mt-6 px-0.5 text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                {polygons.map((polygon) => (
                  <span
                    key={polygon.id}
                    className="text-center flex-1 truncate px-0.5"
                  >
                    {polygon.nama}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-200 dark:border-slate-800">
              <div className="text-center text-slate-500 dark:text-slate-400 text-sm">
                © 2024 Peta Interaktif RW. Sistem Informasi Pengelolaan Data
                Warga.
              </div>
            </footer>
          </main>

          {/* Right Sidebar - RW Detail */}
          <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden xl:block overflow-y-auto">
            <div className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-10 px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Detail Wilayah
              </p>
            </div>
            <RwDetailSidebar
              polygon={selectedPolygon}
              color={selectedPolygonColor}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
