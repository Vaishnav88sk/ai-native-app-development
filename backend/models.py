from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# ================= USERS =================
class User(Base):
    __tablename__ = "users"

    email = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Relationship
    apps = relationship("GeneratedApp", back_populates="user")


# ================= GENERATED APPS =================
class GeneratedApp(Base):
    __tablename__ = "generated_apps"

    id = Column(String, primary_key=True)
    user_email = Column(String, ForeignKey("users.email"))
    prompt = Column(Text)
    result = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="apps")