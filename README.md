# UTILISE

Monorepo for **utilISE** — engineering book management tools for MSRIT.

This repository contains **two separate projects**:

| Project | Stack | Location | Status |
|---------|-------|----------|--------|
| **RAMS** (Ramaiah Automated Management System) | Next.js 15, PostgreSQL, Prisma | [`rams-platform/`](rams-platform/) | Active — full-stack web app |
| **utilISE Desktop** | Java Swing, MySQL | Root `.java` files + `src/` | Legacy desktop app |

> **Start here for the web app:** [`rams-platform/README.md`](rams-platform/README.md)

---

## RAMS Web Platform (recommended)

Full-stack campus library portal with semester-wise catalog, role-based dashboards, automated fines, reservations, and AI Smart Notes.

```bash
cd rams-platform
docker compose up -d
pnpm install
cp .env.example .env
cp .env.example apps/web/.env.local   # add GEMINI_API_KEY for Smart Notes
cp .env.example packages/database/.env
pnpm db:push && pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — demo login: `admin@msrit.edu` / `password123`

**Where to find key features:**

| Feature | How to access |
|---------|---------------|
| Fine calculator | Admin → Analytics → **Run Fine Calculation** (bottom of page) |
| Fine rules config | Admin → **Settings** |
| Overdue tracking | Librarian dashboard, or log in as `student@msrit.edu` |
| Smart Notes (AI) | Student/Faculty → **Smart Notes** (needs `GEMINI_API_KEY`) |
| Issue / Return | Librarian → **Issue / Return** |

See [`rams-platform/README.md`](rams-platform/README.md) for the full feature list (including what's implemented vs. planned).

---

## utilISE Desktop (Java Swing)

Legacy desktop app for browsing semester-wise PDF textbooks locally.

### Prerequisites
- JDK 8+
- MySQL (optional — for book management features)

### Run

```bash
javac -d out src/pack/*.java *.java
java -cp out pack.HomePage
```

### Configuration (MySQL features)

```bash
export UTILISE_DB_HOST=localhost
export UTILISE_DB_PORT=3306
export UTILISE_DB_NAME=utilise
export UTILISE_DB_USER=root
export UTILISE_DB_PASSWORD=your-password-here
```

### Desktop features
- Semester-wise PDF browser (Third & Fourth semester textbooks)
- MySQL-backed book CRUD (`ImprovedBookManager`)
- Automated fine calculation (`FineCalculator` + `LibraryAutomationService`)
- Admin analytics dashboard with charts
- Role-based login

Screenshots and detailed docs for the desktop app are in the sections below.

---

## Repository layout

```
UTILISE/
├── rams-platform/          # Next.js web app (RAMS) — see rams-platform/README.md
├── .github/workflows/      # CI/CD for rams-platform
├── src/                    # Java desktop app source
├── HomePage.java           # Java desktop entry point
├── FineCalculator.java     # Desktop fine logic
└── README.md               # This file
```

---

## utilISE Desktop — detailed docs

### Project Structure

```
utilISE/
├── src/pack/
│   ├── HomePage.java           # Main application window
│   └── SemesterWindow.java     # Semester-specific interface
├── books/                      # PDF storage directory
├── AdminAnalyticsDashboard.java
├── ImprovedBookManager.java
├── LibraryAutomationService.java
└── FineCalculator.java
```

### Currently Supported Semesters

#### Third Semester
| Code | Subject |
|------|---------|
| C | C Programming |
| DCO | Digital Circuit Organization |
| DMS | Discrete Mathematics |
| OS | Operating Systems |

#### Fourth Semester
| Code | Subject |
|------|---------|
| Java | Java Programming |
| DBMS | Database Management Systems |
| DA | Data Analytics |
| Micro | Microprocessors |

### Screenshots

Main interface:

<img width="1470" alt="Main interface" src="https://github.com/user-attachments/assets/5d1f333e-a8a7-4194-9dde-bdc6a19d68ed" />

Semester view:

<img width="1470" alt="Semester view" src="https://github.com/user-attachments/assets/fac7c292-ee09-4cd6-b6c6-ef0716cab3e4" />

---

## Author

**Mahi Lohiya** — mahilohiya12@gmail.com — [GitHub](https://github.com/mahilohiya)

## License

MIT
