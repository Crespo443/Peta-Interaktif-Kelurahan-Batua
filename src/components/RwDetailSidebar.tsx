import React from "react";
import Link from "next/link";

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

interface Polygon {
  id: string;
  nama: string;
  rw: string;
  coordinates: [number, number][];
  ketua_rw: RwKetuaInfo | null;
  rt_list: RtInfo[];
  statistics: RwStatistics | null;
}

interface RwDetailSidebarProps {
  polygon: Polygon | null;
  color: string;
}

const RwDetailSidebar: React.FC<RwDetailSidebarProps> = ({
  polygon,
  color,
}) => {
  if (!polygon) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">
            touch_app
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mb-1">
          Belum ada wilayah dipilih
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Klik salah satu RW di peta atau daftar wilayah untuk melihat detail
        </p>
      </div>
    );
  }

  const stats = polygon.statistics;
  const ketua = polygon.ketua_rw;

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
            RW {polygon.rw}
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {polygon.nama}
        </p>
      </div>

      {/* Ketua RW */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Ketua RW
        </p>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={{ color }}
            >
              person
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Nama
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {ketua?.nama_lengkap || "-"}
            </p>
          </div>
        </div>
        {ketua?.no_hp && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}18` }}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ color }}
              >
                call
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                No. HP
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {ketua.no_hp}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Statistik
          </p>

          {/* Jumlah RT */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}18` }}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ color }}
              >
                holiday_village
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Jumlah RT
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {stats.jumlah_rt}
              </p>
            </div>
          </div>

          {/* Total Warga */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}18` }}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ color }}
              >
                groups
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Warga
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {stats.total_warga.toLocaleString()} jiwa
              </p>
            </div>
          </div>

          {/* Warga Aktif */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}18` }}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={{ color }}
              >
                verified_user
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Warga Aktif
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {stats.warga_aktif.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Top Agama */}
          {stats.agama && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ color }}
                >
                  mosque
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Agama Mayoritas
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {(() => {
                    const sorted = Object.entries(stats.agama).sort(
                      ([, a], [, b]) => b - a,
                    );
                    return sorted[0]
                      ? `${sorted[0][0]} (${sorted[0][1]})`
                      : "-";
                  })()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Detail Button */}
      <div className="pt-2">
        <Link
          href={`/rw/${polygon.rw.replace(/^0+/, "")}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg hover:scale-[1.02] transition-all"
          style={{ backgroundColor: color }}
        >
          <span className="material-symbols-outlined text-sm">bar_chart</span>
          Lihat Detail Statistik
        </Link>
      </div>
    </div>
  );
};

export default RwDetailSidebar;
