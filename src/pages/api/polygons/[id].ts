import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { Polygon } from "./index";

const dataPath = path.join(process.cwd(), "src", "data", "polygons.json");

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
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ success: false, error: "Invalid ID" });
  }

  try {
    const data = readData();
    const polygonIndex = data.polygons.findIndex((p) => p.id === id);

    switch (req.method) {
      case "GET":
        // Get single polygon
        if (polygonIndex === -1) {
          return res
            .status(404)
            .json({ success: false, error: "Polygon not found" });
        }
        res
          .status(200)
          .json({ success: true, data: data.polygons[polygonIndex] });
        break;

      case "PUT":
        // Update polygon
        if (polygonIndex === -1) {
          return res
            .status(404)
            .json({ success: false, error: "Polygon not found" });
        }
        data.polygons[polygonIndex] = {
          ...data.polygons[polygonIndex],
          ...req.body,
          id, // Preserve the ID
        };
        writeData(data);
        res
          .status(200)
          .json({ success: true, data: data.polygons[polygonIndex] });
        break;

      case "DELETE":
        // Delete polygon
        if (polygonIndex === -1) {
          return res
            .status(404)
            .json({ success: false, error: "Polygon not found" });
        }
        data.polygons.splice(polygonIndex, 1);
        writeData(data);
        res.status(200).json({ success: true, message: "Polygon deleted" });
        break;

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
}
