import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const polygonsPath = path.join(process.cwd(), "src", "data", "polygons.json");
const combinedPath = path.join(process.cwd(), "src", "data", "combined.json");

export interface RwKetuaInfo {
  nama_lengkap: string;
  no_hp: string;
  alamat: string;
  jabatan: string;
}

export interface RtInfo {
  rt: string;
  nama_lengkap: string;
  no_hp: string;
  alamat: string;
  jabatan: string;
}

export interface RwStatistics {
  jumlah_rt: number;
  total_warga: number;
  warga_aktif: number;
  agama: Record<string, number>;
  pendidikan: Record<string, number>;
  status_warga: Record<string, number>;
  status_kawin: Record<string, number>;
  range_umur: Record<string, number>;
}

export interface Polygon {
  id: string;
  nama: string;
  rw: string;
  coordinates: [number, number][];
  ketua_rw: RwKetuaInfo | null;
  rt_list: RtInfo[];
  statistics: RwStatistics | null;
}

interface PolygonFileEntry {
  id: number | string;
  nama: string;
  rw: string;
  coordinates: [number, number][];
  [key: string]: unknown;
}

interface CombinedFile {
  data_by_rw: Record<
    string,
    {
      ketua_rw: RwKetuaInfo | null;
      rt_list: RtInfo[];
      statistics: RwStatistics;
    }
  >;
}

const readMergedData = (): Polygon[] => {
  const polygonsRaw: { polygons: PolygonFileEntry[] } = JSON.parse(
    fs.readFileSync(polygonsPath, "utf8"),
  );
  const combinedRaw: CombinedFile = JSON.parse(
    fs.readFileSync(combinedPath, "utf8"),
  );

  return polygonsRaw.polygons.map((p) => {
    const rwKey = p.rw.padStart(3, "0");
    const rwData = combinedRaw.data_by_rw[rwKey];

    return {
      id: String(p.id),
      nama: p.nama,
      rw: p.rw,
      coordinates: p.coordinates,
      ketua_rw: rwData?.ketua_rw || null,
      rt_list: rwData?.rt_list || [],
      statistics: rwData?.statistics || null,
    };
  });
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET":
        const data = readMergedData();
        res.status(200).json({ success: true, data });
        break;

      case "POST":
        const polygonsRaw = JSON.parse(fs.readFileSync(polygonsPath, "utf8"));
        const newEntry = {
          id: Date.now(),
          ...req.body,
        };
        polygonsRaw.polygons.push(newEntry);
        fs.writeFileSync(polygonsPath, JSON.stringify(polygonsRaw, null, 2));
        res.status(201).json({ success: true, data: newEntry });
        break;

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
}
