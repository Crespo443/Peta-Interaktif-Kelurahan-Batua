import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RwKetuaInfo {
  nama_lengkap: string;
  no_hp: string;
  alamat: string;
  jabatan: string;
}

interface RtInfo {
  rt: string;
  nama_lengkap: string;
  no_hp: string;
  alamat: string;
  jabatan: string;
}

interface RwStatistics {
  jumlah_rt: number;
  total_warga: number;
  warga_aktif: number;
  agama: Record<string, number>;
  pendidikan: Record<string, number>;
  status_warga: Record<string, number>;
  status_kawin: Record<string, number>;
  range_umur: Record<string, number>;
}

interface PolygonData {
  id: string;
  nama: string;
  rw: string;
  coordinates: [number, number][];
  ketua_rw: RwKetuaInfo | null;
  rt_list: RtInfo[];
  statistics: RwStatistics | null;
}

const AGE_BAR_COLORS: Record<string, string> = {
  "0-5": "#60a5fa",
  "6-12": "#3b82f6",
  "13-17": "#818cf8",
  "18-30": "#4DB6AC",
  "31-45": "#10b981",
  "46-60": "#fbbf24",
  "60+": "#fb923c",
};

const STATUS_KAWIN_COLORS: Record<string, string> = {
  belum_kawin: "#60a5fa",
  kawin: "#10b981",
  cerai_hidup: "#f59e0b",
  cerai_mati: "#f87171",
};

const STATUS_KAWIN_LABELS: Record<string, string> = {
  belum_kawin: "Belum Kawin",
  kawin: "Kawin",
  cerai_hidup: "Cerai Hidup",
  cerai_mati: "Cerai Mati",
};

const STATUS_WARGA_COLORS: Record<string, string> = {
  aktif: "#10b981",
  meninggal: "#ef4444",
  pindah: "#3b82f6",
  domisili_lain: "#a855f7",
};

const STATUS_WARGA_LABELS: Record<string, string> = {
  aktif: "Aktif",
  meninggal: "Meninggal",
  pindah: "Pindah",
  domisili_lain: "Domisili Lain",
};

const AGAMA_COLORS: Record<string, string> = {
  Islam: "#4DB6AC",
  Kristen: "#3b82f6",
  Katholik: "#a855f7",
  Hindu: "#f59e0b",
  Buddha: "#ef4444",
};

const PENDIDIKAN_COLORS: Record<string, { color: string; label: string }> = {
  tidak_belum_sekolah: { color: "#94a3b8", label: "Blm Sekolah" },
  tidak_tamat_sd: { color: "#64748b", label: "Tdk Tamat SD" },
  sd_sederajat: { color: "#78716c", label: "SD Sederajat" },
  tamat_sd: { color: "#a3a3a3", label: "Tamat SD" },
  sltp: { color: "#3b82f6", label: "SLTP" },
  slta: { color: "#4DB6AC", label: "SLTA" },
  diploma_1_2: { color: "#6366f1", label: "D1/D2" },
  diploma_3: { color: "#8b5cf6", label: "D3" },
  diploma_4_s1: { color: "#a855f7", label: "S1" },
  s2: { color: "#ec4899", label: "S2" },
  s3: { color: "#f43f5e", label: "S3" },
};

