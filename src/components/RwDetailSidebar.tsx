import React from "react";

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

interface RwDetailSidebarProps {
  polygon: Polygon | null;
  color: string;
}

const DETAIL_ITEMS = [
  {
    key: "ketua_rw",
    label: "Ketua RW",
    icon: "person",
    format: (v: string | number) => v || "-",
  },
  {
    key: "jumlah_rt",
    label: "Jumlah RT",
    icon: "holiday_village",
    format: (v: string | number) =>
      typeof v === "number" ? v.toLocaleString() : v,
  },
  {
    key: "jumlah_kk",
    label: "Jumlah KK",
    icon: "family_restroom",
    format: (v: string | number) =>
      typeof v === "number" ? v.toLocaleString() : v,
  },
  {
    key: "jumlah_penduduk",
    label: "Jumlah Penduduk",
    icon: "groups",
    format: (v: string | number) =>
      typeof v === "number" ? `${v.toLocaleString()} jiwa` : v,
  },
  {
    key: "jumlah_mesjid",
    label: "Jumlah Mesjid",
    icon: "mosque",
    format: (v: string | number) =>
      typeof v === "number" ? v.toLocaleString() : v,
  },
];

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

      {/* Detail Items */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Informasi Wilayah
        </p>
        {DETAIL_ITEMS.map((item) => {
          const value = (polygon as unknown as Record<string, unknown>)[
            item.key
          ];
          return (
            <div
              key={item.key}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}18` }}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ color }}
                >
                  {item.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {item.format(value as string | number)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RwDetailSidebar;
