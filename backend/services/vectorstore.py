import chromadb
from chromadb.config import Settings as ChromaSettings
from config import get_settings


class VectorStoreService:
    """Chroma 벡터 저장소 서비스"""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        settings = get_settings()
        self.client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self._initialized = True

    def get_or_create_collection(
        self,
        name: str,
        embedding_dimension: int = 384,
    ):
        """컬렉션 조회 또는 생성"""
        return self.client.get_or_create_collection(
            name=name,
            metadata={"dimension": embedding_dimension},
        )

    def add_documents(
        self,
        collection_name: str,
        documents: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict] | None = None,
        ids: list[str] | None = None,
    ):
        """문서 추가"""
        collection = self.get_or_create_collection(collection_name)

        if ids is None:
            import uuid
            ids = [str(uuid.uuid4()) for _ in documents]

        if metadatas is None:
            metadatas = [{} for _ in documents]

        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids,
        )

        return ids

    def search(
        self,
        collection_name: str,
        query_embedding: list[float],
        n_results: int = 5,
        where: dict | None = None,
    ) -> dict:
        """벡터 유사도 검색"""
        collection = self.get_or_create_collection(collection_name)

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        return {
            "documents": results["documents"][0] if results["documents"] else [],
            "metadatas": results["metadatas"][0] if results["metadatas"] else [],
            "distances": results["distances"][0] if results["distances"] else [],
            "ids": results["ids"][0] if results["ids"] else [],
        }

    def delete_collection(self, name: str):
        """컬렉션 삭제"""
        try:
            self.client.delete_collection(name)
        except ValueError:
            pass  # 컬렉션이 없으면 무시

    def list_collections(self) -> list[str]:
        """모든 컬렉션 목록"""
        return [col.name for col in self.client.list_collections()]


def get_vectorstore() -> VectorStoreService:
    return VectorStoreService()
