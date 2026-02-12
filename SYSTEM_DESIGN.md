# System Design - Peta Interaktif RT/RW

## 📋 Overview

Aplikasi web full-stack untuk manajemen dan visualisasi data geografis wilayah RT/RW menggunakan peta interaktif.

## 🎯 Requirements

### Functional Requirements

1. Menampilkan peta interaktif wilayah RT/RW
2. CRUD operations untuk data polygon
3. Admin panel untuk manajemen data
4. Menggambar polygon langsung di peta
5. Toggle background area di luar polygon
6. Popup informasi detail untuk setiap area
7. Statistik real-time (total area, KK, penduduk)

### Non-Functional Requirements

1. **Performance**: Load time < 2 detik
2. **Scalability**: Support 100+ polygon
3. **Usability**: User-friendly interface
4. **Maintainability**: Clean code, modular architecture
5. **Responsive**: Mobile & desktop support

## 🏗️ Architecture

### High-Level Architecture

\`\`\`
┌─────────────────┐
│ Client Side │
│ (Browser) │
│ │
│ - React/Next │
│ - Leaflet Map │
│ - Tailwind CSS │
└────────┬────────┘
│
│ HTTP/REST
│
┌────────▼────────┐
│ Server Side │
│ (Next.js) │
│ │
│ - API Routes │
│ - SSR/SSG │
└────────┬────────┘
│
│ File I/O
│
┌────────▼────────┐
│ Data Layer │
│ │
│ - JSON File │
│ (polygons.json)│
└─────────────────┘
\`\`\`

### Component Architecture

\`\`\`
┌──────────────────────────────────────┐
│ Application │
├──────────────────────────────────────┤
│ Pages │
│ ├─ index.tsx (Home/Map Page) │
│ ├─ admin.tsx (Admin Panel) │
│ └─ \_app.tsx (App Wrapper) │
├──────────────────────────────────────┤
│ Components │
│ ├─ MapComponent │
│ │ └─ Display polygons on map │
│ ├─ MapDrawComponent │
│ │ └─ Draw new polygons │
│ └─ PolygonForm │
│ └─ CRUD form interface │
├──────────────────────────────────────┤
│ API Layer │
│ ├─ /api/polygons (GET, POST) │
│ └─ /api/polygons/[id] │
│ (GET, PUT, DELETE) │
├──────────────────────────────────────┤
│ Data Layer │
│ └─ polygons.json │
└──────────────────────────────────────┘
\`\`\`

## 🔄 Data Flow

### 1. Display Polygons (Read)

\`\`\`
User → Visit Homepage
↓
index.tsx → useEffect()
↓
fetch('/api/polygons')
↓
API Route → Read polygons.json
↓
Return JSON Data
↓
MapComponent → Render polygons on Leaflet map
↓
User sees interactive map
\`\`\`

### 2. Create Polygon

#### Method A: Manual Input

\`\`\`
Admin → Click "Tambah Polygon (Manual)"
↓
PolygonForm → Show form
↓
User fills form & coordinates JSON
↓
Submit → POST /api/polygons
↓
API Route → Append to polygons.json
↓
Response → Success
↓
Refresh list
\`\`\`

#### Method B: Draw on Map

\`\`\`
Admin → Click "Gambar Polygon di Peta"
↓
MapDrawComponent → Show interactive map
↓
User draws polygon with Leaflet Draw
↓
onPolygonDrawn → Extract coordinates
↓
PolygonForm → Auto-fill coordinates
↓
User fills other data
↓
Submit → POST /api/polygons
↓
API Route → Append to polygons.json
↓
Response → Success
\`\`\`

### 3. Update Polygon

\`\`\`
Admin → Click "Edit" on table row
↓
PolygonForm → Pre-fill with existing data
↓
User modifies data
↓
Submit → PUT /api/polygons/[id]
↓
API Route → Update in polygons.json
↓
Response → Success
↓
Refresh list
\`\`\`

### 4. Delete Polygon

\`\`\`
Admin → Click "Hapus"
↓
Confirmation dialog
↓
Confirm → DELETE /api/polygons/[id]
↓
API Route → Remove from polygons.json
↓
Response → Success
↓
Refresh list
\`\`\`

## 💾 Data Model

### Polygon Entity

\`\`\`typescript
interface Polygon {
id: string; // Unique identifier (timestamp)
nama: string; // Area name (e.g., "RT 002 / RW 001")
rw: string; // RW number (e.g., "001")
rt: string; // RT number (e.g., "002")
jumlah_kk: number; // Number of families
jumlah_penduduk: number; // Total population
ketua_rt: string; // RT head name
coordinates: [number, number][]; // [longitude, latitude] pairs
}
\`\`\`

### Data Storage Format (JSON)

\`\`\`json
{
"polygons": [
{
"id": "1",
"nama": "RT 002 / RW 001",
"rw": "001",
"rt": "002",
"jumlah_kk": 38,
"jumlah_penduduk": 152,
"ketua_rt": "Bapak Syamsul Bahri",
"coordinates": [
[119.4646722719828, -5.1459454481234275],
[119.46169636529709, -5.146573120515825],
...
]
}
]
}
\`\`\`

## 🔌 API Design

### 1. GET /api/polygons

**Purpose**: Get all polygons

**Request**: None

**Response**:
\`\`\`json
{
"success": true,
"data": [Polygon[]]
}
\`\`\`

### 2. POST /api/polygons

**Purpose**: Create new polygon

**Request**:
\`\`\`json
{
"nama": "string",
"rw": "string",
"rt": "string",
"jumlah_kk": number,
"jumlah_penduduk": number,
"ketua_rt": "string",
"coordinates": [[number, number]]
}
\`\`\`

**Response**:
\`\`\`json
{
"success": true,
"data": Polygon
}
\`\`\`

### 3. GET /api/polygons/[id]

**Purpose**: Get single polygon

**Request**: ID in URL parameter

**Response**:
\`\`\`json
{
"success": true,
"data": Polygon
}
\`\`\`

### 4. PUT /api/polygons/[id]

**Purpose**: Update polygon

**Request**:

- ID in URL parameter
- Updated polygon data in body

**Response**:
\`\`\`json
{
"success": true,
"data": Polygon
}
\`\`\`

### 5. DELETE /api/polygons/[id]

**Purpose**: Delete polygon

**Request**: ID in URL parameter

**Response**:
\`\`\`json
{
"success": true,
"message": "Polygon deleted"
}
\`\`\`

## 🎨 UI/UX Design

### Home Page (/)

\`\`\`
┌────────────────────────────────────────┐
│ Header: "Peta Interaktif RT/RW" │
│ [Admin Panel Button] │
├────────────────────────────────────────┤
│ │
│ [Toggle Background] │
│ │
│ INTERACTIVE MAP │
│ (Colored Polygons) │
│ │
│ - Hover: Highlight │
│ - Click: Show popup │
│ │
├────────────────────────────────────────┤
│ Footer Stats: │
│ [6 Areas] [322 KK] [1,276 People] │
└────────────────────────────────────────┘
\`\`\`

### Admin Page (/admin)

\`\`\`
┌────────────────────────────────────────┐
│ Header: "Admin Panel" │
│ [Lihat Peta Button] │
├────────────────────────────────────────┤
│ [+ Tambah Polygon] [+ Gambar Polygon] │
├────────────────────────────────────────┤
│ Data Table: │
│ ┌──────┬────┬────┬────────┬──────┐ │
│ │ Nama │ RW │ RT │ KK │ Aksi │ │
│ ├──────┼────┼────┼────────┼──────┤ │
│ │ RT 1 │001 │001 │ 38 │Edit Del│ │
│ │ RT 2 │001 │002 │ 52 │Edit Del│ │
│ └──────┴────┴────┴────────┴──────┘ │
└────────────────────────────────────────┘
\`\`\`

## 🔒 Security Considerations

### Current Implementation

- **No Authentication**: Admin panel is publicly accessible
- **File-based Storage**: JSON file, no encryption
- **Input Validation**: Basic client-side validation

### Recommended Improvements

1. **Authentication**: Add login system for admin
2. **Authorization**: Role-based access control (RBAC)
3. **Input Sanitization**: Server-side validation
4. **Database**: Move to secure database (PostgreSQL, MongoDB)
5. **API Rate Limiting**: Prevent abuse
6. **HTTPS**: SSL/TLS encryption
7. **CSRF Protection**: Add CSRF tokens
8. **XSS Prevention**: Sanitize user inputs

## 📈 Scalability

### Current Limitations

- JSON file I/O becomes slow with 100+ polygons
- No caching mechanism
- Single server, no load balancing

### Scaling Strategy

#### Phase 1: Database Migration

\`\`\`
JSON File → PostgreSQL/MongoDB

- Indexed queries
- Better performance
- Data integrity
  \`\`\`

#### Phase 2: Caching

\`\`\`
Add Redis Cache

- Cache polygon data
- Reduce database queries
- Faster response time
  \`\`\`

#### Phase 3: CDN & Optimization

\`\`\`

- Serve static assets via CDN
- Image optimization
- Code splitting
- Lazy loading
  \`\`\`

#### Phase 4: Microservices (Optional)

\`\`\`
Monolith → Microservices

- Map Service
- Data Service
- User Service
- API Gateway
  \`\`\`

## 🧪 Testing Strategy

### Unit Tests

- API route handlers
- Component rendering
- Utility functions

### Integration Tests

- API endpoints
- Database operations
- Form submissions

### E2E Tests

- User flows (create, read, update, delete)
- Map interactions
- Admin panel operations

### Tools

- Jest + React Testing Library
- Cypress for E2E
- MSW for API mocking

## 🚀 Deployment Strategy

### Development

\`\`\`bash
npm run dev

# Local: http://localhost:3000

\`\`\`

### Staging

\`\`\`
Deploy to Vercel Preview

- Automatic on PR
- Test before production
  \`\`\`

### Production

\`\`\`
Deploy to Vercel

- Main branch auto-deploy
- Custom domain
- Environment variables
  \`\`\`

## 📊 Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics**: Performance monitoring
2. **Sentry**: Error tracking
3. **Google Analytics**: User behavior
4. **LogRocket**: Session replay

### Metrics to Track

- Page load time
- API response time
- Error rate
- User engagement
- Map interactions

## 🔄 Future Enhancements

### Phase 1 (Current)

✅ Basic CRUD operations  
✅ Interactive map display  
✅ Admin panel  
✅ Draw polygon on map

### Phase 2

- [ ] User authentication & authorization
- [ ] Database integration (PostgreSQL)
- [ ] Search & filter functionality
- [ ] Export data (PDF, Excel)

### Phase 3

- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Phase 4

- [ ] AI-powered insights
- [ ] Predictive analytics
- [ ] Integration with government data
- [ ] Public API for third-party

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Active Development
