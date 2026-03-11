from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import health

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Devlytics API",
    description="Developer activity analytics platform",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])


@app.get("/")
def root():
    return {"message": "Devlytics API is running"}
