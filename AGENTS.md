# EduBloom Agent Instructions

## Project Structure
- **Backend** (`/backend`): Node.js with raw `http` module (no Express)
- **Frontend** (`/frontend`): Vanilla HTML/CSS/JS served statically by backend
- **Database**: PostgreSQL (credentials in `backend/.env`)

## Running the App
```bash
cd backend
npm run dev    # Uses nodemon for auto-reload
npm start      # Plain node
npm run init-db  # Initialize PostgreSQL database (one-time)
```

- Server runs at `http://localhost:3000`
- Frontend entry: `index.html` redirects based on role (student/teacher/parent)
- API routes: `/api/*` (auth, student, teacher, parent, admin)

## Architecture Notes
- Backend uses raw Node.js `http` module, not Express
- Routes: `backend/routes/` → `backend/controllers/`
- Frontend role-based: `frontend/dashboards/{student,teacher,parent}/dashboard.html`
- Auth tokens stored in `localStorage`

## Environment
- Database config in `backend/.env` (DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT)
- Default: PostgreSQL on localhost:5432, user `postgres`, password `123`, DB `edubloom`
- `.env` is gitignored

## Testing
- No test suite configured (`npm test` is a placeholder)