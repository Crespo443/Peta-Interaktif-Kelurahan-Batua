import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface PolygonData {
  id: string;
  nama: string;
  rw: string;
  coordinates: [number, number][];
}

export type MapViewMode = "polygons" | "border" | "combined";

interface MapComponentProps {
  polygons: PolygonData[];
  borderCoordinates?: [number, number][];
  viewMode?: MapViewMode;
  onPolygonClick?: (polygon: PolygonData) => void;
  showWhiteBackground?: boolean;
  focusPolygonId?: string | null;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const POLYGON_COLORS = [
  "#EF4444",
  "#14B8A6",
  "#EAB308",
  "#3B82F6",
  "#8B5CF6",
  "#F97316",
  "#22C55E",
];

const MapComponent: React.FC<MapComponentProps> = ({
  polygons,
  borderCoordinates,
  viewMode = "polygons",
  onPolygonClick,
  showWhiteBackground = true,
  focusPolygonId = null,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const maskLayerRef = useRef<L.Polygon | null>(null);
  const borderLayerRef = useRef<L.Polygon | null>(null);
  const polygonLayersRef = useRef<Map<string, L.Polygon>>(new Map());
  const [maskEnabled, setMaskEnabled] = useState(showWhiteBackground);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!mapRef.current) {
      const map = L.map("map", { zoomControl: false }).setView(
        [-5.1565, 119.4683],
        15,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control to bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });
    polygonLayersRef.current.clear();
    borderLayerRef.current = null;
    maskLayerRef.current = null;

    const bounds: L.LatLngBounds[] = [];

    // Add border if viewMode is "border" or "combined"
    if (
      borderCoordinates &&
      (viewMode === "border" || viewMode === "combined")
    ) {
      const borderLatLngs = borderCoordinates.map(
        (coord) => [coord[1], coord[0]] as L.LatLngTuple,
      );

      const borderLayer = L.polygon(borderLatLngs, {
        fillColor: viewMode === "border" ? "#0d9488" : "transparent",
        weight: 3,
        opacity: 1,
        color: "#0d9488",
        fillOpacity: viewMode === "border" ? 0.15 : 0,
        dashArray: viewMode === "combined" ? "8, 6" : undefined,
      });

      borderLayer.addTo(map);
      borderLayerRef.current = borderLayer;
      bounds.push(borderLayer.getBounds());

      if (viewMode === "border") {
        borderLayer.bindPopup(`
          <div style="min-width: 160px;">
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px; color: #0d9488;">Kelurahan Batua</div>
            <div style="font-size: 13px; color: #475569;">Batas wilayah kelurahan</div>
          </div>
        `);
      }
    }

    // Add RW polygons if viewMode is "polygons" or "combined"
    if (viewMode === "polygons" || viewMode === "combined") {
      polygons.forEach((polygon, index) => {
        const latLngs = polygon.coordinates.map(
          (coord) => [coord[1], coord[0]] as L.LatLngTuple,
        );

        const color = POLYGON_COLORS[index % POLYGON_COLORS.length];
        const isFocused = focusPolygonId === polygon.id;

        const polygonLayer = L.polygon(latLngs, {
          fillColor: color,
          weight: isFocused ? 3 : 1.5,
          opacity: 1,
          color: isFocused ? color : "white",
          fillOpacity: isFocused ? 0.6 : 0.4,
        });

        polygonLayer.addTo(map);
        polygonLayersRef.current.set(polygon.id, polygonLayer);
        bounds.push(polygonLayer.getBounds());

        // Popup - only show name
        const popupContent = `
        <div style="min-width: 140px;">
          <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px; color: ${color};">${polygon.nama}</div>
          <div style="font-size: 13px; color: #475569;">RW ${polygon.rw}</div>
        </div>
      `;
        polygonLayer.bindPopup(popupContent);

        if (onPolygonClick) {
          polygonLayer.on("click", () => onPolygonClick(polygon));
        }

        // Hover effect
        polygonLayer.on("mouseover", () => {
          polygonLayer.setStyle({
            weight: 3,
            color: color,
            fillOpacity: 0.45,
          });
        });

        polygonLayer.on("mouseout", () => {
          if (focusPolygonId !== polygon.id) {
            polygonLayer.setStyle({
              weight: 1.5,
              color: "white",
              fillOpacity: 0.25,
            });
          }
        });
      });
    } // end if viewMode polygons/combined

    // Focus on selected polygon or fit all
    if (
      focusPolygonId &&
      (viewMode === "polygons" || viewMode === "combined")
    ) {
      const layer = polygonLayersRef.current.get(focusPolygonId);
      if (layer) {
        map.flyToBounds(layer.getBounds(), {
          padding: [80, 80],
          duration: 0.5,
        });
        setTimeout(() => layer.openPopup(), 600);
      }
    } else if (bounds.length > 0) {
      const group = new L.FeatureGroup(bounds.map((b) => L.rectangle(b)));
      map.fitBounds(group.getBounds());
    }

    // Inverse mask (only for polygon/combined modes)
    if (maskEnabled && (viewMode === "polygons" || viewMode === "combined")) {
      const maskSource =
        viewMode === "combined" && borderCoordinates
          ? [{ coordinates: borderCoordinates } as PolygonData]
          : polygons;
      createInverseMask(map, maskSource);
    } else if (maskEnabled && viewMode === "border" && borderCoordinates) {
      createInverseMask(map, [
        { coordinates: borderCoordinates } as PolygonData,
      ]);
    }

    return () => {};
  }, [
    polygons,
    borderCoordinates,
    viewMode,
    onPolygonClick,
    maskEnabled,
    focusPolygonId,
  ]);

  // Handle fullscreen resize
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    // Give the DOM time to update layout
    const timer = setTimeout(() => {
      map.invalidateSize();
      // Fit bounds to all visible layers (wilayah)
      const allBounds: L.LatLngBounds[] = [];
      if (borderLayerRef.current) {
        allBounds.push(borderLayerRef.current.getBounds());
      }
      polygonLayersRef.current.forEach((layer) => {
        allBounds.push(layer.getBounds());
      });
      if (allBounds.length > 0) {
        const group = new L.FeatureGroup(allBounds.map((b) => L.rectangle(b)));
        map.fitBounds(group.getBounds(), { padding: [40, 40] });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  const createInverseMask = (map: L.Map, polygons: PolygonData[]) => {
    if (maskLayerRef.current) {
      map.removeLayer(maskLayerRef.current);
    }

    const outerCoords: L.LatLngTuple[][] = [
      [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180],
        [-90, -180],
      ],
    ];

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
      <div id="map" className="w-full h-full" />

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={toggleBackground}
          className="bg-white/90 dark:bg-slate-700/90 backdrop-blur p-2 px-3 shadow-md rounded-lg hover:bg-white dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 flex items-center gap-2 font-medium text-sm text-slate-700 dark:text-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">
            {maskEnabled ? "visibility" : "visibility_off"}
          </span>
          {maskEnabled ? "Show Full Map" : "Hide Outside"}
        </button>
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="bg-white/90 dark:bg-slate-700/90 backdrop-blur p-2 px-3 shadow-md rounded-lg hover:bg-white dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 flex items-center gap-2 font-medium text-sm text-slate-700 dark:text-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isFullscreen ? "fullscreen_exit" : "fullscreen"}
            </span>
            {isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
