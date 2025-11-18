"use client"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const getBlockConfig = (blockType: string) => {
  const configs: Record<string, any> = {
    // 업로드
    "file-upload": {
      name: "📄 파일 업로드",
      ui: "fileUpload",
      description: "PDF, DOCX, TXT 등 문서 업로드",
    },
    "cloud-import": {
      name: "☁️ 클라우드 가져오기",
      ui: "cloudImport",
      description: "Google Drive, Dropbox, OneDrive에서 가져오기",
    },
    "web-crawler": {
      name: "🧾 웹페이지 크롤링",
      ui: "webCrawler",
      description: "URL 입력 후 페이지 본문 추출",
    },
    "batch-folder": {
      name: "🗂️ 폴더 일괄 업로드",
      ui: "batchFolder",
      description: "폴더 단위로 여러 파일 한 번에 업로드",
    },
    // 전처리
    normalization: {
      name: "✂️ 정규화",
      ui: "normalization",
      description: "공백, 개행, 특수문자 제거",
    },
    "language-detect": {
      name: "🌐 언어 감지",
      ui: "languageDetect",
      description: "언어 자동 식별 및 통일",
    },
    "pii-masking": {
      name: "🔒 개인정보 보호",
      ui: "piiMasking",
      description: "이름, 이메일, 주민번호 등 가리기",
    },
    "table-code": {
      name: "📊 표/코드 보존",
      ui: "tableCode",
      description: "표나 코드 블록이 깨지지 않게 유지",
    },
    "user-filter": {
      name: "⚙️ 사용자 필터",
      ui: "userFilter",
      description: "정규식 기반 텍스트 필터링",
    },
    "summary-preprocess": {
      name: "🧩 요약 전처리",
      ui: "summaryPreprocess",
      description: "너무 긴 문장을 분리/단축",
    },
    tokenization: {
      name: "🧠 토큰 분할",
      ui: "tokenization",
      description: "문장을 LLM이 이해할 수 있도록 분할",
    },
    // 임베딩
    "embedding-korean": {
      name: "🇰🇷 한국어 특화 임베딩",
      ui: "embeddingCommon",
      description: "한국어 텍스트에 최적화된 모델",
      model: "e5-small-korean",
    },
    "embedding-multilang": {
      name: "🌍 다국어 임베딩",
      ui: "embeddingCommon",
      description: "영어, 중국어 등 다국어 지원",
      model: "all-MiniLM-l6-v2",
    },
    "embedding-fast": {
      name: "⚡ 빠른 임베딩",
      ui: "embeddingCommon",
      description: "속도 최적화된 경량 모델",
      model: "gte-small",
    },
    "embedding-dense": {
      name: "🎯 고밀도 임베딩",
      ui: "embeddingCommon",
      description: "정확도 최적화된 고성능 모델",
      model: "e5-base",
    },
    // LLM
    "llm-korean": {
      name: "🇰🇷 한국어 특화 LLM",
      ui: "llmCommon",
      description: "한국어 이해도가 높은 모델",
      model: "Llama3.2-Korean",
    },
    "llm-fast": {
      name: "⚡ 빠른 응답",
      ui: "llmCommon",
      description: "속도 최적화된 경량 LLM",
      model: "Phi-3-small",
    },
    "llm-powerful": {
      name: "🚀 고성능 LLM",
      ui: "llmCommon",
      description: "정확도와 창의성이 뛰어난 모델",
      model: "Qwen2.5-large",
    },
    "llm-instruct": {
      name: "📝 명령 이해 LLM",
      ui: "llmCommon",
      description: "복잡한 명령을 잘 따르는 모델",
      model: "Llama3.2-Instruct",
    },
    // 가드레일
    "profanity-filter": {
      name: "🚫 금칙어 필터",
      ui: "profanityFilter",
      description: "욕설, 증오, 불법 표현 감지",
    },
    "fact-check": {
      name: "✓ 근거 검증",
      ui: "factCheck",
      description: "LLM 답변의 근거 문단 검출",
    },
    "policy-message": {
      name: "📢 정책 메시지",
      ui: "policyMessage",
      description: "차단 시 사용자에게 이유 안내",
    },
    "audit-log": {
      name: "📋 감사 로그",
      ui: "auditLog",
      description: "차단된 케이스 기록",
    },
  }

  return configs[blockType]
}

// 업로드 - 파일 업로드
function FileUploadUI() {
  return (
    <div className="space-y-4">
      <input
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.pptx,.xlsx"
        className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm cursor-pointer"
      />
      <p className="text-xs text-muted-foreground">지원: PDF, DOCX, TXT, PPTX, XLSX (최대 200MB)</p>
    </div>
  )
}

// 업로드 - 클라우드 가져오기
function CloudImportUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">서비스 선택</label>
        <select className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm">
          <option>Google Drive</option>
          <option>Dropbox</option>
          <option>OneDrive</option>
        </select>
      </div>
      <button className="w-full px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium transition-colors">
        계정 연결하기
      </button>
    </div>
  )
}

