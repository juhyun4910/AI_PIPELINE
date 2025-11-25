from providers.llm import BaseLLMProvider, GroqProvider
from providers.embedding import BaseEmbeddingProvider, HuggingFaceEmbeddingProvider


class ModelRegistry:
    """사용 가능한 모든 모델을 관리하는 레지스트리"""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.llm_providers: dict[str, BaseLLMProvider] = {}
        self.embedding_providers: dict[str, BaseEmbeddingProvider] = {}

        # 기본 제공자 등록
        self._register_default_providers()
        self._initialized = True

    def _register_default_providers(self):
        """기본 제공자 등록"""
        # LLM 제공자
        groq = GroqProvider()
        self.llm_providers[groq.provider_name] = groq

        # 임베딩 제공자
        hf = HuggingFaceEmbeddingProvider()
        self.embedding_providers[hf.provider_name] = hf

    def register_llm_provider(self, provider: BaseLLMProvider):
        """LLM 제공자 등록"""
        self.llm_providers[provider.provider_name] = provider

    def register_embedding_provider(self, provider: BaseEmbeddingProvider):
        """임베딩 제공자 등록"""
        self.embedding_providers[provider.provider_name] = provider

    def get_all_llm_models(self) -> list[dict]:
        """UI에서 선택 가능한 모든 LLM 모델 목록"""
        models = []
        for provider in self.llm_providers.values():
            for model in provider.available_models:
                models.append(model.model_dump())
        return models

    def get_all_embedding_models(self) -> list[dict]:
        """UI에서 선택 가능한 모든 임베딩 모델 목록"""
        models = []
        for provider in self.embedding_providers.values():
            for model in provider.available_models:
                models.append(model.model_dump())
        return models

    def get_llm_provider(self, provider_name: str) -> BaseLLMProvider | None:
        """LLM 제공자 조회"""
        return self.llm_providers.get(provider_name)

    def get_embedding_provider(self, provider_name: str) -> BaseEmbeddingProvider | None:
        """임베딩 제공자 조회"""
        return self.embedding_providers.get(provider_name)

    async def generate_text(
        self,
        provider_name: str,
        model_id: str,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        """LLM으로 텍스트 생성"""
        provider = self.get_llm_provider(provider_name)
        if not provider:
            raise ValueError(f"Unknown LLM provider: {provider_name}")

        return await provider.generate(
            prompt=prompt,
            model_id=model_id,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )

    def embed_texts(
        self,
        provider_name: str,
        model_id: str,
        texts: list[str],
    ) -> list[list[float]]:
        """텍스트를 벡터로 변환"""
        provider = self.get_embedding_provider(provider_name)
        if not provider:
            raise ValueError(f"Unknown embedding provider: {provider_name}")

        return provider.embed_texts(texts, model_id)

    def embed_query(
        self,
        provider_name: str,
        model_id: str,
        text: str,
    ) -> list[float]:
        """쿼리를 벡터로 변환"""
        provider = self.get_embedding_provider(provider_name)
        if not provider:
            raise ValueError(f"Unknown embedding provider: {provider_name}")

        return provider.embed_query(text, model_id)


# 싱글톤 인스턴스
def get_model_registry() -> ModelRegistry:
    return ModelRegistry()
