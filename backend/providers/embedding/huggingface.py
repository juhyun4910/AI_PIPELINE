from sentence_transformers import SentenceTransformer
from .base import BaseEmbeddingProvider, EmbeddingModel


class HuggingFaceEmbeddingProvider(BaseEmbeddingProvider):
    """HuggingFace sentence-transformers 기반 임베딩 제공자"""

    def __init__(self):
        self._models: dict[str, SentenceTransformer] = {}

    @property
    def provider_name(self) -> str:
        return "huggingface"

    @property
    def available_models(self) -> list[EmbeddingModel]:
        return [
            EmbeddingModel(
                id="all-MiniLM-L6-v2",
                name="MiniLM (경량/빠름)",
                provider=self.provider_name,
                description="경량 모델, CPU에서 빠른 속도",
                dimension=384,
                korean_support=False,  # 영어 최적화
                max_tokens=256,
            ),
            EmbeddingModel(
                id="jhgan/ko-sroberta-nli",
                name="한국어 SBERT",
                provider=self.provider_name,
                description="한국어에 최적화된 SBERT 모델",
                dimension=768,
                korean_support=True,
                max_tokens=512,
            ),
            EmbeddingModel(
                id="intfloat/multilingual-e5-small",
                name="다국어 E5 (Small)",
                provider=self.provider_name,
                description="다국어 지원, 균형잡힌 성능",
                dimension=384,
                korean_support=True,
                max_tokens=512,
            ),
            EmbeddingModel(
                id="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                name="다국어 MiniLM",
                provider=self.provider_name,
                description="50+ 언어 지원, 경량",
                dimension=384,
                korean_support=True,
                max_tokens=128,
            ),
        ]

    def _get_model(self, model_id: str) -> SentenceTransformer:
        """모델 로드 (캐싱)"""
        if model_id not in self._models:
            self._models[model_id] = SentenceTransformer(model_id)
        return self._models[model_id]

    def embed_texts(self, texts: list[str], model_id: str) -> list[list[float]]:
        """텍스트 리스트를 벡터로 변환"""
        model = self._get_model(model_id)
        embeddings = model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()

    def embed_query(self, text: str, model_id: str) -> list[float]:
        """단일 쿼리를 벡터로 변환"""
        model = self._get_model(model_id)
        embedding = model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
