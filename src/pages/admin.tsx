import { useEffect, useState } from "react";
import Link from "next/link";
import PolygonForm from "@/components/PolygonForm";
import dynamic from "next/dynamic";

const MapDrawComponent = dynamic(
  () => import("@/components/MapDrawComponent"),
  {
    ssr: false,
  },
);

interface Polygon {
  id: string;
  nama: string;
  rw: string;
  coordinates: [number, number][];
  ketua_rw: {
    nama_lengkap: string;
    no_hp: string;
    alamat: string;
    jabatan: string;
  } | null;
  rt_list: Array<{
    rt: string;
    nama_lengkap: string;
    no_hp: string;
    alamat: string;
    jabatan: string;
  }>;
  statistics: {
    jumlah_rt: number;
    total_warga: number;
    warga_aktif: number;
    agama: Record<string, number>;
    pendidikan: Record<string, number>;
    status_warga: Record<string, number>;
    status_kawin: Record<string, number>;
    range_umur: Record<string, number>;
  } | null;
}

export default function AdminPage() {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPolygon, setEditingPolygon] = useState<Polygon | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMapDraw, setShowMapDraw] = useState(false);

  useEffect(() => {
    fetchPolygons();
  }, []);

  const fetchPolygons = async () => {
    try {
      const response = await fetch("/api/polygons");
      const result = await response.json();

      if (result.success) {
        setPolygons(result.data);
      }
    } catch (err) {
      console.error("Error fetching polygons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus polygon ini?")) return;

    try {
      const response = await fetch(`/api/polygons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPolygons();
      } else {
        alert("Gagal menghapus polygon");
      }
    } catch (err) {
      alert("Error menghapus polygon");
      console.error(err);
    }
  };

  const handleEdit = (polygon: Polygon) => {
    setEditingPolygon(polygon);
    setShowForm(true);
    setShowMapDraw(false);
  };

  const handleEditWithMap = (polygon: Polygon) => {
    setEditingPolygon(polygon);
    setShowMapDraw(true);
    setShowForm(false);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPolygon(null);
    fetchPolygons();
  };

  const handleDrawPolygon = () => {
    setShowMapDraw(true);
    setShowForm(false);
    setEditingPolygon(null);
  };

  const handlePolygonDrawn = (coordinates: [number, number][]) => {
    setShowMapDraw(false);
    // If editing existing polygon, preserve the data
    if (editingPolygon && editingPolygon.id) {
      setEditingPolygon({
        ...editingPolygon,
        coordinates,
      });
    } else {
      // Creating new polygon
      setEditingPolygon({
        id: "",
        nama: "",
        rw: "",
        coordinates,
        ketua_rw: null,
        rt_list: [],
        statistics: null,
      });
    }
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Admin Panel - Kelola Polygon
          </h1>
          <Link
            href="/"
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Lihat Peta
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={handleDrawPolygon}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            + Gambar Polygon di Peta
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingPolygon?.id ? "Edit Polygon" : "Tambah Polygon Baru"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingPolygon(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <PolygonForm polygon={editingPolygon} onClose={handleFormClose} />
            </div>
          </div>
        )}

        {/* Map Draw Modal */}
        {showMapDraw && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-[90%] h-[90%] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold">
                  {editingPolygon?.id
                    ? "Edit Polygon di Peta"
                    : "Gambar Polygon di Peta"}
                </h2>
                <button
                  onClick={() => {
                    setShowMapDraw(false);
                    setEditingPolygon(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1">
                <MapDrawComponent
                  onPolygonDrawn={handlePolygonDrawn}
                  existingPolygons={polygons.filter(
                    (p) => p.id !== editingPolygon?.id,
                  )}
                  editingPolygon={editingPolygon?.id ? editingPolygon : null}
                />
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RW
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Warga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warga Aktif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ketua RW
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {polygons.map((polygon) => (
                <tr key={polygon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {polygon.nama}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    RW {polygon.rw}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {polygon.statistics?.total_warga ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {polygon.statistics?.warga_aktif ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {polygon.ketua_rw?.nama_lengkap || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(polygon)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleEditWithMap(polygon)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Edit di Peta
                    </button>
                    <button
                      onClick={() => handleDelete(polygon.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {polygons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada data polygon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
