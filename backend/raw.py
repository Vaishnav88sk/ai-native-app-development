# from database import engine
# from models import Base

# Base.metadata.create_all(bind=engine)

from database import Base, engine
from models import User, GeneratedApp

Base.metadata.create_all(bind=engine)

print("✅ Tables created successfully")