// 업로드 - 웹페이지 크롤링
function WebCrawlerUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">URL 입력</label>
        <Input placeholder="https://example.com" className="bg-background/50" />
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">최대 깊이</label>
        <Input type="number" defaultValue="2" min="1" max="10" className="bg-background/50" />
        <p className="text-xs text-muted-foreground mt-1">크롤링할 링크의 깊이 (1 = 현재 페이지만)</p>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">허용 도메인</label>
        <Input placeholder="example.com" className="bg-background/50" />
        <p className="text-xs text-muted-foreground mt-1">다른 도메인 크롤링 방지</p>
      </div>
    </div>
  )
}

// 업로드 - 폴더 일괄 업로드
function BatchFolderUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">폴더 선택</label>
        <button className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm hover:bg-background/80 transition-colors">
          폴더 선택
        </button>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">확장자 필터</label>
        <Input placeholder="pdf, docx, txt (쉼표로 구분)" className="bg-background/50" />
      </div>
    </div>
  )
}

// 전처리 - 정규화
function NormalizationUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">제거 항목 선택</label>
        <div className="space-y-2">
          {[
            { id: "whitespace", label: "추가 공백/개행 정리" },
            { id: "special", label: "특수문자 제거" },
            { id: "numbers", label: "숫자 제거" },
            { id: "punct", label: "문장부호 정리" },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              {item.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// 전처리 - 언어 감지
function LanguageDetectUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">감지 언어</label>
        <select className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm">
          <option>자동 감지</option>
          <option>한국어</option>
          <option>영어</option>
          <option>중국어</option>
          <option>일본어</option>
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded" />
          자동 번역 (다른 언어 감지 시)
        </label>
      </div>
    </div>
  )
}

// 전처리 - 개인정보 보호
function PiiMaskingUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">마스킹 수준</label>
        <div className="space-y-2">
          {[
            { value: "low", label: "낮음 - 이메일, 전화번호만" },
            { value: "medium", label: "보통 - 주소, 이름 포함" },
            { value: "high", label: "높음 - 모든 개인정보" },
          ].map((level) => (
            <label key={level.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="masking-level" defaultChecked={level.value === "medium"} />
              {level.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">마스킹 문자</label>
        <Input defaultValue="*" maxLength="1" className="bg-background/50 w-20" />
      </div>
    </div>
  )
}

// 전처리 - 표/코드 보존
function TableCodeUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded" />
          표 포맷 유지
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
          <input type="checkbox" defaultChecked className="rounded" />
          코드 블록 유지
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
          <input type="checkbox" defaultChecked className="rounded" />
          목록 구조 유지
        </label>
      </div>
    </div>
  )
}

// 전처리 - 사용자 필터
function UserFilterUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">정규식 패턴</label>
        <textarea
          placeholder="예: [A-Z]{2,4}"
          className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm min-h-20"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">치환어</label>
        <Input placeholder="(비워두면 제거됨)" className="bg-background/50" />
      </div>
    </div>
  )
}

// 전처리 - 요약 전처리
function SummaryPreprocessUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">최대 문장 길이</label>
        <div className="flex items-center gap-2">
          <Input type="number" defaultValue="200" className="bg-background/50 flex-1" />
          <span className="text-xs text-muted-foreground">자</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">이보다 긴 문장은 자동으로 분리됩니다</p>
      </div>
    </div>
  )
}

// 전처리 - 토큰 분할
function TokenizationUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">토큰 크기</label>
        <Input type="number" defaultValue="512" className="bg-background/50" />
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">단위</label>
        <select className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm">
          <option>단어</option>
          <option>문장</option>
          <option>문단</option>
          <option>글자</option>
        </select>
      </div>
    </div>
  )
}

// 임베딩 - 공통
function EmbeddingCommonUI({ model }: { model: string }) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-xs font-mono text-primary">{model}</p>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">임베딩 차원</label>
        <select className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm">
          <option>128 (빠름)</option>
          <option>256 (권장)</option>
          <option>512 (정확함)</option>
          <option>768 (고정밀)</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">배치 크기</label>
        <Input type="number" defaultValue="32" className="bg-background/50" />
        <p className="text-xs text-muted-foreground mt-1">동시 처리 문서 수 (메모리 많을수록 빠름)</p>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">청크 크기</label>
        <Input type="number" defaultValue="800" className="bg-background/50" />
        <p className="text-xs text-muted-foreground mt-1">💡 한 번에 임베딩할 텍스트 크기. 권장: 500-1000자</p>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">오버랩</label>
        <Input type="number" defaultValue="100" className="bg-background/50" />
        <p className="text-xs text-muted-foreground mt-1">💡 청크 간 겹치는 부분. 맥락 손실 방지. 권장: 100-200자</p>
      </div>
    </div>
  )
}

