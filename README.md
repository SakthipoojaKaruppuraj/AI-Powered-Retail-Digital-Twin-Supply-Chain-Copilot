# LOGIS-TWIN: AI-Powered Retail Digital Twin & Supply Chain Copilot

**LOGIS-TWIN** is a server-authoritative 3D Digital Twin, Computer Vision telemetry processor, and AI-powered Warehouse Management System (WMS). It combines real-time inventory telemetry, 3D spatial visualization, automated computer vision discrepancy processing, deterministic demand forecasting, FEFO expiry intelligence, occupancy analytics, and Gemini LLM operational reasoning into a unified dashboard.

---

## System Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   REACT DASHBOARD                                      │
│                                  (frontend/src/)                                       │
│  ┌───────────────────────┬───────────────────────┬──────────────────────────────────┐  │
│  │    DigitalTwin3D      │     VisionEngine      │         CopilotChat UI           │  │
│  │   (Three.js Racks)    │  (Simulated CV Scan)  │      (Gemini 2.5-Flash Chat)     │  │
│  └───────────────────────┴───────────────────────┴──────────────────────────────────┘  │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │ HTTP REST / Proxy (/api)
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              EXPRESS REST API SERVER                                   │
│                                (backend/server.js)                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     server/warehouseStore.js (Single Source of Truth)           │  │
│  │                   Products • Shelves • Camera Feeds • Alerts • AGVs              │  │
│  └──────┬──────────────────────┬──────────────────────┬──────────────────────┬──────┘  │
│         │                      │                      │                      │         │
│         ▼                      ▼                      ▼                      ▼         │
│  demandForecast.js    expiryIntelligence.js   occupancyIntelligence.js  safetyIntelligence.js
│  (7-Day WMA Forecast)   (FEFO Expiry Exposure)  (Capacity & Zone Occ)   (P1..P4 Hazards)  │
│         │                      │                      │                      │         │
│         └──────────────────────┴──────────┬───────────┴──────────────────────┘         │
│                                           │                                            │
│                                           ▼                                            │
│                                    copilotContext.js                                   │
│                        (Query Intent Classifier & Context Builder)                     │
│                                           │                                            │
│                                           ▼                                            │
│                                 Google GenAI (Gemini)                                  │
│                              (LLM Operational Reasoning)                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```text
WMS /
├── backend/
│   ├── server.js                      # Express REST Server & Endpoint Routes
│   ├── warehouseStore.js              # Authoritative Central Warehouse State (Single Source of Truth)
│   ├── demandForecast.js              # Phase 3.2: 7-Day Weighted Moving Average Forecast Engine
│   ├── expiryIntelligence.js          # Phase 3.3: Deterministic FEFO & Expiry Exposure Engine
│   ├── occupancyIntelligence.js       # Phase 3.4: Capacity Occupancy & 7-Day Projection Engine
│   ├── safetyIntelligence.js          # Phase 3.5: Safety Compliance & Priority Monitoring Engine
│   └── copilotContext.js              # Intent Classifier & Server-Side Telemetry Context Builder
│
├── frontend/
│   ├── src/
│   │   ├── components/                # Modular React Dashboard Components
│   │   │   ├── CopilotChat.jsx        # Gemini AI Assistant Interface
│   │   │   ├── DemandForecast.jsx     # Demand Forecast & Reorder Recommendation Module
│   │   │   ├── DigitalTwin3D.jsx      # Three.js 3D Digital Twin Visualizer
│   │   │   ├── ExpiryIntel.jsx        # FEFO Expiry Intelligence Panel
│   │   │   ├── InventorySync.jsx      # CV Count Discrepancy & DB Sync Workspace
│   │   │   ├── OccupancyPredictor.jsx # Shelf Occupancy Predictor Module
│   │   │   ├── ReportGenerator.jsx    # Warehouse Analytics Export & PDF/CSV Reports
│   │   │   ├── RouteOptimizer.jsx     # AGV Fleet Routing & Dispatch Panel
│   │   │   ├── SafetyMonitor.jsx      # Live Computer Vision Safety Compliance Monitor
│   │   │   └── VisionEngine.jsx       # Camera Streams & Simulated CV Pipeline
│   │   ├── services/
│   │   │   └── api.js                 # Frontend REST API Client
│   │   ├── App.jsx                    # Core Container & Main Navigation Tabs
│   │   ├── main.jsx                   # React Entry Point
│   │   └── index.css                  # Tailwind CSS Styling & Glassmorphic Utilities
│   ├── public/                        # Static Assets & Icons
│   ├── index.html                     # HTML Template
│   └── vite.config.js                 # Vite Config & REST API Proxy
│
├── .env                               # Environment Secrets (GEMINI_API_KEY, PORT)
├── .env.example                       # Environment Variable Template
├── package.json                       # Root Package & Execution Scripts
└── README.md                          # Production System Documentation
```

---

## Intelligence Modules Suite

### 1. Centralized Warehouse Data Layer (`backend/warehouseStore.js`)
- Authoritative single source of truth for products, shelf quantities, capacities, camera feeds, discrepancies, alerts, and AGV fleet telemetry.
- All intelligence engines and frontend modules derive data from `warehouseStore.js`.

