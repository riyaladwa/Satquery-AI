# 🛰️ SatQuery AI — Full-Stack Geospatial Vision-Language Workstation

> An interactive Vision-Language intelligence platform for multimodal remote sensing image analysis through natural language text and voice queries. Designed and developed by **Riya P Ladwa**.

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_19_TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Leaflet](https://img.shields.io/badge/GIS_Map-Leaflet_1.9-199900.svg?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![ISRO Compliance](https://img.shields.io/badge/Quality_Checks-7_Gate_ISRO_Standard-orange.svg)]()
[![Tests](https://img.shields.io/badge/Tests-19%2F19_Passed-brightgreen.svg)]()

---

## Overview

**SatQuery AI** is an end-to-end, production-grade geospatial intelligence workstation that unifies multimodal satellite imagery (Optical, Multispectral, and Synthetic Aperture Radar) with agentic vision-language AI. It enables users to query complex Earth observation scenes using natural language (text or voice in English, Hindi, and Kannada), inspect pixel-level spectral reflectance, calculate real-time geodesic areas, detect bi-temporal environmental changes, and generate publication-grade intelligence reports.

### The Problem It Solves
Traditional Geographic Information Systems (GIS) such as QGIS or ArcGIS require specialized domain knowledge in band math, manual index computations (NDVI, NDWI, NDBI), and cumbersome desktop processing workflows. On the other hand, general multimodal LLMs lack spatial calibration, georeferencing awareness, and radiometric validation, often hallucinating geographical findings.

SatQuery AI bridges this gap by combining:
* Automated geospatial raster parsing (GeoTIFF, CRS, sub-pixel georeferencing).
* An agentic reasoning pipeline paired with an 8-model specialized registry for zero black-box explainability.
* Rigorous ISRO-compliant 7-gate input verification to ensure data integrity before inference.
* An interactive, browser-based GIS workstation equipped with live geodesic drawing tools and multi-temporal change detection.

---

## Key Features

### 🛰️ Multimodal Satellite Ingestion & Inspection
* **Format Support**: Ingests GeoTIFF (`.tif`, `.tiff`), PNG, and JPEG formats.
* **Automated Metadata Extraction**: Extracts Coordinate Reference System (CRS `EPSG:4326` / `EPSG:3857`), ground sampling distance (GSD), raster dimensions, spectral bands, acquisition date, and sensor platform.
* **Sensor Compatibility**: Pre-configured pipelines for **Sentinel-2 MSI**, **Sentinel-1 C-SAR (Microwave Radar)**, **Landsat-9 OLI-2**, **Cartosat-3**, and **PlanetScope SuperDove**.

### 🛡️ 7-Gate Input Quality Verification (ISRO Compliance Standard)
Before executing any AI model, incoming rasters undergo 7 automated quality checks:
1. **Format Integrity**: Validates container headers and raster byte structure.
2. **Georeferencing**: Ensures tie points or affine transformation matrices exist.
3. **CRS Projection**: Confirms valid projection against global and regional ellipsoids.
4. **Cloud Coverage**: Validates atmospheric occlusion to prevent clouded scenes from producing false classifications.
5. **Dynamic Contrast & Dynamic Range**: Measures radiometric histogram spread (0–100 score).
6. **Resolution & Spatial Consistency**: Asserts spatial ground sampling distance feasibility.
7. **Radiometric Bit-Depth**: Confirms multi-band radiometric fidelity.

### 🎯 Transparent & Auditable Intelligence (Zero Black Box)
Every analysis provides a complete explainability package:
* **WHAT**: Concrete natural language finding and target breakdown.
* **WHERE**: High-resolution vector polygons and bounding boxes overlaid on the interactive map.
* **WHY TRUST IT**: Radiometric verification, sub-pixel alignment, and multi-band spectral reflectance.
* **HOW**: Specialist model identity selected from the model registry.
* **HOW CERTAIN**: Model Confidence Score (%) coupled with an independent Data Reliability Score (*High*, *Medium*, *Low*).
* **EXECUTION TIMELINE**: Millisecond-precision audit trail tracking each step (Query &rarr; Task &rarr; Validation &rarr; Specialist Model &rarr; Spatial Grounding &rarr; Calibrated Localized Answer).

### 🗺️ Interactive Leaflet GIS Workstation
* **Dual Basemaps**: Toggle between high-resolution Esri World Imagery and clean Carto Light vector streets.
* **Pixel Inspector**: Click anywhere on the satellite raster to sample multi-band reflectance (Red, Green, Blue, NIR, SWIR-1, SWIR-2), NDVI, NDWI, NDBI, surface temperature, and land cover classification.
* **Real-Time Geodesic Area Measurement**: Interactive polygon drawing tool powered by PyProj WGS84 Geod computing area in **m²**, **km²**, **hectares**, and **acres** along with perimeter.

### 🔄 Bi-Temporal Change Detection & Multi-Sensor Comparison
* **Bi-Temporal Difference Mapping**: Interactive swipe slider comparing historical vs. current acquisitions (e.g., 2023 vs. 2026) with changed area deltas, concrete sprawl metrics, and change heatmaps.
* **Optical + SAR Dual-Stream Fusion**: Joint analysis combining Sentinel-2 optical bands with Sentinel-1 microwave radar backscatter, explaining cloud penetration, moisture dielectric returns, and sensor consensus %.

### 🗣️ Multilingual & Voice Accessibility
* **Native Languages**: Full support for **English**, **हिन्दी (Hindi)**, and **ಕನ್ನಡ (Kannada)**.
* **Voice Dictation**: Hands-free natural language queries using Web Speech API speech recognition.
* **Voice Playback**: Integrated SpeechSynthesis engine providing native audio playback of AI answers.

### 💾 Multi-Turn Session Persistence & Workspace Resumption
* All user sessions and multi-question conversation threads are persistently recorded in the SQLite / PostgreSQL database.
* The **History** view allows browsing past analyses, deleting records, or clicking **"Resume in Workspace"** to restore questions, answers, and spatial evidence overlays into the live map workstation.

### 📄 Publication-Grade PDF Reporting
* Integrated ReportLab GIS engine that generates formal PDF intelligence reports complete with executive summaries, acquisition metadata, spatial coordinates tables, and verified execution audit trails.

### ⚡ Enterprise Persistence & Auth (Supabase Integration)
* **11 Relational Tables**: Full schema with Row-Level Security (RLS) and automatic user sync triggers.
* **Cloud Storage**: Dedicated bucket (`satellite-images`) for rasters, previews, and compiled PDF reports.
* **Guest Capability Policy**: Unauthenticated guests can test up to 2 free capabilities before being prompted to sign in for unlimited access.

---

## Technologies Used

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Axios |
| **GIS & Mapping** | Leaflet 1.9, Esri World Imagery, OpenStreetMap, CARTO Light, GeoJSON |
| **Speech & Audio** | Web Speech API (Speech Recognition), SpeechSynthesis API, i18next |
| **Backend API** | Python 3.12, FastAPI, Pydantic v2, Uvicorn, SQLAlchemy |
| **Geospatial & Vector Core** | NumPy, Pillow, Tifffile, Shapely, PyProj (WGS84 Geod) |
| **Document Generation** | ReportLab PDF Intelligence Engine |
| **Database & Cloud Storage** | SQLite (zero-config local) / Supabase (PostgreSQL + S3 Storage + Auth) |
| **Deployment** | Vercel (unified serverless reverse proxy), Render / Railway ready |
| **Testing** | Pytest, TypeScript Compiler (`tsc`), Vite Build |

### Specialist AI Model Registry

| Model Name | Version | Primary Task | Supported Modalities | Base Confidence |
| :--- | :--- | :--- | :--- | :--- |
| **SatQuery RS-VLM Specialist** | `v2.1` | General Captioning & VQA | Optical, Multispectral | 94.0% |
| **GeoGrounder-Pro Spatial Segmentor** | `v1.8` | Text-Guided Target Grounding | Optical, Multispectral | 93.5% |
| **Bi-Temporal ChangeNet Engine** | `v2.0` | Multi-Temporal Change Detection | Bi-temporal Optical | 91.2% |
| **LandCover-7 Semantic UNet** | `v3.0` | 7-Class Surface Classification | Multispectral (12-Band) | 92.8% |
| **Optical-SAR Dual Fusion Engine** | `v1.5` | Cross-Sensor Radar Fusion | Optical + C-SAR Radar | 90.5% |
| **FloodInundation RapidNet** | `v2.2` | Emergency Disaster Response | SAR & Optical | 95.8% |
| **AgriCanopy VigorNet** | `v1.9` | NDVI Crop & Moisture Surveillance | Sentinel-2 Red-Edge/NIR | 93.2% |
| **UrbanSprawl GrowthNet** | `v2.4` | Concrete & Arterial Expansion | Bi-temporal Optical | 91.8% |

---

## How It Works

### Architectural Overview

```mermaid
flowchart TD
    subgraph Client["🖥️ Frontend Workstation (React 19 + TypeScript + Leaflet)"]
        UI["Clean Map & AI Copilot UI"]
        VoiceIO["Multilingual Web Speech (EN / HI / KN)"]
        UploadUI["GeoTIFF / TIFF / PNG Raster Uploader"]
        GISDraw["Geodesic Polygon & Pixel Inspector"]
        UI --> VoiceIO
        UI --> UploadUI
        UI --> GISDraw
    end

    subgraph Gateway["⚡ API Gateway (FastAPI + Pydantic v2)"]
        Router["CORS & REST Endpoints (/api)"]
        QualityGate["Automated 7-Gate Input Quality Verifier"]
    end

    subgraph AgenticCore["🧠 Agentic Orchestrator & Model Registry"]
        Classifier["Intent & Modality Classifier"]
        Registry["8-Model Specialized Registry"]
        Reasoner["Visual Grounding & Spectral Reasoner"]
        AuditTrail["Step-by-Step Execution Timeline"]
        Classifier --> Registry --> Reasoner --> AuditTrail
    end

    subgraph GeospatialEngines["🌐 Geospatial & Analytic Engines"]
        RasterEng["Tifffile / PIL Raster Engine (CRS, Bounds, Bands)"]
        VectorEng["PyProj WGS84 Geodesic Vector Engine"]
        ChangeEng["Bi-Temporal Difference & NDBI Heatmap Engine"]
        FusionEng["Optical-SAR Dual-Stream Backscatter Engine"]
        PDFGen["ReportLab PDF Intelligence Builder"]
    end

    subgraph Database["🗄️ Persistence Layer (SQLite / PostgreSQL)"]
        DB[(Analysis Sessions, Query Logs, Evidence Polygons, Images)]
    end

    Client <-->|REST API / Axios| Gateway
    Gateway --> QualityGate
    QualityGate --> AgenticCore
    AgenticCore <--> GeospatialEngines
    Gateway <--> Database
```

### End-to-End Processing Workflow
1. **Raster Ingestion & Validation**: A satellite scene is selected or uploaded. The backend validates raster integrity, CRS coordinates, and cloud cover against the 7-gate quality protocol.
2. **Natural Language Understanding**: Natural language input (typed or captured via speech dictation in English, Hindi, or Kannada) is classified by intent, target phenomena, and required sensor modality.
3. **Agentic Dispatch & Model Execution**: The orchestrator routes the task to the designated specialist model (e.g., LandCover UNet, GeoGrounder-Pro, or ChangeNet) for inference.
4. **Spatial Grounding & Spectral Sampling**: Results are converted into GeoJSON vector geometries with calibrated pixel coordinates and spectral index values.
5. **Geodesic Calculation**: The PyProj WGS84 Geod engine computes true geodesic areas and perimeters.
6. **Persistence & Export**: The entire conversation thread, spatial evidence, and metrics are stored in the database and can be exported as a publication-ready PDF intelligence report.

---

## Project Structure

```text
Satquery-AI/
├── public/                  # Public static assets (favicons, SVGs)
├── server/                  # FastAPI Python backend
│   ├── app/                 # API routers, agents, database, geospatial engines
│   │   ├── core/            # Configuration and database models
│   │   ├── routers/         # REST endpoints (/analyze, /compare, /reports, etc.)
│   │   └── services/        # Raster parsing, quality gates, PDF generation
│   ├── tests/               # Pytest automated test suite
│   ├── requirements.txt     # Python backend dependencies
│   └── main.py              # Server entry point & ASGI application
├── src/                     # React 19 + TypeScript + Vite frontend
│   ├── components/          # Leaflet maps, workstation drawers, modals, header
│   ├── pages/               # Workstation, Explore, Compare, MyWork, Reports
│   ├── services/            # Axios API client, Supabase client, asset resolver
│   ├── types/               # TypeScript data models and interfaces
│   └── App.tsx              # Main application shell & router
├── data/                    # Geospatial rasters, previews, and database
│   ├── demo/                # Multi-sensor satellite GeoTIFFs
│   ├── previews/            # Generated RGB preview rasters
│   └── reports/             # Compiled PDF intelligence reports
├── .env.example             # Environment variables template
├── .gitignore
├── LICENSE                  # MIT License
├── README.md                # Project documentation
├── dev.sh                   # Concurrent local runner script
├── index.html               # Frontend HTML root
├── package.json             # Root npm dependencies & build scripts
├── package-lock.json
├── requirements.txt         # Root Python requirements
├── supabase_schema.sql      # Supabase PostgreSQL schema with RLS & triggers
├── tsconfig.json            # TypeScript configuration
├── vercel.json              # Unified Vercel serverless reverse proxy
└── vite.config.ts           # Vite configuration & dev proxy
```

---

## Installation & Setup

### Prerequisites
* **Node.js**: v18+ and npm
* **Python**: 3.10+ (Python 3.12 recommended)

### Option A: One-Command Concurrent Launch (Recommended)
This repository includes a unified runner script that sets up dependencies, checks the database, and launches both FastAPI and Vite dev servers concurrently:

```bash
# Clone the repository
git clone https://github.com/riyaladwa/Satquery-AI.git
cd Satquery-AI

# Run the concurrent launcher
chmod +x dev.sh
./dev.sh
```

Once running:
* **Frontend Workstation**: [http://localhost:5173](http://localhost:5173)
* **FastAPI Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **API Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### Option B: Manual Step-by-Step Setup

#### 1. Backend Setup
```bash
# From repository root:
python3 -m venv server/venv
source server/venv/bin/activate
pip install -r requirements.txt

# Run automated backend test suite
PYTHONPATH=server server/venv/bin/pytest server/tests/ -v

# Start FastAPI server
PYTHONPATH=server python3 server/main.py
```

#### 2. Frontend Setup
```bash
# From repository root:
npm install
npm run dev
```

---

### Supabase Cloud Setup (Optional)
SatQuery AI includes zero-config local SQLite (`data/satquery.db`) out of the box. For cloud persistence, storage, and authentication with Supabase:

1. **Apply Schema**: Copy the contents of [`supabase_schema.sql`](supabase_schema.sql) and run it in your Supabase SQL Editor.
2. **Configure `.env`**:
   ```env
   # Frontend (public)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key

   # Backend (secure)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-or-publishable-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
   SUPABASE_STORAGE_BUCKET=satellite-images
   DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
   ```

---

### Deployment on Vercel
SatQuery AI is preconfigured for unified deployment on [Vercel](https://vercel.com):

1. Import the repository into your Vercel dashboard.
2. Set build command to `npm run build` and output directory to `dist`.
3. Add environment variables if utilizing Supabase or Google Gemini API.
4. Deploy — the frontend SPA and FastAPI serverless backend (`server/main.py`) run seamlessly under a single domain.

---

## Usage

### 1. Navigating the Workstation
* Open [http://localhost:5173](http://localhost:5173).
* Select any pre-loaded satellite scene (e.g., Bengaluru Urban Expansion, Mumbai Coastal Radar, Kerala Flood Inundation) or upload a custom GeoTIFF/PNG image.

### 2. Asking Vision-Language Queries
* Type a natural language prompt in the query input (e.g., *"Identify urban encroachment near water bodies"* or *"What is the flood inundation percentage?"*).
* Alternatively, click the microphone button to dictate queries in **English**, **Hindi**, or **Kannada**.
* The response includes concrete answers, confidence scores, execution timelines, and vector polygon overlays on the map.

### 3. Pixel Inspection & Geodesic Measurement
* Click the **Inspect Pixel** tool and click anywhere on the raster to sample raw multi-band reflectance, NDVI, NDWI, and land cover classification.
* Select the **Draw Polygon** tool to outline an area of interest; the PyProj WGS84 Geod engine computes the exact ground area in square meters, hectares, and acres in real time.

### 4. Bi-Temporal Change & Radar Fusion
* Open the **Compare** drawer to slide between historical and recent acquisitions to view concrete sprawl metrics and difference heatmaps.
* Switch to the **Optical-SAR** view to inspect radar backscatter returns through cloud-covered scenes.

### 5. Exporting PDF Reports
* Click **Generate Report** to compile a formal, publication-ready PDF containing the executive summary, coordinate bounds, metadata, and verified execution audit trail.

### 6. REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check, platform version, and engine status |
| `/api/images` | `GET` | List all available satellite scenes and raster metadata |
| `/api/images/{id}` | `GET` | Retrieve metadata, bounds, CRS, and preview for a scene |
| `/api/images/upload` | `POST` | Upload GeoTIFF/PNG/JPEG, georeference, and generate preview |
| `/api/images/{id}/validate` | `GET` | Run automated 7-gate ISRO-compliant input quality checks |
| `/api/analyze` | `POST` | Execute agentic vision-language query with spatial evidence |
| `/api/pixel/inspect` | `GET` | Sample multi-band reflectance, NDVI, and surface classification |
| `/api/area/calculate` | `POST` | Calculate WGS84 geodesic polygon area (m², km², ha, acres) |
| `/api/compare/bitemporal` | `GET` | Compute change metrics and spatial polygons between two scenes |
| `/api/compare/optical-sar` | `GET` | Joint Optical + SAR radar cross-sensor fusion analysis |
| `/api/history/sessions` | `GET` | Retrieve list of recorded multi-turn analysis sessions |
| `/api/history/sessions/{id}` | `GET` | Get full conversation thread and evidence for a session |
| `/api/history/sessions/{id}` | `DELETE` | Delete an analysis session from the database |
| `/api/reports/generate` | `POST` | Compile formal PDF intelligence report with ReportLab |
| `/api/reports/{id}/download` | `GET` | Download generated PDF intelligence report |
| `/api/models` | `GET` | Inspect active models in the registry |

---

## Screenshots

### Multimodal Satellite Scenes & Analysis Previews
Below are representative satellite scene previews and analysis rasters processed by SatQuery AI:

| Scene / Modality | Sensor & Region | Description | Preview |
| :--- | :--- | :--- | :--- |
| **Optical Urban Monitoring** | Sentinel-2 MSI (Bengaluru) | High-resolution multispectral optical scene used for urban growth and canopy surveillance. | ![Bengaluru Sentinel-2](data/previews/bengaluru_sentinel2_2026.png) |
| **Synthetic Aperture Radar (SAR)** | Sentinel-1 C-SAR (Mumbai Coast) | Microwave radar backscatter capturing coastal waterline dynamics regardless of cloud cover. | ![Mumbai Coastal SAR](data/previews/mumbai_coastal_sentinel1_sar.png) |
| **Disaster Response & Inundation** | Sentinel-1 / Optical Fusion (Kerala) | Flood extent mapping and submerged infrastructure delineation for emergency response. | ![Kerala Flood Aftermath](data/previews/kerala_flood_aftermath_2024.png) |
| **Agricultural Health** | Sentinel-2 Red-Edge (Punjab) | Cropland canopy health and moisture surveillance using calibrated NDVI indices. | ![Punjab Cropland](data/previews/punjab_cropland_sentinel2.png) |

---

## Future Improvements

* 🛰️ **Live STAC Catalog Ingestion**: Direct integration with Copernicus Data Space and USGS EarthExplorer via SpatioTemporal Asset Catalog (STAC) APIs for automated on-demand satellite scene retrieval.
* 🧠 **Edge-Optimized RS-VLM Models**: Fine-tuning specialized open-source lightweight vision-language models (e.g., RemoteCLIP, GeoChat) converted to ONNX / TensorRT for sub-second offline edge inference.
* 🌐 **3D Elevation & Terrain Modeling**: Integration of CesiumJS / MapLibre 3D with Copernicus 30m Digital Elevation Models (DEM) for topographic flood simulation and slope analysis.
* 🔔 **Autonomous Geospatial Alerting**: Scheduled geo-fencing cron jobs monitoring critical zones for unauthorized deforestation, reservoir depletion, or rapid urban sprawl with automated webhook notifications.
* 📦 **Containerized Field Appliance**: Multi-arch Docker images tailored for edge hardware (such as NVIDIA Jetson) for field operators without internet connectivity.

---

## Developer

**Riya P Ladwa**
* GitHub: [https://github.com/riyaladwa](https://github.com/riyaladwa)

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
