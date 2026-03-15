from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import health, auth, sync, analytics, repos, ai_insights, productivity

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
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(sync.router, prefix="/api/sync", tags=["Sync"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(repos.router, prefix="/api/repos", tags=["Repos"])
app.include_router(ai_insights.router, prefix="/api/ai", tags=["AI"])
app.include_router(productivity.router, prefix="/api/productivity", tags=["Productivity"])


@app.get("/")
def root():
    return {"message": "Devlytics API is running"}
