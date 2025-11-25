import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from models.database import get_db
from models.pipeline import Document
from services.document import get_document_service
from services.vectorstore import get_vectorstore
from services.model_registry import get_model_registry

router = APIRouter(prefix="/upload", tags=["upload"])


class ProcessRequest(BaseModel):
    document_id: str
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_provider: str = "huggingface"
    chunk_size: int = 500
    chunk_overlap: int = 50


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """파일 업로드"""
    doc_service = get_document_service()

    # 파일 저장
    content = await file.read()
    file_path = await doc_service.save_file(file.filename, content)

    # DB에 문서 정보 저장
    doc_id = str(uuid.uuid4())
    document = Document(
        id=doc_id,
        filename=file.filename,
        file_path=file_path,
        file_type=file.filename.split(".")[-1].lower(),
        file_size=str(len(content)),
    )
    db.add(document)
    db.commit()

    return {
        "id": doc_id,
        "filename": file.filename,
        "fileType": document.file_type,
        "fileSize": len(content),
        "message": "파일이 업로드되었습니다. /upload/process를 호출하여 임베딩을 생성하세요.",
    }


@router.post("/process")
async def process_document(
    request: ProcessRequest,
    db: Session = Depends(get_db),
):
    """문서 처리 (텍스트 추출 → 청킹 → 임베딩 → 벡터DB 저장)"""
    doc_service = get_document_service()
    vectorstore = get_vectorstore()
    registry = get_model_registry()

    # 문서 조회
    document = db.query(Document).filter(Document.id == request.document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")

    # 텍스트 추출
    text = doc_service.extract_text(document.file_path)
    if not text:
        raise HTTPException(status_code=400, detail="텍스트를 추출할 수 없습니다.")

    # 청킹
    chunks = doc_service.chunk_text(
        text,
        chunk_size=request.chunk_size,
        chunk_overlap=request.chunk_overlap,
    )

    if not chunks:
        raise HTTPException(status_code=400, detail="청크를 생성할 수 없습니다.")

    # 임베딩 생성
    embeddings = registry.embed_texts(
        provider_name=request.embedding_provider,
        model_id=request.embedding_model,
        texts=chunks,
    )

    # 벡터DB에 저장
    collection_name = f"doc_{document.id}"
    metadatas = [
        {"filename": document.filename, "chunk_index": i}
        for i in range(len(chunks))
    ]

    vectorstore.add_documents(
        collection_name=collection_name,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    # 문서 정보 업데이트
    document.collection_name = collection_name
    document.chunk_count = str(len(chunks))
    document.embedding_model = request.embedding_model
    db.commit()

    return {
        "id": document.id,
        "filename": document.filename,
        "chunkCount": len(chunks),
        "collectionName": collection_name,
        "embeddingModel": request.embedding_model,
        "message": "문서가 처리되었습니다.",
    }


@router.get("/documents")
async def list_documents(db: Session = Depends(get_db)):
    """업로드된 문서 목록"""
    documents = db.query(Document).all()
    return [doc.to_dict() for doc in documents]


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str, db: Session = Depends(get_db)):
    """문서 삭제"""
    vectorstore = get_vectorstore()

    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")

    # 벡터DB에서 컬렉션 삭제
    if document.collection_name:
        vectorstore.delete_collection(document.collection_name)

    # DB에서 삭제
    db.delete(document)
    db.commit()

    return {"message": "문서가 삭제되었습니다."}
