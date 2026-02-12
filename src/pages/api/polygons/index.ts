import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "src", "data", "polygons.json");

export interface Polygon {
  id: string;
  nama: string;
  rw: string;
  jumlah_kk: number;
  jumlah_penduduk: number;
  ketua_rw: string;
  coordinates: [number, number][];
}

interface DataStore {
  polygons: Polygon[];
}

const readData = (): DataStore => {
  const fileContents = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(fileContents);
};

const writeData = (data: DataStore) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = readData();

    switch (req.method) {
      case "GET":
        // Get all polygons
        res.status(200).json({ success: true, data: data.polygons });
        break;

      case "POST":
        // Create new polygon
        const newPolygon: Polygon = {
          id: Date.now().toString(),
          ...req.body,
        };
        data.polygons.push(newPolygon);
        writeData(data);
        res.status(201).json({ success: true, data: newPolygon });
        break;

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
}
