# Deployment for Demo

This document describes how to run the full **violet-carnation** application stack using Docker Compose. This is the primary deployment target for demo and review purposes.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) 20.10 or higher
- [Docker Compose](https://docs.docker.com/compose/install/) v2 (included with Docker Desktop)

Verify your installation:

```bash
docker --version
docker compose version
```

## Running the Application

From the **project root** directory, run:

```bash
docker compose up --build
```

This will:

1. Build the **API** image from `./api` (Python / FastAPI)
2. Build the **Client** image from `./client` (Next.js)
3. Start both services and wire them together on an internal Docker network

Once the services are up:

| Service | URL                          |
| ------- | ---------------------------- |
| Client  | http://localhost:3000        |
| API     | http://localhost:8000        |
| API docs (Swagger) | http://localhost:8000/docs |

## Environment Variables

### API Service

The following environment variables can be set for the API. Pass them via a `.env` file in the project root or override them directly in `docker-compose.yml`.

| Variable          | Default                                  | Description                                      |
| ----------------- | ---------------------------------------- | ------------------------------------------------ |
| `SECRET_KEY`      | `dev-secret-key-change-in-production`    | JWT signing secret. **Must** be changed for any non-development environment. |
| `ENV`             | `development`                            | Application environment (`development`, `production`, etc.). |
| `ALLOWED_ORIGINS` | `http://localhost:3000`                  | Comma-separated list of allowed CORS origins.    |

To override these, create a `.env` file in the project root:

```bash
# .env (project root)
SECRET_KEY=your-very-long-random-secret
ENV=production
```

Generate a secure key with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Client Service

The `API_URL` build argument controls where the Next.js server proxies `/api/*` requests. It is set to `http://api:8000` by default in `docker-compose.yml` (the internal Docker service name). **Do not change this** unless you are customising the compose setup.

## Data Persistence

The SQLite database is stored inside the API container at `/app/app.db`. **Data is not persisted between container restarts** by default. This is intentional for demo use — the database starts fresh each time you run `docker compose up --build`.

If you need to seed the database with sample data while the containers are running:

```bash
docker compose exec api python utils/populate_db.py
```

## Stopping the Application

```bash
docker compose down
```

## Rebuilding After Code Changes

If you change source code and need to rebuild the images:

```bash
docker compose up --build
```

## Troubleshooting

### Port conflicts

If ports 3000 or 8000 are already in use on your machine, edit `docker-compose.yml` and change the host-side port mapping:

```yaml
ports:
  - "3001:3000"   # maps host port 3001 → container port 3000
```

### Viewing logs

```bash
# All services
docker compose logs -f

# Only the API
docker compose logs -f api

# Only the client
docker compose logs -f client
```

### Checking running containers

```bash
docker compose ps
```
