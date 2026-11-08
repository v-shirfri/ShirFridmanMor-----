
# ShirFridmanMor - Final Full Stack Project

## Project Description
A full-stack AI chatbot application that allows users to have conversations with an AI assistant.

## Technologies
- **Frontend:** React, Vite
- **Backend:** Python (FastAPI)
- **Database:** MySQL
- **AI:** OpenAI API

## Project Structure
```
├── Backend/      # Python server and API
├── Frontend/     # React application
└── Database/     # SQL database files
```

---

## Configuration

### Backend (`Backend/.env`)
Copy `Backend/.env.example` to `Backend/.env` and fill in your values:
```bash
# macOS/Linux
cp Backend/.env.example Backend/.env

# Windows
copy Backend\.env.example Backend\.env
```

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | Model to use (e.g. `gpt-4o` or `gpt-4o-mini`) |
| `DB_HOST` | MySQL host (default: `localhost`) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database name (default: `chatproj_db`) |
| `ALLOW_ORIGINS` | Comma-separated frontend URLs allowed by CORS (e.g. `http://localhost:5173`) |
| `PORT` | Port the backend listens on (default: `8001`) |

### Frontend (`Frontend/.env`)
Copy `Frontend/.env.example` to `Frontend/.env` and fill in your values:
```bash
# macOS/Linux
cp Frontend/.env.example Frontend/.env

# Windows
copy Frontend\.env.example Frontend\.env
```

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Full URL of the running backend (e.g. `http://localhost:8001`) |

> **Note:** Vite only exposes variables prefixed with `VITE_` to the browser bundle.

---

## Setup & Run

### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL server

### 1 – Database
1. Create a MySQL database (e.g. `chatproj_db`).
2. Import the schema from `Database/database.sql` (this is the authoritative schema — `chatproj_db.sql` is an older backup and can be ignored):
   ```bash
   mysql -u <user> -p < Database/database.sql
   ```
   The script creates the `chatproj_db` database and all required tables automatically.

### 2 – Backend
```bash
cd Backend

# Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (Windows: use "copy" instead of "cp")
cp .env.example .env
# Edit .env with your values

# Start the server (default port 8001)
python main.py
```

The API will be available at `http://localhost:8001`.

### 3 – Frontend
```bash
cd Frontend

# Install dependencies
npm install

# Configure environment (Windows: use "copy" instead of "cp")
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL to the backend URL

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Docker Compose (recommended for deployment)

Docker Compose starts the database, backend, and frontend together with a single command.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### 1 – Prepare environment file

Docker Compose reads all variables from a single `.env` file at the project root.  
Copy the example and fill in your values:

```bash
# macOS/Linux
cp .env.example .env

# Windows
copy .env.example .env
```

Open `.env` and set at minimum:
- `OPENAI_API_KEY`
- `DB_USER`
- `DB_PASSWORD`

> **Note:** `DB_HOST` is set automatically to the MySQL container — do not add it to this file.

### 2 – (Optional) Override the frontend backend URL

By default the frontend is built pointing to `http://localhost:8001`.  
If you are deploying to a remote host, set `VITE_API_BASE_URL` before building:

```bash
# macOS/Linux
export VITE_API_BASE_URL=https://your-domain.com:8001

# Windows PowerShell
$env:VITE_API_BASE_URL="https://your-domain.com:8001"
```

### 3 – Build and start

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:8001 |
| MySQL | localhost:3306 |

### 4 – Stop

```bash
docker compose down
```

To also remove the database volume (⚠️ deletes all data):

```bash
docker compose down -v
```
Shir Fridman Mor
