from abc import ABC, abstractmethod
from pydantic import BaseModel


class EmbeddingModel(BaseModel):
    """임베딩 모델 정보"""
    id: str
    name: str
    provider: str
    description: str = ""
    dimension: int
    korean_support: bool = True
    max_tokens: int = 512


class BaseEmbeddingProvider(ABC):
    """모든 임베딩 제공자의 베이스 클래스"""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """제공자 이름"""
        pass

    @property
    @abstractmethod
    def available_models(self) -> list[EmbeddingModel]:
        """사용 가능한 모델 목록"""
        pass

    @abstractmethod
    def embed_texts(self, texts: list[str], model_id: str) -> list[list[float]]:
        """텍스트 리스트를 벡터로 변환"""
        pass

    @abstractmethod
    def embed_query(self, text: str, model_id: str) -> list[float]:
        """단일 쿼리를 벡터로 변환"""
        pass

    def get_model(self, model_id: str) -> EmbeddingModel | None:
        """모델 ID로 모델 정보 조회"""
        for model in self.available_models:
            if model.id == model_id:
                return model
        return None

    def is_model_available(self, model_id: str) -> bool:
        """모델 사용 가능 여부 확인"""
        return self.get_model(model_id) is not None

    def get_dimension(self, model_id: str) -> int:
        """모델의 벡터 차원 반환"""
        model = self.get_model(model_id)
        return model.dimension if model else 384
