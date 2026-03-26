# 🧠 AI Native Development - Backend (FastAPI)

Backend service responsible for authentication, AI processing, and database storage.

---

## ⚙️ Tech Stack

* FastAPI
* SQLAlchemy ORM
* PostgreSQL (Supabase)
* JWT Authentication
* Groq API

---

## 🚀 Setup

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 🔐 Environment Variables

Create `.env`:

```
DATABASE_URL=postgresql://...
SECRET_KEY=your_secret
GROQ_API_KEY=your_key
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://your-frontend-domain.com
```

---

## ▶️ Run Server

```
uvicorn main:app --reload
```

---

## 📡 API Endpoints

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`

### AI

* `POST /api/generate-app`
* `POST /api/generate-code`

### Health

* `GET /health`

---

## 🗄️ Database Models

### User

* email (PK)
* full_name
* hashed_password

### GeneratedApp

* id
* user_email (FK)
* prompt
* result
* created_at

---

## ⚠️ Notes

* Uses Supabase PostgreSQL
* Requires SSL connection
* JWT token required for protected routes

---

## 🧪 Testing

Use:

```
http://127.0.0.1:8000/health
```

---

## 🚀 Future Enhancements

* Alembic migrations
* Rate limiting
* Background jobs (Celery)
* Streaming responses