export default function RwDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<PolygonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDarkMode(document.documentElement.classList.contains("dark"));
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/polygons");
        const result = await res.json();
        if (result.success) {
          const rwNum = String(id).padStart(2, "0");
          const found = result.data.find((p: PolygonData) => p.rw === rwNum);
          setData(found || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.statistics) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-red-400 block mb-4">
            error
          </span>
          <p className="text-xl text-red-500 mb-4">Data RW tidak ditemukan</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full shadow-lg transition-all"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Kembali ke Peta
          </Link>
        </div>
      </div>
    );
  }

  const stats = data.statistics;
  const ketua = data.ketua_rw;
  const totalWarga = stats.total_warga;

  // Build conic gradient for Status Kependudukan
  const statusWargaEntries = Object.entries(stats.status_warga).filter(
    ([, v]) => v > 0,
  );
  const statusWargaTotal = statusWargaEntries.reduce(
    (sum, [, v]) => sum + v,
    0,
  );
  let statusWargaCum = 0;
  const statusWargaGradient = statusWargaEntries
    .map(([key, val]) => {
      const start = (statusWargaCum / statusWargaTotal) * 100;
      statusWargaCum += val;
      const end = (statusWargaCum / statusWargaTotal) * 100;
      return `${STATUS_WARGA_COLORS[key] || "#ccc"} ${start}% ${end}%`;
    })
    .join(", ");

  // Build conic gradient for Religion
  const agamaEntries = Object.entries(stats.agama).filter(([, v]) => v > 0);
  const agamaTotal = agamaEntries.reduce((sum, [, v]) => sum + v, 0);
  let agamaCum = 0;
  const agamaGradient = agamaEntries
    .map(([key, val]) => {
      const start = (agamaCum / agamaTotal) * 100;
      agamaCum += val;
      const end = (agamaCum / agamaTotal) * 100;
      return `${AGAMA_COLORS[key] || "#ccc"} ${start}% ${end}%`;
    })
    .join(", ");

  // Max for education bar chart
  const pendidikanEntries = Object.entries(stats.pendidikan).filter(
    ([, v]) => v > 0,
  );
  const maxPendidikan = Math.max(...pendidikanEntries.map(([, v]) => v), 1);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen">
        {/* Header - same as index */}
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

        <main className="max-w-[1440px] mx-auto px-6 md:px-20 py-8">
          {/* Breadcrumb + Title */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-2">
                <Link
                  className="flex items-center gap-1 hover:underline"
                  href="/"
                >
                  <span className="material-symbols-outlined text-sm">
                    arrow_back
                  </span>
                  Main Dashboard
                </Link>
                <span>/</span>
                <span className="text-slate-500">
                  RW {data.rw} Detailed View
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                RW {data.rw} Statistics
              </h1>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-1">
                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm md:text-base">
                  <span className="material-symbols-outlined text-primary text-lg">
                    person
                  </span>
                  Ketua RW:
                  <span className="font-bold text-slate-700 dark:text-slate-200 uppercase">
                    {ketua?.nama_lengkap || "-"}
                  </span>
                </p>
                {ketua?.no_hp && (
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm md:text-base">
                    <span className="material-symbols-outlined text-primary text-lg">
                      call
                    </span>
                    No. Telepon:
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {ketua.no_hp}
                    </span>
                  </p>
                )}
                {ketua?.alamat && (
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-sm md:text-base">
                    <span className="material-symbols-outlined text-primary text-lg">
                      location_on
                    </span>
                    Alamat:
                    <span className="font-bold text-slate-700 dark:text-slate-200 uppercase">
                      {ketua.alamat}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                disabled
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-primary/30 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm shadow-sm opacity-60 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">
                  download
                </span>
                Export Data
              </button>
              <button
                disabled
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 opacity-60 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit RW Data
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="flex flex-col gap-4 rounded-2xl p-6 bg-white dark:bg-slate-900 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                    groups
                  </span>
                </div>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Total Population
                </p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {totalWarga.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    Residents
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl p-6 bg-white dark:bg-slate-900 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <span className="material-symbols-outlined text-primary">
                    holiday_village
                  </span>
                </div>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Total RT
                </p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {stats.jumlah_rt}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    Unit RT
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl p-6 bg-white dark:bg-slate-900 border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">
                    verified_user
                  </span>
                </div>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Warga Aktif
                </p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {stats.warga_aktif.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    Active
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Age Demographics & Status Perkawinan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Age Demographics */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-primary/10 shadow-sm overflow-hidden flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Age Demographics
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Distribution by Age Range (Total: {totalWarga})
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-5 py-2">
                {Object.entries(stats.range_umur).map(([range, count]) => {
                  const pct = totalWarga > 0 ? (count / totalWarga) * 100 : 0;
                  return (
                    <div key={range} className="flex items-center gap-4">
                      <div className="w-16 text-xs font-bold text-slate-500">
                        {range}
                      </div>
                      <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: AGE_BAR_COLORS[range] || "#4DB6AC",
                          }}
                        />
                      </div>
                      <div className="w-10 text-right text-xs font-bold text-slate-900 dark:text-slate-100">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Perkawinan */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-primary/10 shadow-sm overflow-hidden flex flex-col gap-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Status Perkawinan
              </h3>
              <div className="space-y-6">
                {Object.entries(stats.status_kawin).map(([key, count]) => {
                  const kawinTotal = Object.values(stats.status_kawin).reduce(
                    (s, v) => s + v,
                    0,
                  );
                  const pct = kawinTotal > 0 ? (count / kawinTotal) * 100 : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span className="text-slate-600 dark:text-slate-300">
                          {STATUS_KAWIN_LABELS[key] || key}
                        </span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold">
                          {count}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-4 rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              STATUS_KAWIN_COLORS[key] || "#4DB6AC",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Status Kependudukan & Religion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Status Kependudukan */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-primary/10 shadow-sm overflow-hidden flex flex-col gap-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Status Kependudukan
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
                <div
                  className="relative w-48 h-48 rounded-full"
                  style={{
                    background: `conic-gradient(${statusWargaGradient})`,
                  }}
                >
                  <div className="absolute inset-0 m-auto w-32 h-32 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      Total
                    </span>
                    <span className="text-lg font-medium text-slate-500 dark:text-slate-400">
                      {statusWargaTotal}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  {statusWargaEntries.map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: STATUS_WARGA_COLORS[key] || "#ccc",
                        }}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {STATUS_WARGA_LABELS[key] || key} ({val})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Religion Distribution */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-primary/10 shadow-sm overflow-hidden flex flex-col gap-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Religion Distribution
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
                <div
                  className="relative w-48 h-48 rounded-full"
                  style={{
                    background: `conic-gradient(${agamaGradient})`,
                  }}
                >
                  <div className="absolute inset-0 m-auto w-32 h-32 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      Agama
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  {agamaEntries.map(([key, val]) => {
                    const pct =
                      agamaTotal > 0 ? Math.round((val / agamaTotal) * 100) : 0;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: AGAMA_COLORS[key] || "#ccc",
                          }}
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {key} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Education Levels */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-10">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-primary/10 shadow-sm overflow-hidden flex flex-col gap-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Education Levels
              </h3>
              <div className="flex items-end justify-between gap-2 h-48 w-full px-2">
                {pendidikanEntries.map(([key, val]) => {
                  const heightPct = (val / maxPendidikan) * 100;
                  const info = PENDIDIKAN_COLORS[key] || {
                    color: "#4DB6AC",
                    label: key,
                  };
                  return (
                    <div
                      key={key}
                      className="flex flex-col items-center gap-2 group w-full"
                    >
                      <div className="w-full bg-blue-400/20 rounded-t-md relative h-full flex items-end justify-center overflow-hidden">
                        <div
                          className="w-full rounded-t-md hover:opacity-80 transition-all relative group"
                          style={{
                            height: `${heightPct}%`,
                            backgroundColor: info.color,
                          }}
                        >
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {val}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-slate-500">
                        {info.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RT List Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-primary/10 shadow-sm overflow-hidden mb-8">
            <div className="px-8 py-6 border-b border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                RT List Overview
              </h3>
              <div className="text-sm text-slate-500">
                {data.rt_list.length} RT Units
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                      RT Unit
                    </th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                      Head of RT
                    </th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                      Phone Number
                    </th>
                    <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                      Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.rt_list.map((rt) => (
                    <tr
                      key={rt.rt}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <td className="px-8 py-5 text-sm font-bold text-slate-700 dark:text-slate-200">
                        RT {rt.rt}
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">
                        {rt.nama_lengkap || "-"}
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">
                        {rt.no_hp || "-"}
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-600 dark:text-slate-400">
                        {rt.alamat || "-"}
                      </td>
                    </tr>
                  ))}
                  {data.rt_list.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-8 py-8 text-center text-sm text-slate-400"
                      >
                        Tidak ada data RT
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Footer - same as index */}
        <footer className="py-8 border-t border-slate-200 dark:border-slate-800 max-w-[1440px] mx-auto px-6 md:px-20">
          <div className="text-center text-slate-500 dark:text-slate-400 text-sm">
            © 2024 Peta Interaktif RW. Sistem Informasi Pengelolaan Data Warga.
          </div>
        </footer>
      </div>
    </div>
  );
}
