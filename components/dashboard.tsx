"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, BookOpen, FileText, Zap, Play, Trash2 } from 'lucide-react'

const templates = [
  {
    id: "contract",
    name: "계약서 Q&A",
    description: "계약서 문서 분석 및 질의응답",
    icon: FileText,
    defaultBlocks: [
      {
        name: "파일 업로드",
        description: "계약서 파일 선택",
        icon: "📄",
        blockType: "upload",
        subblockId: "file-upload", // PropertyPanel에 정의된 정확한 config 키 사용
        modelName: "PDF, DOCX, TXT 지원",
        settings: {},
      },
      {
        name: "정규화",
        description: "텍스트 정규화",
        icon: "🔧",
        blockType: "preprocess",
        subblockId: "normalization", // normalization으로 수정
        modelName: "",
        settings: {},
      },
      {
        name: "임베딩",
        description: "한국어 특화 임베딩",
        icon: "🧠",
        blockType: "embedding",
        subblockId: "embedding-korean", // embedding-korean으로 수정
        modelName: "KoSimCSE-RoBERTa",
        settings: {},
      },
      {
        name: "LLM",
        description: "질의응답 생성",
        icon: "💬",
        blockType: "llm",
        subblockId: "llm-powerful", // llm-powerful로 수정 (고성능 모델)
        modelName: "GPT-4 Turbo",
        settings: {},
      },
    ],
  },
  {
    id: "manual",
    name: "내부 매뉴얼 Q&A",
    description: "회사 매뉴얼 문서 기반 자동응답",
    icon: BookOpen,
    defaultBlocks: [
      {
        name: "웹페이지 크롤링",
        description: "매뉴얼 URL에서 데이터 수집",
        icon: "🌐",
        blockType: "upload",
        subblockId: "web-crawler", // web-crawler로 수정
        modelName: "",
        settings: {},
      },
      {
        name: "청크 분할",
        description: "문서를 의미있는 단위로 분할",
        icon: "✂️",
        blockType: "preprocess",
        subblockId: "tokenization", // tokenization으로 수정
        modelName: "",
        settings: {},
      },
      {
        name: "임베딩",
        description: "한국어 특화 임베딩",
        icon: "🧠",
        blockType: "embedding",
        subblockId: "embedding-korean",
        modelName: "KoSimCSE-RoBERTa",
        settings: {},
      },
      {
        name: "LLM",
        description: "자동응답 생성",
        icon: "💬",
        blockType: "llm",
        subblockId: "llm-korean", // llm-korean으로 수정
        modelName: "Claude 3.5 Sonnet",
        settings: {},
      },
      {
        name: "가드레일",
        description: "응답 검증 및 필터링",
        icon: "🛡️",
        blockType: "guardrail",
        subblockId: "profanity-filter", // profanity-filter로 수정
        modelName: "",
        settings: {},
      },
    ],
  },
  {
    id: "faq",
    name: "FAQ 빌더",
    description: "FAQ 문서로부터 자동 생성",
    icon: Zap,
    defaultBlocks: [
      {
        name: "파일 업로드",
        description: "FAQ 파일 선택",
        icon: "📄",
        blockType: "upload",
        subblockId: "file-upload",
        modelName: "CSV, JSON, XLSX 지원",
        settings: {},
      },
      {
        name: "언어감지",
        description: "문서 언어 자동 감지",
        icon: "🌍",
        blockType: "preprocess",
        subblockId: "language-detect", // language-detect로 수정
        modelName: "",
        settings: {},
      },
      {
        name: "임베딩",
        description: "다언어 임베딩",
        icon: "🧠",
        blockType: "embedding",
        subblockId: "embedding-multilang", // embedding-multilang으로 수정
        modelName: "multilingual-e5-base",
        settings: {},
      },
      {
        name: "LLM",
        description: "자연스러운 답변 생성",
        icon: "💬",
        blockType: "llm",
        subblockId: "llm-powerful",
        modelName: "GPT-4 Turbo",
        settings: {},
      },
    ],
  },
]

export function Dashboard({
  onCreatePipeline,
  savedPipelinesCount,
  onViewLibrary,
  savedPipelines,
  onRunPipeline,
  onEditPipeline,
  onDeletePipeline,
}: {
  onCreatePipeline: (pipe: any) => void
  savedPipelinesCount?: number
  onViewLibrary?: () => void
  savedPipelines?: any[]
  onRunPipeline?: (pipe: any) => void
  onEditPipeline?: (pipe: any) => void
  onDeletePipeline?: (id: string) => void
}) {
  const handleTemplateClick = (template: any) => {
    const canvasWidth = 1200
    const canvasHeight = 800
    const blockWidth = 176
    const blockHeight = 200
    const horizontalGap = 100
    
    const totalWidth = template.defaultBlocks.length * (blockWidth + horizontalGap)
    const startX = Math.max(50, (canvasWidth - totalWidth) / 2)
    const startY = (canvasHeight - blockHeight) / 2
    
    const blocksWithCoordinates = template.defaultBlocks.map((block: any, index: number) => ({
      id: `${template.id}-block-${index}`,
      subblockId: block.subblockId, // Canvas에서 찾을 수 있도록 subblockId 명확히 설정
      name: block.name,
      description: block.description,
      icon: block.icon,
      blockType: block.blockType,
      modelName: block.modelName,
      settings: block.settings,
      x: startX + index * (blockWidth + horizontalGap),
      y: startY,
    }))
    
    const autoEdges = blocksWithCoordinates.slice(0, -1).map((block: any, index: number) => ({
      source: block.id,
      target: blocksWithCoordinates[index + 1].id,
    }))
    
    onCreatePipeline({ 
      name: template.name, 
      blocks: blocksWithCoordinates, 
      edges: autoEdges 
    })
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-balance">AI 파이프라인 빌더</h1>
          <p className="text-muted-foreground text-lg">드래그앤드롭으로 AI 파이프라인을 쉽게 구성하세요</p>
        </div>

        <div className="mb-16 flex gap-3">
          <Button
            onClick={() => onCreatePipeline({ name: "New Pipeline", blocks: [], edges: [] })}
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <Plus className="w-5 h-5" />새 파이프라인 만들기
          </Button>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">템플릿으로 시작하기</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => {
              const Icon = template.icon
              return (
                <Card
                  key={template.id}
                  className="group cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 overflow-hidden"
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="p-6 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground flex-1">{template.description}</p>
                    <Button
                      variant="ghost"
                      className="mt-4 justify-start px-0 hover:bg-transparent hover:translate-x-1 transition-transform"
                    >
                      시작하기 →
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {savedPipelines && savedPipelines.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">내 파이프라인</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPipelines.map((pipeline) => (
                <Card
                  key={pipeline.id}
                  className="group hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 overflow-hidden"
                >
                  <div className="p-6 h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{pipeline.name}</h3>
                    <div className="flex-1 mb-4 text-sm text-muted-foreground">
                      <p>블록: {pipeline.blocks?.length || 0}개</p>
                      <p>작성자: {pipeline.author}</p>
                      <p className="text-xs mt-2">{new Date(pipeline.createdAt).toLocaleDateString("ko-KR")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onRunPipeline?.(pipeline)}
                        size="sm"
                        className="flex-1 gap-2 bg-primary hover:shadow-lg hover:shadow-primary/30"
                      >
                        <Play className="w-4 h-4" />
                        실행
                      </Button>
                      <Button onClick={() => onEditPipeline?.(pipeline)} variant="outline" size="sm" className="flex-1">
                        수정
                      </Button>
                      <Button
                        onClick={() => onDeletePipeline?.(pipeline.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
