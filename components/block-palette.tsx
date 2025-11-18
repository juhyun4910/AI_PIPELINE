"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const blockCategories = [
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
        settings: ["파일 선택", "이름", "권한"],
      },
      {
        id: "cloud-import",
        name: "클라우드 가져오기",
        description: "Google Drive, Dropbox, OneDrive에서 가져오기",
        icon: "☁️",
        settings: ["OAuth 계정 연결"],
      },
      {
        id: "web-crawler",
        name: "웹페이지 크롤링",
        description: "URL 입력 후 페이지 본문 추출",
        icon: "🧾",
        settings: ["URL", "최대 깊이", "허용 도메인"],
      },
      {
        id: "batch-folder",
        name: "폴더 일괄 업로드",
        description: "폴더 단위로 여러 파일 한 번에 업로드",
        icon: "🗂️",
        settings: ["폴더 경로", "확장자 필터"],
      },
    ],
  },
  {
    id: "preprocess",
    name: "🧹 전처리",
    color: "from-gray-800/30 to-gray-900/30",
    subblocks: [
      {
        id: "normalization",
        name: "정규화",
        description: "공백, 개행, 특수문자 제거",
        icon: "✂️",
        settings: ["제거 항목 체크박스"],
      },
      {
        id: "language-detect",
        name: "언어 감지",
        description: "언어 자동 식별 및 통일",
        icon: "🌐",
        settings: ["감지 언어", "자동 변환 여부"],
      },
      {
        id: "pii-masking",
        name: "개인정보 보호",
        description: "이름, 이메일, 주민번호 등 가리기",
        icon: "🔒",
        settings: ["마스킹 수준 (낮음/보통/높음)"],
      },
      {
        id: "table-code",
        name: "표/코드 보존",
        description: "표나 코드 블록이 깨지지 않게 유지",
        icon: "📊",
        settings: ["포맷 유지 여부"],
      },
      {
        id: "user-filter",
        name: "사용자 필터",
        description: "정규식 기반 텍스트 필터링",
        icon: "⚙️",
        settings: ["정규식", "치환어"],
      },
      {
        id: "summary-preprocess",
        name: "요약 전처리",
        description: "너무 긴 문장을 분리/단축",
        icon: "🧩",
        settings: ["최대 문장 길이"],
      },
      {
        id: "tokenization",
        name: "토큰 분할",
        description: "문장을 LLM이 이해할 수 있도록 분할",
        icon: "🧠",
        settings: ["토큰 크기", "단위 설정"],
      },
    ],
  },
  {
    id: "embedding",
    name: "🧬 임베딩",
    color: "from-purple-900/30 to-purple-950/30",
    subblocks: [
      {
        id: "embedding-korean",
        name: "한국어 특화 임베딩",
        description: "한국어 텍스트에 최적화된 모델",
        icon: "🇰🇷",
        modelName: "e5-small-korean",
        settings: ["임베딩 차원", "배치 크기"],
      },
      {
        id: "embedding-multilang",
        name: "다국어 임베딩",
        description: "영어, 중국어 등 다국어 지원",
        icon: "🌍",
        modelName: "all-MiniLM-l6-v2",
        settings: ["임베딩 차원", "배치 크기"],
      },
      {
        id: "embedding-fast",
        name: "빠른 임베딩",
        description: "속도 최적화된 경량 모델",
        icon: "⚡",
        modelName: "gte-small",
        settings: ["임베딩 차원", "배치 크기"],
      },
      {
        id: "embedding-dense",
        name: "고밀도 임베딩",
        description: "정확도 최적화된 고성능 모델",
        icon: "🎯",
        modelName: "e5-base",
        settings: ["임베딩 차원", "배치 크기"],
      },
    ],
  },
  {
    id: "llm",
    name: "💬 LLM",
    color: "from-green-900/30 to-green-950/30",
    subblocks: [
      {
        id: "llm-korean",
        name: "한국어 특화 LLM",
        description: "한국어 이해도가 높은 모델",
        icon: "🇰🇷",
        modelName: "Llama3.2-Korean",
        settings: ["온도", "최대 토큰"],
      },
      {
        id: "llm-fast",
        name: "빠른 응답",
        description: "속도 최적화된 경량 LLM",
        icon: "⚡",
        modelName: "Phi-3-small",
        settings: ["온도", "최대 토큰"],
      },
      {
        id: "llm-powerful",
        name: "고성능 LLM",
        description: "정확도와 창의성이 뛰어난 모델",
        icon: "🚀",
        modelName: "Qwen2.5-large",
        settings: ["온도", "최대 토큰"],
      },
      {
        id: "llm-instruct",
        name: "명령 이해 LLM",
        description: "복잡한 명령을 잘 따르는 모델",
        icon: "📝",
        modelName: "Llama3.2-Instruct",
        settings: ["온도", "최대 토큰"],
      },
    ],
  },
  {
    id: "guardrail",
    name: "🛡️ 가드레일",
    color: "from-red-900/30 to-red-950/30",
    subblocks: [
      {
        id: "profanity-filter",
        name: "금칙어 필터",
        description: "욕설, 증오, 불법 표현 감지",
        icon: "🚫",
        settings: ["필터링 강도", "화이트리스트"],
      },
      {
        id: "fact-check",
        name: "근거 검증",
        description: "LLM 답변의 근거 문단 검출",
        icon: "✓",
        settings: ["검증 모드", "임계값"],
      },
      {
        id: "policy-message",
        name: "정책 메시지",
        description: "차단 시 사용자에게 이유 안내",
        icon: "📢",
        settings: ["메시지 텍스트", "노출 여부"],
      },
      {
        id: "audit-log",
        name: "감사 로그",
        description: "차단된 케이스 기록",
        icon: "📋",
        settings: ["로깅 수준", "저장소"],
      },
    ],
  },
]

export function BlockPalette({ onAddBlock }: { onAddBlock: (block: any) => void }) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["upload"]))

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
      id: subblock.id,
      name: subblock.name,
      description: subblock.description,
      icon: subblock.icon,
      blockType: category.id,
      modelName: subblock.modelName || null,
      settings: subblock.settings,
    }
    e.dataTransfer.setData("application/json", JSON.stringify(blockData))
  }

  return (
    <div className="w-72 border-r border-border/50 bg-card/30 backdrop-blur-sm overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3">블록 팔레트</h3>
        <Input placeholder="블록 검색..." className="mb-4" />

        <div className="space-y-2">
          {blockCategories.map((category) => (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  expandedCategories.has(category.id)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${expandedCategories.has(category.id) ? "" : "-rotate-90"}`}
                />
                {category.name}
              </button>

              {expandedCategories.has(category.id) && (
                <div className="ml-2 mt-1 space-y-1 pb-2">
                  {category.subblocks.map((subblock) => (
                    <Card
                      key={subblock.id}
                      className={`p-2.5 cursor-move hover:border-primary/50 transition-all duration-300 bg-gradient-to-br ${category.color} hover:shadow-md group`}
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
                          {subblock.modelName && (
                            <div className="text-xs text-primary/70 mt-1 font-mono">{subblock.modelName}</div>
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
      </div>
    </div>
  )
}