### 2. Computer Vision Pipeline (`frontend/src/components/VisionEngine.jsx`)
- Prototype CV pipeline processing raw camera detections (`POST /api/vision/detections`).
- Barcode → SKU → Product matching priority hierarchy.
- Flags mismatches (`dbCount` vs `camCount`) with status `REVIEW_REQUIRED`.
- Supports manual manager DB synchronization via `POST /api/shelves/sync-db`.

### 3. Gemini Warehouse Copilot (`backend/copilotContext.js` & `backend/server.js`)
- Server-authoritative LLM assistant (`gemini-2.5-flash`).
- Intent-based context builder (`inventory`, `stockout`, `discrepancy`, `expiry`, `occupancy`, `safety`, `agv`, `historical_cv`).
- Implements prompt injection defense, secret protection, and a deterministic telemetry fallback engine for quota limits/offline mode.

### 4. Demand Forecast Intelligence (`backend/demandForecast.js`)
- 7-Day Weighted Moving Average algorithm (`weights: [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6]`).
- Recent demand velocity, trend detection (`INCREASING`, `STABLE`, `DECREASING`), Days of Supply calculation, and deterministic stockout risk classification (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- Capacity-capped reorder recommendations ensuring `currentStock + recommendedReorderQty <= capacity`.

### 5. Expiry Intelligence & FEFO Layer (`backend/expiryIntelligence.js`)
- Strict **First-Expired, First-Out (FEFO)** priority ordering based on earliest expiry date (`daysUntilExpiry`).
- Computes `expectedDemandBeforeExpiry` and `estimatedExpiryExposure` (`Math.max(0, currentStock - expectedDemand)`).
- Assigns deterministic dispatch recommendations (`DISPATCH_NOW`, `DISPATCH_NEXT`, `NORMAL`, `EXPIRED_REVIEW_DISPOSAL`).

### 6. Occupancy Intelligence & Prediction (`backend/occupancyIntelligence.js`)
- Calculates shelf capacity occupancy percentages and dynamic zone breakdowns (`Aisle A`, `Aisle B`, `Aisle C`, `Promo Zone`).
- Categorizes underutilized shelves (<30%), near-full shelves (>=75%), and overflow risk shelves (>100% without clamping).
- Provides a 7-day demand-driven projected occupancy state (`Math.max(0, currentStock - forecastDailyDemand * 7)`).

### 7. Safety Intelligence & Risk Monitoring (`backend/safetyIntelligence.js`)
- Normalizes safety alerts into structured categories (`PPE`, `OBSTRUCTION`, `FIRE`, `SMOKE`, `SPILL`, `COLLISION`, `TEMPERATURE`, `INTRUSION`, `OTHER`).
- Assigns severity ranks (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and operational priorities (`P1`..`P4`).
- Computes highest warehouse risk level and dynamic zone safety risk levels.

---

## REST API Reference

| Endpoint | Method | Query / Body Params | Description |
|---|---|---|---|
| `/api/health` | `GET` | — | Health check & facility status |
| `/api/warehouse` | `GET` | — | Warehouse metadata and zone catalog |
| `/api/products` | `GET` | — | Product master catalog |
| `/api/shelves` | `GET` | — | Enriched shelf inventory state & occupancy |
| `/api/demand-forecast` | `GET` | `product`, `weather`, `festival`, `promo` | 7-day Weighted Moving Average forecast & reorders |
| `/api/expiry-intelligence` | `GET` | `product` | FEFO dispatch priorities & expiry exposure |
| `/api/occupancy-intelligence` | `GET` | `zone`, `shelf`, `product` | Inventory capacity occupancy & 7-day projections |
| `/api/safety-intelligence` | `GET` | `zone`, `severity`, `status`, `camera`, `shelf` | Safety compliance alerts, P1..P4 priorities & zone risks |
| `/api/vision/detections` | `POST` | `{ cameraId, items, hasAnomaly }` | CV camera detection scan payload |
| `/api/vision/history` | `GET` | — | In-memory audit scan detection history |
| `/api/shelves/sync-db` | `POST` | `{ discrepancyIds, mismatches }` | Synchronize verified CV counts to DB |
| `/api/shelves/restock-all` | `POST` | — | Restock low shelves (<20%) to 90% capacity |
| `/api/shelves/promotion` | `POST` | `{ fromShelfId, targetShelfId }` | Move expiring items to Promotion Rack (D1) |
| `/api/discrepancies` | `GET` | `includeResolved=true` | Inventory count discrepancies |
| `/api/alerts` | `GET` | — | Active safety alerts |
| `/api/alerts` | `POST` | `{ text, severity, zone }` | Create safety alert |
| `/api/alerts/:id` | `DELETE` | — | Resolve / delete safety alert by ID |
| `/api/agvs` | `GET` | — | AGV fleet position & task telemetry |
| `/api/copilot/chat` | `POST` | `{ message }` | Server-authoritative Gemini LLM Copilot route |

---

## Setup & Local Execution Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3001
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Backend Server
In terminal 1:
```bash
npm run server
```
*Backend REST API server runs on `http://localhost:3001`.*

### 4. Start Frontend Dashboard
In terminal 2:
```bash
npm run dev
```
*Vite dev server runs on `http://localhost:5173` with proxying to `http://localhost:3001/api`.*

### 5. Production Build Verification
To compile the client for production:
```bash
npm run build
```

---

## License & Credits
Developed as part of the Advanced WMS Retail Digital Twin & Supply Chain Intelligence Platform. Powered by React, Vite, Three.js, Express, Tailwind CSS, Recharts, and Google GenAI Gemini.
