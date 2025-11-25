import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from models.database import get_db
from models.pipeline import Pipeline

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


class PipelineCreate(BaseModel):
    name: str
    description: str = ""
    blocks: list = []
    edges: list = []
    author: str = ""


class PipelineUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    blocks: list | None = None
    edges: list | None = None


@router.get("")
async def list_pipelines(db: Session = Depends(get_db)):
    """모든 파이프라인 목록"""
    pipelines = db.query(Pipeline).order_by(Pipeline.created_at.desc()).all()
    return [p.to_dict() for p in pipelines]


@router.get("/{pipeline_id}")
async def get_pipeline(pipeline_id: str, db: Session = Depends(get_db)):
    """특정 파이프라인 조회"""
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="파이프라인을 찾을 수 없습니다.")
    return pipeline.to_dict()


@router.post("")
async def create_pipeline(data: PipelineCreate, db: Session = Depends(get_db)):
    """파이프라인 생성"""
    pipeline = Pipeline(
        id=str(uuid.uuid4()),
        name=data.name,
        description=data.description,
        blocks=data.blocks,
        edges=data.edges,
        author=data.author,
    )
    db.add(pipeline)
    db.commit()
    db.refresh(pipeline)

    return pipeline.to_dict()


@router.put("/{pipeline_id}")
async def update_pipeline(
    pipeline_id: str,
    data: PipelineUpdate,
    db: Session = Depends(get_db),
):
    """파이프라인 수정"""
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="파이프라인을 찾을 수 없습니다.")

    if data.name is not None:
        pipeline.name = data.name
    if data.description is not None:
        pipeline.description = data.description
    if data.blocks is not None:
        pipeline.blocks = data.blocks
    if data.edges is not None:
        pipeline.edges = data.edges

    pipeline.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(pipeline)

    return pipeline.to_dict()


@router.delete("/{pipeline_id}")
async def delete_pipeline(pipeline_id: str, db: Session = Depends(get_db)):
    """파이프라인 삭제"""
    pipeline = db.query(Pipeline).filter(Pipeline.id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail="파이프라인을 찾을 수 없습니다.")

    db.delete(pipeline)
    db.commit()

    return {"message": "파이프라인이 삭제되었습니다."}
