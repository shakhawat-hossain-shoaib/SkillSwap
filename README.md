# 🔄 SkillSwap — Peer-to-Peer Skill Exchange Platform

> **"Learn More. Spend Less."** — An AI-powered peer-to-peer cashless skill exchange platform built with modern architecture.

---

## 🏗️ Architecture & Component Separation

The project is cleanly decoupled into 3 completely independent components:

```
SkillSwap/
├── 🗄️ database/               # Dedicated Database Layer
│   ├── init.sql               # MySQL Schema & Initial Seed Data
│   ├── docker-compose.db.yml  # Standalone Database Docker Setup
│   ├── .env.example           # Database Environment Variables Template
│   └── README.md              # Database Guide & EF Migrations
│
├── ⚙️ backend/                # Independent Backend API (.NET 10 Web API)
│   ├── SkillSwap.Api/         # Controllers, Services, AI Matchmaking, Hubs
│   ├── tests/                 # Backend Automated Unit Tests (xUnit)
│   │   └── SkillSwap.Tests/
│   ├── Dockerfile             # Multi-stage Docker build for .NET API
│   ├── .env.example           # Backend Environment Configuration
│   └── SkillSwap.slnx         # Solution Configuration
│
├── 🎨 frontend/               # Independent Client Application (React + Vite)
│   ├── src/                   # React 18, TypeScript, Tailwind CSS, Lucide Icons
│   ├── Dockerfile             # Nginx-based production Docker build
│   ├── nginx.conf             # Production Reverse Proxy Config
│   └── .env.example           # Frontend Environment Configuration
│
└── 🐳 docker-compose.yml      # Orchestrates all 3 decoupled services together
```

---

## 🚀 Running the Services

### Option A: Run All Services Together (Docker Compose)
To start Database, Backend, and Frontend all at once:
```bash
docker compose up --build
```
- **Frontend App**: http://localhost:5173
- **Backend Swagger API**: http://localhost:5080/swagger
- **Database (MySQL)**: `localhost:3306`

---

### Option B: Run Services Individually (Local Development)

#### 1. Start the Database
```bash
# Using standalone Docker:
docker compose -f database/docker-compose.db.yml up -d

# Or run your local MySQL / XAMPP on port 3306 and import database/init.sql
```

#### 2. Start the Backend API
```bash
cd backend/SkillSwap.Api
dotnet run --launch-profile http
```
- Backend runs at: `http://localhost:5080`
- Swagger UI available at: `http://localhost:5080/swagger`

#### 3. Start the Frontend Client
```bash
cd frontend
npm install
npm run dev
```
- Frontend runs at: `http://localhost:5173`

---

## 🧪 Running Tests
```bash
dotnet test backend/tests/SkillSwap.Tests/SkillSwap.Tests.csproj
```

---

## 🔐 Default Credentials
- **Admin Email**: `admin@skillswap.app`
- **Admin Password**: `AdminSkillSwap2026!`
- **Demo User 1**: `sarah.jenkins@example.com` / `AdminSkillSwap2026!`
- **Demo User 2**: `alex.rivera@example.com` / `AdminSkillSwap2026!`
