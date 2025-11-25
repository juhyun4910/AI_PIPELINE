"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { getAvailableModels, type LLMModel, type EmbeddingModel } from "@/lib/api"

// 정적 블록 카테고리 (업로드, 전처리, 가드레일)
const staticCategories = [
  {
    id: "upload",
    name: "📂 업로드",
    color: "from-blue-900/30 to-blue-950/30",
    subblocks: [
      {
        id: "file-upload",
        name: "파일 업로드",
        description: "PDF, DOCX, TXT 등 문서 업로드",
        icon: "📄",
        type: "upload",
        settings: ["파일 선택"],
      },
      {
        id: "web-crawler",
        name: "웹페이지 크롤링",
        description: "URL 입력 후 페이지 본문 추출",
        icon: "🧾",
        type: "upload",
        settings: ["URL"],
      },
    ],
  },
  {
    id: "preprocess",
    name: "🧹 전처리",
    color: "from-gray-800/30 to-gray-900/30",
    subblocks: [
      {
        id: "chunking",
        name: "텍스트 청킹",
        description: "문서를 작은 조각으로 분할",
        icon: "✂️",
        type: "preprocess",
        settings: ["청크 크기", "오버랩"],
      },
      {
        id: "normalization",
        name: "정규화",
        description: "공백, 개행, 특수문자 제거",
        icon: "🧹",
        type: "preprocess",
        settings: ["제거 항목"],
      },
    ],
  },
  {
    id: "vectorstore",
    name: "💾 벡터 저장소",
    color: "from-cyan-900/30 to-cyan-950/30",
    subblocks: [
      {
        id: "chroma-store",
        name: "Chroma DB 저장",
        description: "벡터 데이터베이스에 저장",
        icon: "🗄️",
        type: "vectorstore",
        settings: ["컬렉션 이름"],
      },
      {
        id: "vector-search",
        name: "벡터 검색",
        description: "유사 문서 검색",
        icon: "🔍",
        type: "search",
        settings: ["검색 개수"],
      },
    ],
  },
  {
    id: "guardrail",
    name: "🛡️ 가드레일",
    color: "from-red-900/30 to-red-950/30",
    subblocks: [
      {
        id: "input-guard",
        name: "입력 검증",
        description: "사용자 입력 필터링",
        icon: "🚫",
        type: "guardrail",
        settings: ["차단 키워드"],
      },
      {
        id: "output-guard",
        name: "출력 검증",
        description: "LLM 응답 필터링",
        icon: "✓",
        type: "guardrail",
        settings: ["검증 규칙"],
      },
    ],
  },
]

// LLM 모델을 블록으로 변환
function llmModelsToBlocks(models: LLMModel[]) {
  return models.map((model) => ({
    id: "llm-" + model.provider + "-" + model.id,
    name: model.name,
    description: model.description,
    icon: model.korean_support ? "🇰🇷" : "🤖",
    type: "llm",
    modelId: model.id,
    provider: model.provider,
    contextLength: model.context_length,
    settings: ["온도", "최대 토큰", "시스템 프롬프트"],
  }))
}

// 임베딩 모델을 블록으로 변환
function embeddingModelsToBlocks(models: EmbeddingModel[]) {
  return models.map((model) => ({
    id: "embedding-" + model.provider + "-" + model.id,
    name: model.name,
    description: model.description,
    icon: model.korean_support ? "🇰🇷" : "🧬",
    type: "embedding",
    modelId: model.id,
    provider: model.provider,
    dimension: model.dimension,
    settings: ["배치 크기"],
  }))
}

export function BlockPalette({ onAddBlock }: { onAddBlock: (block: any) => void }) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["upload"]))
  const [blockCategories, setBlockCategories] = useState(staticCategories)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // 백엔드에서 모델 목록 가져오기
  useEffect(() => {
    async function fetchModels() {
      try {
        const models = await getAvailableModels()

        // LLM 카테고리 생성
        const llmCategory = {
          id: "llm",
          name: "🤖 LLM",
          color: "from-green-900/30 to-green-950/30",
          subblocks: llmModelsToBlocks(models.llm),
        }

        // 임베딩 카테고리 생성
        const embeddingCategory = {
          id: "embedding",
          name: "🧬 임베딩",
          color: "from-purple-900/30 to-purple-950/30",
          subblocks: embeddingModelsToBlocks(models.embedding),
        }

        // 카테고리 합치기
        setBlockCategories([
          staticCategories[0], // 업로드
          staticCategories[1], // 전처리
          embeddingCategory,   // 임베딩 (백엔드)
          staticCategories[2], // 벡터 저장소
          llmCategory,         // LLM (백엔드)
          staticCategories[3], // 가드레일
        ])
      } catch (error) {
        console.error("Failed to fetch models:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [])

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleDragStart = (e: React.DragEvent, subblock: any, category: any) => {
    e.dataTransfer.effectAllowed = "copy"
    const blockData = {
      id: subblock.id + "-" + Date.now().toString(),
      name: subblock.name,
      description: subblock.description,
      icon: subblock.icon,
      type: subblock.type || category.id,
      modelId: subblock.modelId || null,
      provider: subblock.provider || null,
      dimension: subblock.dimension || null,
      contextLength: subblock.contextLength || null,
      settings: subblock.settings,
      config: {},
    }
    e.dataTransfer.setData("application/json", JSON.stringify(blockData))
  }

  // 검색 필터링
  const filteredCategories = blockCategories.map((category) => ({
    ...category,
    subblocks: category.subblocks.filter(
      (subblock) =>
        subblock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subblock.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.subblocks.length > 0)

  return (
    <div className="w-72 border-r border-border/50 bg-card/30 backdrop-blur-sm overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3">블록 팔레트</h3>
        <Input
          placeholder="블록 검색..."
          className="mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">모델 로딩 중...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={"w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all " +
                    (expandedCategories.has(category.id)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50")
                  }
                >
                  <ChevronDown
                    className={"w-4 h-4 transition-transform " + (expandedCategories.has(category.id) ? "" : "-rotate-90")}
                  />
                  {category.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {category.subblocks.length}
                  </span>
                </button>

                {expandedCategories.has(category.id) && (
                  <div className="ml-2 mt-1 space-y-1 pb-2">
                    {category.subblocks.map((subblock: any) => (
                      <Card
                        key={subblock.id}
                        className={"p-2.5 cursor-move hover:border-primary/50 transition-all duration-300 bg-gradient-to-br " + category.color + " hover:shadow-md group"}
                        draggable
                        onDragStart={(e) => handleDragStart(e, subblock, category)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg leading-none mt-0.5">{subblock.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs leading-tight">{subblock.name}</div>
                            <div className="text-xs text-muted-foreground/90 mt-0.5 line-clamp-2">
                              {subblock.description}
                            </div>
                            {subblock.modelId && (
                              <div className="text-xs text-primary/70 mt-1 font-mono">
                                {subblock.provider}/{subblock.modelId}
                              </div>
                            )}
                            {subblock.dimension && (
                              <div className="text-xs text-muted-foreground mt-1">
                                차원: {subblock.dimension}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary/80">
                          드래그해서 추가
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
