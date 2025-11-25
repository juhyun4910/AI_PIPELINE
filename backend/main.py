import sys
from pathlib import Path

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_settings
from models.database import init_db
from api import models, upload, query, pipeline, run


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행"""
    # 시작 시
    init_db()
    print("[OK] Database initialized")
    print("[OK] Server started")

    yield

    # 종료 시
    print("[BYE] Server shutting down")


settings = get_settings()

app = FastAPI(
    title="AI Pipeline API",
    description="AI 파이프라인 빌더 백엔드 API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(models.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(pipeline.router, prefix="/api")
app.include_router(run.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "AI Pipeline API",
        "docs": "/docs",
        "version": "0.1.0",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
