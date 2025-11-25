from fastapi import APIRouter
from services.model_registry import get_model_registry

router = APIRouter(prefix="/models", tags=["models"])


@router.get("")
async def get_available_models():
    """사용 가능한 모든 모델 목록 반환 (프론트엔드 블록 팔레트용)"""
    registry = get_model_registry()

    return {
        "llm": registry.get_all_llm_models(),
        "embedding": registry.get_all_embedding_models(),
    }


@router.get("/llm")
async def get_llm_models():
    """LLM 모델 목록"""
    registry = get_model_registry()
    return registry.get_all_llm_models()


@router.get("/embedding")
async def get_embedding_models():
    """임베딩 모델 목록"""
    registry = get_model_registry()
    return registry.get_all_embedding_models()