// LLM - 공통
function LlmCommonUI({ model }: { model: string }) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
        <p className="text-xs font-mono text-green-400">{model}</p>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">Temperature (창의성)</label>
        <div className="space-y-2">
          <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.0 (일관성)</span>
            <span>0.7 (균형)</span>
            <span>1.0 (창의성)</span>
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">최대 토큰</label>
        <Input type="number" defaultValue="2048" className="bg-background/50" />
        <p className="text-xs text-muted-foreground mt-1">생성할 최대 답변 길이</p>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">Top-P (다양성)</label>
        <div className="space-y-2">
          <input type="range" min="0" max="1" step="0.05" defaultValue="0.9" className="w-full" />
          <p className="text-xs text-muted-foreground">낮을수록 일관된 답변</p>
        </div>
      </div>
    </div>
  )
}

// 가드레일 - 금칙어 필터
function ProfanityFilterUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">필터링 강도</label>
        <div className="space-y-2">
          {[
            { value: "low", label: "낮음 - 명백한 욕설만" },
            { value: "medium", label: "보통 - 욕설 + 증오 표현" },
            { value: "high", label: "높음 - 민감한 표현까지" },
          ].map((level) => (
            <label key={level.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="profanity-level" defaultChecked={level.value === "medium"} />
              {level.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">화이트리스트 (제외 단어)</label>
        <textarea
          placeholder="승인할 단어 입력 (줄바꿈으로 구분)"
          className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm min-h-20"
        />
      </div>
    </div>
  )
}

// 가드레일 - 근거 검증
function FactCheckUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">검증 모드</label>
        <select className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm">
          <option>엄격 - 반드시 근거 필요</option>
          <option>균형 - 근거 권장</option>
          <option>느슨함 - 근거 선택</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">임계값</label>
        <div className="flex items-center gap-2">
          <input type="range" min="0" max="100" defaultValue="70" className="flex-1" />
          <span className="text-sm text-muted-foreground w-12">70%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">이 이상의 확신도가 필요</p>
      </div>
    </div>
  )
}

// 가드레일 - 정책 메시지
function PolicyMessageUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">차단 메시지</label>
        <textarea
          defaultValue="죄송하지만 이 질문에는 답변할 수 없습니다."
          className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm min-h-20"
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded" />
          이유 함께 표시
        </label>
      </div>
    </div>
  )
}

// 가드레일 - 감사 로그
function AuditLogUI() {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-2">로깅 수준</label>
        <select className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm">
          <option>모든 차단</option>
          <option>의심스러운 것만</option>
          <option>심각한 것만</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-2">저장소</label>
        <select className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-foreground text-sm">
          <option>데이터베이스</option>
          <option>파일 시스템</option>
          <option>클라우드 저장소</option>
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded" />
          자동 정리 (90일 후)
        </label>
      </div>
    </div>
  )
}

export function PropertyPanel({ block }: { block: any }) {
  if (!block) {
    return (
      <div className="w-80 border-l border-border/50 bg-card/30 backdrop-blur-sm overflow-y-auto p-6">
        <p className="text-muted-foreground">블록을 선택하세요</p>
      </div>
    )
  }

  const config = getBlockConfig(block.subblockId)

  if (!config) {
    return (
      <div className="w-80 border-l border-border/50 bg-card/30 backdrop-blur-sm overflow-y-auto p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{block.icon}</span>
          <div>
            <h3 className="text-lg font-semibold">{block.name}</h3>
            <p className="text-xs text-muted-foreground">{block.description}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">설정할 항목이 없습니다</p>
      </div>
    )
  }

  const renderUI = () => {
    switch (config.ui) {
      case "fileUpload":
        return <FileUploadUI />
      case "cloudImport":
        return <CloudImportUI />
      case "webCrawler":
        return <WebCrawlerUI />
      case "batchFolder":
        return <BatchFolderUI />
      case "normalization":
        return <NormalizationUI />
      case "languageDetect":
        return <LanguageDetectUI />
      case "piiMasking":
        return <PiiMaskingUI />
      case "tableCode":
        return <TableCodeUI />
      case "userFilter":
        return <UserFilterUI />
      case "summaryPreprocess":
        return <SummaryPreprocessUI />
      case "tokenization":
        return <TokenizationUI />
      case "embeddingCommon":
        return <EmbeddingCommonUI model={config.model} />
      case "llmCommon":
        return <LlmCommonUI model={config.model} />
      case "profanityFilter":
        return <ProfanityFilterUI />
      case "factCheck":
        return <FactCheckUI />
      case "policyMessage":
        return <PolicyMessageUI />
      case "auditLog":
        return <AuditLogUI />
      default:
        return <div>설정할 항목이 없습니다</div>
    }
  }

  return (
    <div className="w-80 border-l border-border/50 bg-card/30 backdrop-blur-sm overflow-y-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{block.icon}</span>
          <div>
            <h3 className="text-lg font-semibold">{block.name}</h3>
            <p className="text-xs text-muted-foreground">{block.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold">설정</h4>
        {renderUI()}
      </div>
    </div>
  )
}
