# Peta Interaktif RT/RW - Next.js

Aplikasi web untuk mengelola dan menampilkan peta interaktif wilayah RT dan RW menggunakan Next.js, TypeScript, dan Leaflet.

## 🎯 Fitur Utama

### Halaman Peta (Home Page)

- **Peta Interaktif**: Menampilkan semua polygon RT/RW dengan warna berbeda
- **Toggle Background**: Tombol untuk menampilkan/menyembunyikan area di luar polygon
- **Info Popup**: Klik polygon untuk melihat detail data (RT, RW, jumlah KK, penduduk, ketua RT)
- **Hover Effect**: Highlight polygon saat mouse melewati
- **Statistik Real-time**: Footer menampilkan total area, KK, dan penduduk

### Halaman Admin

- **Tabel Data**: Tampilan semua polygon dalam bentuk tabel
- **CRUD Operations**:
  - ✅ Create: Tambah polygon baru (manual atau gambar di peta)
  - ✅ Read: Lihat semua data polygon
  - ✅ Update: Edit data polygon yang sudah ada
  - ✅ Delete: Hapus polygon dengan konfirmasi
- **Draw Polygon**: Gambar polygon langsung di peta menggunakan Leaflet Draw
- **Form Input**: Form lengkap untuk data RT/RW, jumlah KK, penduduk, dan ketua RT

## 🛠️ Teknologi

- **Framework**: Next.js 14 (TypeScript)
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React-Leaflet + Leaflet Draw
- **State Management**: React Hooks
- **Data Fetching**: SWR (optional)
- **Data Storage**: JSON File (dapat diganti dengan database)

## 📁 Struktur Project

\`\`\`
nextjs-peta/
├── src/
│ ├── components/
│ │ ├── MapComponent.tsx # Komponen peta untuk display
│ │ ├── MapDrawComponent.tsx # Komponen untuk menggambar polygon
│ │ └── PolygonForm.tsx # Form input data polygon
│ ├── data/
│ │ └── polygons.json # Data storage (JSON)
│ ├── pages/
│ │ ├── api/
│ │ │ └── polygons/
│ │ │ ├── index.ts # API: GET all, POST new
│ │ │ └── [id].ts # API: GET, PUT, DELETE by ID
│ │ ├── \_app.tsx # App wrapper
│ │ ├── index.tsx # Home page (peta)
│ │ └── admin.tsx # Admin page (CRUD)
│ └── styles/
│ └── globals.css # Global styles + Tailwind
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
\`\`\`

## 🚀 Cara Menjalankan

### 1. Install Dependencies

\`\`\`bash
cd nextjs-peta
npm install
\`\`\`

### 2. Jalankan Development Server

\`\`\`bash
npm run dev
\`\`\`

Server akan berjalan di: **http://localhost:3000**

### 3. Build untuk Production

\`\`\`bash
npm run build
npm start
\`\`\`

## 📖 Panduan Penggunaan

### Halaman Peta (/)

1. **Melihat Peta**: Otomatis tampil saat membuka aplikasi
2. **Klik Polygon**: Untuk melihat detail informasi dalam popup
3. **Toggle Background**: Klik tombol "Show Full Map" atau "Hide Outside" untuk mengubah tampilan latar belakang
4. **Lihat Statistik**: Footer menampilkan total area, KK, dan penduduk

### Halaman Admin (/admin)

#### Menambah Polygon (Manual)

1. Klik tombol "+ Tambah Polygon (Manual)"
2. Isi form dengan data lengkap:
   - Nama Area
   - RW dan RT
   - Jumlah KK dan Penduduk
   - Ketua RT
   - Koordinat (format JSON array)
3. Klik "Simpan"

#### Menambah Polygon (Gambar di Peta)

1. Klik tombol "+ Gambar Polygon di Peta"
2. Klik icon polygon di pojok kanan atas peta
3. Klik di peta untuk membuat titik sudut polygon
4. Klik titik pertama lagi untuk menutup polygon
5. Isi form data yang muncul
6. Klik "Simpan"

#### Edit Polygon

1. Klik tombol "Edit" pada baris polygon di tabel
2. Ubah data yang diperlukan
3. Klik "Update"

#### Hapus Polygon

1. Klik tombol "Hapus" pada baris polygon
2. Konfirmasi penghapusan

## 🔌 API Endpoints

### GET /api/polygons

Mendapatkan semua polygon

**Response:**
\`\`\`json
{
"success": true,
"data": [
{
"id": "1",
"nama": "RT 002 / RW 001",
"rw": "001",
"rt": "002",
"jumlah_kk": 38,
"jumlah_penduduk": 152,
"ketua_rt": "Bapak Syamsul Bahri",
"coordinates": [[119.467, -5.145], ...]
}
]
}
\`\`\`

### POST /api/polygons

Membuat polygon baru

**Request Body:**
\`\`\`json
{
"nama": "RT 001 / RW 001",
"rw": "001",
"rt": "001",
"jumlah_kk": 45,
"jumlah_penduduk": 180,
"ketua_rt": "Bapak Ahmad",
"coordinates": [[119.467, -5.145], ...]
}
\`\`\`

### GET /api/polygons/[id]

Mendapatkan polygon berdasarkan ID

### PUT /api/polygons/[id]

Update polygon berdasarkan ID

### DELETE /api/polygons/[id]

Hapus polygon berdasarkan ID

## 🎨 Kustomisasi

### Mengubah Warna Polygon

Edit array `COLORS` di `src/components/MapComponent.tsx`:
\`\`\`typescript
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', ...];
\`\`\`

### Mengubah Posisi Awal Peta

Edit koordinat di `MapComponent.tsx`:
\`\`\`typescript
const map = L.map('map').setView([-5.154, 119.467], 14);
// [-5.154, 119.467] = latitude, longitude
// 14 = zoom level
\`\`\`

### Mengganti Data Storage

Saat ini menggunakan JSON file. Untuk database:

1. Install library database (Prisma, Mongoose, dll)
2. Update API routes di `src/pages/api/polygons/`
3. Replace `fs` operations dengan database queries

## 🔧 Troubleshooting

### Error: "window is not defined"

- Pastikan komponen map menggunakan `dynamic import` dengan `ssr: false`
- Sudah dihandle di file index.tsx dan admin.tsx

### Leaflet CSS tidak muncul

- Pastikan import CSS di `_app.tsx`
- Cek network tab browser untuk memastikan CSS terload

### Polygon tidak tampil

- Cek format koordinat (harus [longitude, latitude])
- Pastikan coordinate array memiliki minimal 3 titik
- Cek console browser untuk error

## 📝 Format Data Koordinat

Koordinat polygon menggunakan format GeoJSON:
\`\`\`json
[
[longitude1, latitude1],
[longitude2, latitude2],
[longitude3, latitude3],
[longitude1, latitude1] // Closing point
]
\`\`\`

**Contoh:**
\`\`\`json
[
[119.46467, -5.14576],
[119.46612, -5.14800],
[119.46729, -5.15016],
[119.46467, -5.14576]
]
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Netlify

1. Build project: `npm run build`
2. Deploy folder `out/` atau `.next/`

### Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package\*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## 📄 License

MIT License - bebas digunakan untuk project pribadi maupun komersial.

## 👨‍💻 Author

Dibuat dengan ❤️ menggunakan Next.js dan Leaflet

---

**Happy Coding! 🎉**
