import { useState, FormEvent } from "react";

interface Polygon {
  id: string;
  nama: string;
  rw: string;
  coordinates: [number, number][];
}

interface PolygonFormProps {
  polygon: Polygon | null;
  onClose: () => void;
}

const PolygonForm: React.FC<PolygonFormProps> = ({ polygon, onClose }) => {
  const [formData, setFormData] = useState({
    nama: polygon?.nama || "",
    rw: polygon?.rw || "",
    coordinates: polygon?.coordinates || [],
  });

  const [coordinateInput, setCoordinateInput] = useState(
    polygon?.coordinates
      ? JSON.stringify(polygon.coordinates, null, 2)
      : "[\n  [119.467, -5.145],\n  [119.468, -5.146],\n  [119.469, -5.145]\n]",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Parse coordinates
      let coordinates;
      try {
        coordinates = JSON.parse(coordinateInput);
        if (!Array.isArray(coordinates) || coordinates.length < 3) {
          throw new Error("Koordinat harus array dengan minimal 3 titik");
        }
      } catch (err) {
        setError("Format koordinat tidak valid. Gunakan format JSON array.");
        setLoading(false);
        return;
      }

      const data = {
        nama: formData.nama,
        rw: formData.rw,
        coordinates,
      };

      const url = polygon?.id ? `/api/polygons/${polygon.id}` : "/api/polygons";
      const method = polygon?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert(
          polygon?.id
            ? "Polygon berhasil diupdate!"
            : "Polygon berhasil ditambahkan!",
        );
        onClose();
      } else {
        const result = await response.json();
        setError(result.error || "Gagal menyimpan polygon");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Area
          </label>
          <input
            type="text"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            RW
          </label>
          <input
            type="text"
            value={formData.rw}
            onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="001"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Koordinat Polygon (Format JSON)
        </label>
        <textarea
          value={coordinateInput}
          onChange={(e) => setCoordinateInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          rows={8}
          placeholder="[[119.467, -5.145], [119.468, -5.146], [119.469, -5.145]]"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Format: Array of [longitude, latitude] pairs. Minimal 3 titik
          koordinat.
        </p>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          disabled={loading}
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-primary hover:bg-secondary text-white rounded-md transition disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : polygon?.id ? "Update" : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default PolygonForm;
