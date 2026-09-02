import time
import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth,
    companies,
    technologies,
    rankings,
    forecasts,
    compare,
    dashboard,
    news,
    data_sources,
    admin,
    ml,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("TechVista")

# Create database tables automatically if not present
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TechVista API",
    description="AI-Powered Company and Technology Leadership Analytics & Forecasting Platform API",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
def on_startup():
    """Verify database connectivity and auto-seed if empty on initial cloud deployment."""
    try:
        from app.models.entities import Company
        from app.database import SessionLocal
        db = SessionLocal()
        count = db.query(Company).count()
        db.close()
        if count == 0:
            logger.info("Empty database detected on startup. Auto-seeding initial benchmark dataset...")
            from scripts.seed_data import seed_database
            seed_database()
            logger.info("Auto-seeding completed successfully.")
    except Exception as e:
        logger.warning(f"Startup auto-seed check notice: {e}")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000.0

    # Don't log sensitive endpoints with credentials in detail
    path = request.url.path
    if not path.startswith("/api/auth"):
        logger.info(f"{request.method} {path} - {response.status_code} ({process_time:.1f}ms)")

    response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
    return response

# Production Safe Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    if settings.DEBUG:
        detail_msg = str(exc)
    else:
        detail_msg = "An internal server error occurred. Please try again later."
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": detail_msg, "timestamp": datetime.utcnow().isoformat()}
    )

# Include API Routers under /api
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)
app.include_router(companies.router, prefix=settings.API_PREFIX)
app.include_router(technologies.router, prefix=settings.API_PREFIX)
app.include_router(rankings.router, prefix=settings.API_PREFIX)
app.include_router(forecasts.router, prefix=settings.API_PREFIX)
app.include_router(compare.router, prefix=settings.API_PREFIX)
app.include_router(news.router, prefix=settings.API_PREFIX)
app.include_router(data_sources.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
app.include_router(ml.router, prefix=settings.API_PREFIX)

@app.get("/", tags=["Health"])
def root_endpoint():
    return {
        "platform": "TechVista AI Analytics Engine",
        "tagline": "See the Technology Leaders of Tomorrow.",
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs": "/docs",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for Render wake-up and monitoring."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected",
        "uptime": "active",
        "timestamp": datetime.utcnow().isoformat()
    }
