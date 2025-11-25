"""
파이프라인 실행 엔진
블록들을 순서대로 실행하고 결과를 다음 블록으로 전달
"""
from typing import Any
from services.model_registry import get_model_registry
from services.vectorstore import get_vectorstore
from services.document import get_document_service


class PipelineEngine:
    """파이프라인 실행 엔진"""

    def __init__(self):
        self.registry = get_model_registry()
        self.vectorstore = get_vectorstore()
        self.doc_service = get_document_service()

    async def execute(
        self,
        blocks: list[dict],
        edges: list[dict],
        input_data: dict,
    ) -> dict:
        """
        파이프라인 실행

        Args:
            blocks: 블록 목록
            edges: 연결 정보
            input_data: 초기 입력 데이터 (question, files 등)

        Returns:
            실행 결과
        """
        # 블록을 실행 순서대로 정렬
        execution_order = self._topological_sort(blocks, edges)

        # 각 블록의 출력을 저장
        block_outputs: dict[str, Any] = {}

        # 초기 입력 설정
        context = {
            "input": input_data,
            "documents": [],
            "chunks": [],
            "embeddings": [],
            "search_results": [],
            "llm_response": "",
        }

        results = {
            "steps": [],
            "final_output": None,
            "success": True,
            "error": None,
        }

        try:
            for block_id in execution_order:
                block = self._find_block(blocks, block_id)
                if not block:
                    continue

                # 이전 블록의 출력을 현재 블록의 입력으로 사용
                inputs = self._get_block_inputs(block_id, edges, block_outputs)

                # 블록 실행
                output = await self._execute_block(block, context, inputs)
                block_outputs[block_id] = output

                results["steps"].append({
                    "blockId": block_id,
                    "blockType": block.get("type"),
                    "blockName": block.get("name"),
                    "status": "completed",
                    "output": self._summarize_output(output),
                })

            # 마지막 블록의 출력을 최종 결과로
            if execution_order:
                last_block_id = execution_order[-1]
                results["final_output"] = block_outputs.get(last_block_id)

        except Exception as e:
            results["success"] = False
            results["error"] = str(e)

        return results

    async def _execute_block(
        self,
        block: dict,
        context: dict,
        inputs: dict,
    ) -> Any:
        """개별 블록 실행"""
        block_type = block.get("type", "")
        config = block.get("config", {})

        if block_type == "upload":
            # 파일 업로드 블록 - 이미 업로드된 파일 정보 사용
            return context["input"].get("documents", [])

        elif block_type == "preprocess":
            # 전처리 블록 - 텍스트 청킹
            texts = inputs.get("texts", [])
            if not texts and context.get("documents"):
                # 문서에서 텍스트 추출
                for doc in context["documents"]:
                    text = self.doc_service.extract_text(doc.get("file_path", ""))
                    texts.append(text)

            chunks = []
            chunk_size = config.get("chunk_size", 500)
            chunk_overlap = config.get("chunk_overlap", 50)

            for text in texts:
                chunks.extend(
                    self.doc_service.chunk_text(text, chunk_size, chunk_overlap)
                )

            context["chunks"] = chunks
            return {"chunks": chunks, "count": len(chunks)}

        elif block_type == "embedding":
            # 임베딩 블록
            chunks = context.get("chunks", [])
            if not chunks:
                return {"embeddings": [], "error": "No chunks to embed"}

            # 블록 최상위 레벨 또는 config에서 provider/model 읽기
            provider = block.get("provider") or config.get("provider", "huggingface")
            model = block.get("modelId") or config.get("model", "all-MiniLM-L6-v2")

            embeddings = self.registry.embed_texts(
                provider_name=provider,
                model_id=model,
                texts=chunks,
            )

            context["embeddings"] = embeddings
            return {"embeddings_count": len(embeddings), "dimension": len(embeddings[0]) if embeddings else 0}

        elif block_type == "vectorstore":
            # 벡터 저장소 블록
            chunks = context.get("chunks", [])
            embeddings = context.get("embeddings", [])
            collection_name = config.get("collection_name", "default")

            if chunks and embeddings:
                ids = self.vectorstore.add_documents(
                    collection_name=collection_name,
                    documents=chunks,
                    embeddings=embeddings,
                )
                return {"stored_count": len(ids), "collection": collection_name}

            return {"stored_count": 0}

        elif block_type == "search":
            # 벡터 검색 블록
            question = context["input"].get("question", "")
            collection_name = config.get("collection_name", "default")
            top_k = config.get("top_k", 5)
            embedding_provider = config.get("embedding_provider", "huggingface")
            embedding_model = config.get("embedding_model", "all-MiniLM-L6-v2")

            # 질문 임베딩
            query_embedding = self.registry.embed_query(
                provider_name=embedding_provider,
                model_id=embedding_model,
                text=question,
            )

            # 검색
            results = self.vectorstore.search(
                collection_name=collection_name,
                query_embedding=query_embedding,
                n_results=top_k,
            )

            context["search_results"] = results
            return results

        elif block_type == "llm":
            # LLM 블록
            question = context["input"].get("question", "")
            # 디버깅: 블록 전체 내용 출력
            print(f"[DEBUG] LLM Block received: {block}")
            print(f"[DEBUG] block.get('provider'): {block.get('provider')}")
            print(f"[DEBUG] block.get('modelId'): {block.get('modelId')}")
            # 블록 최상위 레벨 또는 config에서 provider/model 읽기
            provider = block.get("provider") or config.get("provider", "groq")
            model = block.get("modelId") or config.get("model", "llama-3.1-8b-instant")
            print(f"[DEBUG] Final provider: {provider}, model: {model}")
            temperature = config.get("temperature", 0.7)
            max_tokens = config.get("max_tokens", 1024)
            system_prompt = config.get("system_prompt", "")

            # 검색 결과가 있으면 컨텍스트로 사용
            search_results = context.get("search_results", [])
            # search_results가 딕셔너리인 경우와 리스트인 경우 모두 처리
            if isinstance(search_results, dict):
                documents = search_results.get("documents", [])
            elif isinstance(search_results, list):
                documents = search_results
            else:
                documents = []

            if documents:
                context_text = "\n\n".join([
                    f"[문서 {i+1}]\n{doc}"
                    for i, doc in enumerate(documents)
                ])
                prompt = f"""참고 문서:
{context_text}

---

질문: {question}

위 문서를 참고하여 답변해주세요."""
            else:
                prompt = question

            response = await self.registry.generate_text(
                provider_name=provider,
                model_id=model,
                prompt=prompt,
                system_prompt=system_prompt or "당신은 도움이 되는 AI 어시스턴트입니다.",
                temperature=temperature,
                max_tokens=max_tokens,
            )

            context["llm_response"] = response
            return {"answer": response, "model": f"{provider}/{model}"}

        elif block_type == "guardrail":
            # Guardrail 블록 - 입력/출력 검증
            check_type = config.get("check_type", "output")
            rules = config.get("rules", [])

            if check_type == "input":
                text = context["input"].get("question", "")
            else:
                text = context.get("llm_response", "")

            # 간단한 규칙 기반 검증
            violations = []
            for rule in rules:
                if rule.get("type") == "keyword_block":
                    blocked_words = rule.get("words", [])
                    for word in blocked_words:
                        if word.lower() in text.lower():
                            violations.append(f"차단된 키워드 발견: {word}")

            return {
                "passed": len(violations) == 0,
                "violations": violations,
                "checked_text_length": len(text),
            }

        else:
            return {"status": "unknown_block_type", "type": block_type}

    def _topological_sort(self, blocks: list[dict], edges: list[dict]) -> list[str]:
        """블록을 실행 순서대로 정렬 (위상 정렬)"""
        # 간단한 구현 - 연결선 기반 정렬
        block_ids = [b.get("id") for b in blocks]

        # 진입 차수 계산
        in_degree = {bid: 0 for bid in block_ids}
        adjacency = {bid: [] for bid in block_ids}

        for edge in edges:
            source = edge.get("source")
            target = edge.get("target")
            if source in adjacency and target in in_degree:
                adjacency[source].append(target)
                in_degree[target] += 1

        # 진입 차수가 0인 노드부터 시작
        queue = [bid for bid in block_ids if in_degree[bid] == 0]
        result = []

        while queue:
            node = queue.pop(0)
            result.append(node)

            for neighbor in adjacency.get(node, []):
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        return result

    def _find_block(self, blocks: list[dict], block_id: str) -> dict | None:
        """ID로 블록 찾기"""
        for block in blocks:
            if block.get("id") == block_id:
                return block
        return None

    def _get_block_inputs(
        self,
        block_id: str,
        edges: list[dict],
        outputs: dict,
    ) -> dict:
        """이전 블록들의 출력을 현재 블록의 입력으로 수집"""
        inputs = {}
        for edge in edges:
            if edge.get("target") == block_id:
                source_id = edge.get("source")
                if source_id in outputs:
                    inputs[source_id] = outputs[source_id]
        return inputs

    def _summarize_output(self, output: Any) -> Any:
        """출력 요약 (로깅용)"""
        if isinstance(output, dict):
            if "answer" in output:
                answer = output["answer"]
                return {
                    **output,
                    "answer": answer[:200] + "..." if len(answer) > 200 else answer,
                }
            if "embeddings" in output:
                return {**output, "embeddings": f"[{len(output['embeddings'])} vectors]"}
        return output


def get_pipeline_engine() -> PipelineEngine:
    return PipelineEngine()
