from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from .database import Base


class Pipeline(Base):
    """파이프라인 모델"""
    __tablename__ = "pipelines"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    blocks = Column(JSON, default=list)  # 블록 구성
    edges = Column(JSON, default=list)   # 연결선
    author = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "blocks": self.blocks,
            "edges": self.edges,
            "author": self.author,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }


class Document(Base):
    """업로드된 문서 모델"""
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), default="")
    file_size = Column(String(50), default="")
    collection_name = Column(String(255), default="")  # 벡터DB 컬렉션
    chunk_count = Column(String(50), default="0")
    embedding_model = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "filePath": self.file_path,
            "fileType": self.file_type,
            "fileSize": self.file_size,
            "collectionName": self.collection_name,
            "chunkCount": self.chunk_count,
            "embeddingModel": self.embedding_model,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
