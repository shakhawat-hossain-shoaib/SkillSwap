# SkillSwap Database Layer

This directory isolates the database layer, schema definitions, seed scripts, and standalone database management for SkillSwap.

---

## Structure
- `init.sql`: Complete MySQL schema, table indexes, foreign keys, and seed accounts (Admin & demo users).
- `docker-compose.db.yml`: Standalone Docker configuration for launching the MySQL database service independently.
- `.env.example`: Environment variables template for database credentials.

---

## How to Run the Database Independently

### Option 1: Using Docker Compose (Recommended)
To run only the database in the background:
```bash
docker compose -f database/docker-compose.db.yml up -d
```

To stop the database:
```bash
docker compose -f database/docker-compose.db.yml down
```

To inspect database logs:
```bash
docker compose -f database/docker-compose.db.yml logs -f
```

---

### Option 2: Using Local MySQL / XAMPP
1. Start MySQL on port `3306`.
2. Import `init.sql`:
```bash
mysql -u root -p < database/init.sql
```

---

## Entity Framework Core Migrations
If updating models via the backend:
```bash
# Navigate to repository root
dotnet ef migrations add <MigrationName> --project backend/SkillSwap.Api --startup-project backend/SkillSwap.Api
dotnet ef database update --project backend/SkillSwap.Api --startup-project backend/SkillSwap.Api
```
