import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface PolygonData {
  id: string;
  nama: string;
  rw: string;
  jumlah_kk: number;
  jumlah_penduduk: number;
  ketua_rw: string;
  coordinates: [number, number][];
}

interface MapComponentProps {
  polygons: PolygonData[];
  onPolygonClick?: (polygon: PolygonData) => void;
  showWhiteBackground?: boolean;
}

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
];

const MapComponent: React.FC<MapComponentProps> = ({
  polygons,
  onPolygonClick,
  showWhiteBackground = true,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const maskLayerRef = useRef<L.Polygon | null>(null);
  const [maskEnabled, setMaskEnabled] = useState(showWhiteBackground);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize map
    if (!mapRef.current) {
      const map = L.map("map").setView([-5.154, 119.467], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add polygons
    const bounds: L.LatLngBounds[] = [];
    polygons.forEach((polygon, index) => {
      const latLngs = polygon.coordinates.map(
        (coord) => [coord[1], coord[0]] as L.LatLngTuple,
      );

      const polygonLayer = L.polygon(latLngs, {
        fillColor: COLORS[index % COLORS.length],
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.5,
      });

      polygonLayer.addTo(map);
      bounds.push(polygonLayer.getBounds());

      // Popup
      const popupContent = `
        <div class="p-2">
          <strong class="text-lg">${polygon.nama}</strong>
          <hr class="my-2"/>
          <div class="text-sm">
            <div><strong>RW:</strong> ${polygon.rw}</div>
            <div><strong>Jumlah KK:</strong> ${polygon.jumlah_kk}</div>
            <div><strong>Penduduk:</strong> ${polygon.jumlah_penduduk} jiwa</div>
            <div><strong>Ketua RW:</strong> ${polygon.ketua_rw}</div>
          </div>
        </div>
      `;
      polygonLayer.bindPopup(popupContent);

      // Click handler
      if (onPolygonClick) {
        polygonLayer.on("click", () => onPolygonClick(polygon));
      }

      // Hover effect
      polygonLayer.on("mouseover", () => {
        polygonLayer.setStyle({
          weight: 5,
          color: "#666",
          dashArray: "",
          fillOpacity: 0.7,
        });
      });

      polygonLayer.on("mouseout", () => {
        polygonLayer.setStyle({
          weight: 2,
          color: "white",
          dashArray: "3",
          fillOpacity: 0.5,
        });
      });
    });

    // Fit bounds
    if (bounds.length > 0) {
      const group = new L.FeatureGroup(bounds.map((b) => L.rectangle(b)));
      map.fitBounds(group.getBounds());
    }

    // Create inverse mask for white background
    if (maskEnabled) {
      createInverseMask(map, polygons);
    }

    return () => {
      // Cleanup handled by layer removal above
    };
  }, [polygons, onPolygonClick, maskEnabled]);

  const createInverseMask = (map: L.Map, polygons: PolygonData[]) => {
    // Remove existing mask
    if (maskLayerRef.current) {
      map.removeLayer(maskLayerRef.current);
    }

    // World bounds
    const outerCoords: L.LatLngTuple[][] = [
      [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180],
        [-90, -180],
      ],
    ];

    // Add holes for each polygon
    const holes = polygons.map((polygon) =>
      polygon.coordinates
        .map((coord) => [coord[1], coord[0]] as L.LatLngTuple)
        .reverse(),
    );

    const maskCoords = [...outerCoords, ...holes];

    const maskPolygon = L.polygon(maskCoords, {
      color: "white",
      fillColor: "white",
      fillOpacity: 0.9,
      weight: 0,
      interactive: false,
    });

    maskPolygon.addTo(map);
    maskPolygon.bringToBack();
    maskLayerRef.current = maskPolygon;
  };

  const toggleBackground = () => {
    if (mapRef.current) {
      if (maskEnabled && maskLayerRef.current) {
        mapRef.current.removeLayer(maskLayerRef.current);
        setMaskEnabled(false);
      } else {
        createInverseMask(mapRef.current, polygons);
        setMaskEnabled(true);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <div id="map" className="w-full h-full bg-white" />

      {/* Toggle Background Button */}
      <button
        onClick={toggleBackground}
        className="absolute top-4 left-4 z-[1000] bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      >
        {maskEnabled ? "Show Full Map" : "Hide Outside"}
      </button>
    </div>
  );
};

export default MapComponent;
