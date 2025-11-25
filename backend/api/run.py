from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from models.database import get_db
from models.pipeline import Pipeline
from services.pipeline_engine import get_pipeline_engine

router = APIRouter(prefix="/run", tags=["run"])


class RunRequest(BaseModel):
    pipeline_id: str | None = None
    blocks: list | None = None  # 파이프라인 ID 대신 직접 블록 전달 가능
    edges: list | None = None
    input: dict = {}  # question, documents 등


class RunResponse(BaseModel):
    success: bool
    steps: list
    final_output: dict | None
    error: str | None = None


@router.post("", response_model=RunResponse)
async def run_pipeline(
    request: RunRequest,
    db: Session = Depends(get_db),
):
    """파이프라인 실행"""
    engine = get_pipeline_engine()

    # 파이프라인 ID가 있으면 DB에서 조회
    if request.pipeline_id:
        pipeline = db.query(Pipeline).filter(Pipeline.id == request.pipeline_id).first()
        if not pipeline:
            raise HTTPException(status_code=404, detail="파이프라인을 찾을 수 없습니다.")
        blocks = pipeline.blocks
        edges = pipeline.edges
    elif request.blocks:
        blocks = request.blocks
        edges = request.edges or []
    else:
        raise HTTPException(
            status_code=400,
            detail="pipeline_id 또는 blocks를 제공해야 합니다.",
        )

    # 파이프라인 실행
    result = await engine.execute(
        blocks=blocks,
        edges=edges,
        input_data=request.input,
    )

    return RunResponse(
        success=result["success"],
        steps=result["steps"],
        final_output=result["final_output"],
        error=result.get("error"),
    )


@router.post("/test")
async def test_single_block(
    block: dict,
    input_data: dict = {},
):
    """단일 블록 테스트"""
    engine = get_pipeline_engine()

    result = await engine.execute(
        blocks=[block],
        edges=[],
        input_data=input_data,
    )

    return result
