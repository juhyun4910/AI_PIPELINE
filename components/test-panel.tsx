"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Download, Loader2 } from 'lucide-react'
import { runPipeline, chat } from "@/lib/api"

interface TestPanelProps {
  pipeline: any
  blocks?: any[]
  edges?: any[]
}

export function TestPanel({ pipeline, blocks = [], edges = [] }: TestPanelProps) {
  const [prompt, setPrompt] = useState("")
  const [promptError, setPromptError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<{
    answer: string
    citations: string[]
    context: string[]
    report: string
    modelUsed?: string
  } | null>(null)

  const handleRunTest = async () => {
    if (!prompt.trim()) {
      setPromptError("프롬프트를 입력한 뒤 테스트를 실행해주세요.")
      setTestResults(null)
      return
    }

    setPromptError(null)
    setIsLoading(true)

    try {
      // 파이프라인에 LLM 블록이 있는지 확인
      const llmBlock = blocks.find((b: any) => b.type === "llm")

      // 디버깅: 블록 정보 확인
      console.log("=== Test Panel Debug ===")
      console.log("All blocks:", blocks)
      console.log("LLM Block found:", llmBlock)
      if (llmBlock) {
        console.log("LLM Block provider:", llmBlock.provider)
        console.log("LLM Block modelId:", llmBlock.modelId)
      }

      if (llmBlock && blocks.length > 0) {
        // 파이프라인 실행
        const result = await runPipeline({
          blocks: blocks,
          edges: edges,
          input: { question: prompt },
        })

        if (result.success && result.final_output) {
          setTestResults({
            answer: result.final_output.answer || "응답을 생성했습니다.",
            citations: [],
            context: result.steps.map((s: any) => s.blockName + ": " + s.status),
            report: JSON.stringify(result.steps, null, 2),
            modelUsed: result.final_output.model,
          })
        } else {
          setTestResults({
            answer: result.error || "파이프라인 실행 중 오류가 발생했습니다.",
            citations: [],
            context: [],
            report: JSON.stringify(result, null, 2),
          })
        }
      } else {
        // LLM 블록이 없으면 기본 채팅 API 사용
        const result = await chat({
          question: prompt,
          llm_provider: "groq",
          llm_model: "llama-3.1-8b-instant",
        })

        setTestResults({
          answer: result.answer,
          citations: [],
          context: [],
          report: "모델: " + result.model_used,
          modelUsed: result.model_used,
        })
      }
    } catch (error: any) {
      setPromptError(error.message || "테스트 실행 중 오류가 발생했습니다.")
      setTestResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-80 border-l border-border/30 bg-card/30 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border/30 space-y-3">
        <h3 className="font-semibold text-sm">테스트 패널</h3>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">프롬프트</label>
          <textarea
            className="w-full rounded-md bg-background/40 border border-border/50 p-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
            placeholder="테스트할 질문이나 명령어를 입력하세요."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
          {promptError && <p className="text-xs text-destructive mt-1">{promptError}</p>}
        </div>
      </div>

      <Tabs defaultValue="answer" className="flex-1 flex flex-col p-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="answer" className="text-xs">
            응답
          </TabsTrigger>
          <TabsTrigger value="citations" className="text-xs">
            출처
          </TabsTrigger>
          <TabsTrigger value="context" className="text-xs">
            콘텍스트
          </TabsTrigger>
          <TabsTrigger value="report" className="text-xs">
            리포트
          </TabsTrigger>
        </TabsList>

        <TabsContent value="answer" className="flex-1 mt-4">
          <Card className="p-3 h-full bg-background/50 overflow-auto">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                LLM 응답 생성 중...
              </div>
            ) : testResults ? (
              <div>
                <p className="text-sm whitespace-pre-wrap">{testResults.answer}</p>
                {testResults.modelUsed && (
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30">
                    사용 모델: {testResults.modelUsed}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">프롬프트를 입력하고 실행을 누르면 응답이 표시됩니다.</p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="citations" className="flex-1 mt-4">
          <Card className="p-3 h-full bg-background/50">
            <div className="space-y-2">
              {testResults && testResults.citations.length > 0 ? (
                testResults.citations.map((citation, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    {citation}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">문서 기반 검색 시 인용 출처가 여기에 표시됩니다.</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="context" className="flex-1 mt-4">
          <Card className="p-3 h-full bg-background/50">
            <div className="space-y-2">
              {testResults && testResults.context.length > 0 ? (
                testResults.context.map((ctx, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    {ctx}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">파이프라인 실행 단계가 여기에 표시됩니다.</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="flex-1 mt-4">
          <Card className="p-3 h-full bg-background/50 overflow-auto">
            {testResults ? (
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{testResults.report}</pre>
            ) : (
              <p className="text-sm text-muted-foreground">테스트 리포트는 실행 후 다운로드할 수 있습니다.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-border/30 space-y-2">
        <Button
          onClick={handleRunTest}
          className="w-full"
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              실행 중...
            </>
          ) : (
            "테스트 실행"
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          disabled={!testResults || isLoading}
          onClick={() => {
            if (!testResults) return
            const blob = new Blob([JSON.stringify(testResults, null, 2)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "test-report-" + Date.now() + ".json"
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          <Download className="w-4 h-4" />
          결과 다운로드
        </Button>
      </div>
    </div>
  )
}
