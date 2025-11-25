from abc import ABC, abstractmethod
from typing import AsyncIterator
from pydantic import BaseModel


class LLMModel(BaseModel):
    """LLM 모델 정보"""
    id: str
    name: str
    provider: str
    description: str = ""
    context_length: int = 4096
    korean_support: bool = True


class BaseLLMProvider(ABC):
    """모든 LLM 제공자의 베이스 클래스"""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """제공자 이름 (groq, ollama, openai 등)"""
        pass

    @property
    @abstractmethod
    def available_models(self) -> list[LLMModel]:
        """사용 가능한 모델 목록"""
        pass

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        model_id: str,
        system_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        """텍스트 생성"""
        pass

    @abstractmethod
    async def generate_stream(
        self,
        prompt: str,
        model_id: str,
        system_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> AsyncIterator[str]:
        """스트리밍 텍스트 생성"""
        pass

    def get_model(self, model_id: str) -> LLMModel | None:
        """모델 ID로 모델 정보 조회"""
        for model in self.available_models:
            if model.id == model_id:
                return model
        return None

    def is_model_available(self, model_id: str) -> bool:
        """모델 사용 가능 여부 확인"""
        return self.get_model(model_id) is not None
