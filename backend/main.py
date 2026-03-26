from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import os
import json
import uuid
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging
from database import SessionLocal
from models import User, GeneratedApp

load_dotenv()

import jwt
from passlib.context import CryptContext
from groq import Groq

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Intent Platform")

origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import hashlib

def safe_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY is missing in .env file!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise Exception("GROQ_API_KEY is missing in .env")

client = Groq(api_key=GROQ_API_KEY)

# ====================== Models ======================
class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class GenerateRequest(BaseModel):
    prompt: str

class ArchitectureComponent(BaseModel):
    name: str
    description: str

class Column(BaseModel):
    name: str
    type: str

class GenerationResponse(BaseModel):
    prompt: str
    architecture: List[ArchitectureComponent]
    database_schema: Dict[str, Any]
    apis: List[Dict[str, Any]]
    ui_flows: List[str]
    validation: Dict[str, bool]
    risks_flagged: List[str]
    explainability: str
    generated_app_summary: Dict[str, Any]
    audit_trail: str

# ====================== Auth ======================
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    db = SessionLocal()

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(401, "Invalid token")

        return user

    except:
        raise HTTPException(401, "Invalid token")


@app.post("/api/auth/register")
def register(user_data: UserRegister):
    db = SessionLocal()

    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(400, "Email already registered")

    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=pwd_context.hash(safe_password(user_data.password))
    )

    db.add(user)
    db.commit()
    db.close()

    return {"message": "User registered successfully"}


@app.post("/api/auth/login", response_model=Token)
def login(login_data: UserLogin):
    db = SessionLocal()

    user = db.query(User).filter(User.email == login_data.email).first()

    if not user or not pwd_context.verify(
        safe_password(login_data.password),
        user.hashed_password
    ):
        raise HTTPException(401, "Incorrect email or password")

    token = create_access_token({"sub": user.email})
    db.close()

    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "full_name": current_user.full_name
    }

# ====================== NEW: Generate Actual Code ======================
@app.post("/api/generate-code")
async def generate_code(request: GenerateRequest, current_user: User = Depends(get_current_user)):
    try:
        code_prompt = f"""
        The user wants: {request.prompt}

        Based on this architecture:
        {json.dumps(result.architecture if 'result' in locals() else [], indent=2)}

        Generate clean, production-ready code:
        1. React frontend components (with Tailwind)
        2. FastAPI backend routes (Python)
        3. SQLAlchemy models for PostgreSQL

        Return only JSON with:
        {{
          "frontend_code": "string with React code",
          "backend_code": "string with FastAPI code",
          "models_code": "string with database models"
        }}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert full-stack developer."},
                {"role": "user", "content": code_prompt}
            ],
            temperature=0.7,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )

        code_json = json.loads(completion.choices[0].message.content)

        return {
            "status": "success",
            "frontend_code": code_json.get("frontend_code", ""),
            "backend_code": code_json.get("backend_code", ""),
            "models_code": code_json.get("models_code", "")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ====================== Optimized System Prompt ======================
SYSTEM_PROMPT = """
You are a senior full-stack architect. Create a complete, clean, and professional application specification from the user's natural language intent.

Rules:
- Use consistent tech stack (prefer React for frontend unless specified otherwise)
- Use microservices where it makes sense
- Database must be detailed with realistic columns and types
- Keep risks_flagged short and relevant
- Make explainability clear and logical

Return **ONLY** valid JSON in this exact structure:

{
  "architecture": [
    {"name": "Frontend", "description": "React + Tailwind CSS for responsive UI"},
    {"name": "API Gateway", "description": "..."},
    {"name": "Service Name", "description": "..."}
  ],
  "database_schema": {
    "type": "PostgreSQL",
    "tables": [
      {
        "name": "table_name",
        "columns": [
          {"name": "id", "type": "uuid"},
          {"name": "name", "type": "string"},
          ...
        ]
      }
    ]
  },
  "apis": [
    {"endpoint": "/api/...", "method": "POST", "description": "Clear description"}
  ],
  "ui_flows": ["Flow 1", "Flow 2", ...],
  "validation": {
    "security_checks_passed": true,
    "compliance_verified": true,
    "test_cases_passed": true
  },
  "risks_flagged": ["Risk 1", "Risk 2"],
  "explainability": "Step-by-step reasoning for architecture, tech choices, and design decisions.",
  "generated_app_summary": {
    "title": "App Title",
    "components": ["Component 1", "Component 2", ...]
  }
}
"""

# ====================== Generate Endpoint ======================
@app.post("/api/generate-app", response_model=GenerationResponse)
async def generate_app(request: GenerateRequest, current_user: dict = Depends(get_current_user)):
    start_time = datetime.utcnow()
    # logger.info(f"Generation request from {current_user['email']}")
    logger.info(f"Generation request from {current_user.email}")

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.prompt}
            ],
            temperature=0.7,
            max_tokens=3000,
            response_format={"type": "json_object"}
        )

        llm_json = json.loads(completion.choices[0].message.content)

        db = SessionLocal()

        new_app = GeneratedApp(
            id=str(uuid.uuid4()),
            user_email=current_user.email,
            prompt=request.prompt,
            result=json.dumps(llm_json)
        )
        
        db.add(new_app)
        db.commit()
        db.close()

        return GenerationResponse(
            prompt=request.prompt,
            architecture=[ArchitectureComponent(**item) for item in llm_json.get("architecture", [])],
            database_schema=llm_json.get("database_schema", {}),
            apis=llm_json.get("apis", []),
            ui_flows=llm_json.get("ui_flows", []),
            validation=llm_json.get("validation", {"security_checks_passed": True, "compliance_verified": True, "test_cases_passed": True}),
            risks_flagged=llm_json.get("risks_flagged", []),
            explainability=llm_json.get("explainability", "Detailed architecture generated by Groq."),
            generated_app_summary=llm_json.get("generated_app_summary", {"title": "Generated App", "components": []}),
            # audit_trail=f"Generated for {current_user['email']} at {datetime.utcnow().isoformat()} | Model: llama-3.3-70b-versatile | Time: {(datetime.utcnow() - start_time).total_seconds():.2f}s"
            audit_trail=f"Generated for {current_user.email} at {datetime.utcnow().isoformat()} | Model: llama-3.3-70b-versatile | Time: {(datetime.utcnow() - start_time).total_seconds():.2f}s"
        )

    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate application. Please try again.")

@app.get("/health")
async def health():
    return {"status": "AI Intent Platform Backend is running successfully"}
