from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.model_registry import get_model_registry
from services.vectorstore import get_vectorstore

router = APIRouter(prefix="/query", tags=["query"])


class QueryRequest(BaseModel):
    question: str
    collection_name: str
    llm_provider: str = "groq"
    llm_model: str = "llama-3.1-8b-instant"
    embedding_provider: str = "huggingface"
    embedding_model: str = "all-MiniLM-L6-v2"
    top_k: int = 5
    temperature: float = 0.7
    max_tokens: int = 1024
    system_prompt: str = ""


class QueryResponse(BaseModel):
    answer: str
    sources: list[dict]
    model_used: str


@router.post("", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """문서에 대해 질문하고 LLM 응답 받기 (RAG)"""
    registry = get_model_registry()
    vectorstore = get_vectorstore()

    # 1. 질문을 벡터로 변환
    query_embedding = registry.embed_query(
        provider_name=request.embedding_provider,
        model_id=request.embedding_model,
        text=request.question,
    )

    # 2. 벡터DB에서 유사 문서 검색
    search_results = vectorstore.search(
        collection_name=request.collection_name,
        query_embedding=query_embedding,
        n_results=request.top_k,
    )

    if not search_results["documents"]:
        raise HTTPException(
            status_code=404,
            detail="관련 문서를 찾을 수 없습니다.",
        )

    # 3. 컨텍스트 구성
    context = "\n\n".join([
        f"[문서 {i+1}]\n{doc}"
        for i, doc in enumerate(search_results["documents"])
    ])

    # 4. 시스템 프롬프트 구성
    default_system_prompt = """당신은 주어진 문서를 기반으로 질문에 답변하는 AI 어시스턴트입니다.
다음 규칙을 따르세요:
1. 반드시 제공된 문서 내용만을 기반으로 답변하세요.
2. 문서에 없는 내용은 "제공된 문서에서 해당 정보를 찾을 수 없습니다."라고 답변하세요.
3. 답변은 한국어로 작성하세요.
4. 가능하면 출처(문서 번호)를 명시하세요."""

    system_prompt = request.system_prompt or default_system_prompt

    # 5. LLM에 질문
    prompt = f"""다음은 참고 문서입니다:

{context}

---

질문: {request.question}

위 문서를 참고하여 질문에 답변해주세요."""

    answer = await registry.generate_text(
        provider_name=request.llm_provider,
        model_id=request.llm_model,
        prompt=prompt,
        system_prompt=system_prompt,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
    )

    # 6. 결과 반환
    sources = [
        {
            "content": doc[:200] + "..." if len(doc) > 200 else doc,
            "metadata": meta,
            "distance": dist,
        }
        for doc, meta, dist in zip(
            search_results["documents"],
            search_results["metadatas"],
            search_results["distances"],
        )
    ]

    return QueryResponse(
        answer=answer,
        sources=sources,
        model_used=f"{request.llm_provider}/{request.llm_model}",
    )


@router.post("/chat")
async def chat(
    question: str,
    llm_provider: str = "groq",
    llm_model: str = "llama-3.1-8b-instant",
    system_prompt: str = "",
    temperature: float = 0.7,
    max_tokens: int = 1024,
):
    """단순 채팅 (문서 검색 없이 LLM만 사용)"""
    registry = get_model_registry()

    answer = await registry.generate_text(
        provider_name=llm_provider,
        model_id=llm_model,
        prompt=question,
        system_prompt=system_prompt or "당신은 도움이 되는 AI 어시스턴트입니다. 한국어로 답변하세요.",
        temperature=temperature,
        max_tokens=max_tokens,
    )

    return {
        "answer": answer,
        "model_used": f"{llm_provider}/{llm_model}",
    }
