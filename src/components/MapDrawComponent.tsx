import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

interface MapDrawComponentProps {
  onPolygonDrawn: (coordinates: [number, number][]) => void;
  existingPolygons: Array<{ coordinates: [number, number][] }>;
  editingPolygon?: { id: string; coordinates: [number, number][] } | null;
}

const MapDrawComponent: React.FC<MapDrawComponentProps> = ({
  onPolygonDrawn,
  existingPolygons,
  editingPolygon = null,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initialize map
    if (!mapRef.current) {
      const map = L.map("draw-map").setView([-5.154, 119.467], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Initialize FeatureGroup for drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      // Add existing polygons as reference
      existingPolygons.forEach((polygon, index) => {
        const latLngs = polygon.coordinates.map(
          (coord) => [coord[1], coord[0]] as L.LatLngTuple,
        );

        L.polygon(latLngs, {
          color: "#999",
          fillColor: "#ccc",
          fillOpacity: 0.3,
          weight: 1,
        }).addTo(map);
      });

      // Add editing polygon to drawnItems if exists
      if (editingPolygon) {
        const latLngs = editingPolygon.coordinates.map(
          (coord) => [coord[1], coord[0]] as L.LatLngTuple,
        );

        const editLayer = L.polygon(latLngs, {
          color: "#FF6B6B",
          fillColor: "#FF6B6B",
          fillOpacity: 0.5,
          weight: 3,
        });

        drawnItems.addLayer(editLayer);
        map.fitBounds(editLayer.getBounds());
      }

      // Initialize draw control
      const drawControl = new L.Control.Draw({
        position: "topright",
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: "#4ECDC4",
              weight: 3,
            },
          },
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
      });

      map.addControl(drawControl);

      // Handle polygon creation and editing
      map.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);

        // Get coordinates
        const latLngs = layer.getLatLngs()[0];
        const coordinates: [number, number][] = latLngs.map(
          (latLng: L.LatLng) => [latLng.lng, latLng.lat],
        );

        // Add closing coordinate if not present
        if (
          coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
          coordinates[0][1] !== coordinates[coordinates.length - 1][1]
        ) {
          coordinates.push([...coordinates[0]]);
        }

        onPolygonDrawn(coordinates);
      });

      // Handle polygon editing
      map.on(L.Draw.Event.EDITED, (event: any) => {
        const layers = event.layers;
        layers.eachLayer((layer: any) => {
          const latLngs = layer.getLatLngs()[0];
          const coordinates: [number, number][] = latLngs.map(
            (latLng: L.LatLng) => [latLng.lng, latLng.lat],
          );

          // Add closing coordinate if not present
          if (
            coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1]
          ) {
            coordinates.push([...coordinates[0]]);
          }

          onPolygonDrawn(coordinates);
        });
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onPolygonDrawn, existingPolygons, editingPolygon]);

  return (
    <div className="relative w-full h-full">
      <div id="draw-map" className="w-full h-full" />

      <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded shadow-lg max-w-xs">
        <h3 className="font-bold mb-2">
          {editingPolygon ? "Edit Polygon:" : "Cara Menggambar Polygon:"}
        </h3>
        {editingPolygon ? (
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Klik icon edit (pensil) di pojok kanan atas</li>
            <li>Klik dan drag titik sudut untuk mengubah</li>
            <li>Klik "Save" setelah selesai</li>
            <li>Atau gambar ulang polygon baru</li>
          </ol>
        ) : (
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Klik icon polygon di pojok kanan atas</li>
            <li>Klik di peta untuk membuat titik sudut</li>
            <li>Klik titik pertama lagi untuk menutup polygon</li>
            <li>Polygon akan tersimpan otomatis</li>
          </ol>
        )}
        <div className="mt-3 text-xs text-gray-500">
          {editingPolygon
            ? "Polygon merah adalah yang sedang diedit"
            : "Polygon abu-abu adalah area yang sudah ada"}
        </div>
      </div>
    </div>
  );
};

export default MapDrawComponent;
