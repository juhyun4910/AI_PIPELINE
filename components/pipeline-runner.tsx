"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, Download, CheckCircle, Clock } from "lucide-react"

export function PipelineRunner({
  pipeline,
  onBack,
}: {
  pipeline: any
  onBack: () => void
}) {
  const [input, setInput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleRun = async () => {
    setIsRunning(true)
    // 실제 구현에서는 API 호출을 통해 파이프라인 실행
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setResult({
      answer: "입력된 질문에 대한 답변을 생성했습니다. 이는 파이프라인의 각 블록을 순서대로 처리한 결과입니다.",
      citations: ["문서 1번 문단", "문서 3번 문단"],
      context: "파이프라인에서 추출한 관련 컨텍스트 정보",
      executionTime: "2.34초",
      status: "success",
    })
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold">{pipeline.name} 실행</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 입력 영역 */}
          <div className="lg:col-span-1">
            <Card className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">입력</h3>
              <textarea
                placeholder="질문을 입력하세요..."
                className="flex-1 p-4 rounded-lg bg-input border border-border resize-none focus:outline-none focus:ring-1 focus:ring-primary mb-4"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button
                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={handleRun}
                disabled={!input || isRunning}
              >
                <Play className="w-4 h-4" />
                {isRunning ? "실행 중..." : "실행"}
              </Button>
            </Card>
          </div>

          {/* 결과 영역 */}
          <div className="lg:col-span-2">
            {result ? (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold">실행 완료</h3>
                  <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {result.executionTime}
                  </span>
                </div>

                <Tabs defaultValue="answer">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="answer">답변</TabsTrigger>
                    <TabsTrigger value="citations">인용</TabsTrigger>
                    <TabsTrigger value="context">맥락</TabsTrigger>
                  </TabsList>

                  <TabsContent value="answer" className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-900/30">
                      <p className="text-sm">{result.answer}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="citations" className="space-y-3">
                    {result.citations.map((citation: string, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50 text-sm">
                        {citation}
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="context" className="space-y-4">
                    <div className="p-4 rounded-lg bg-background/50 border border-border/50 text-sm">
                      {result.context}
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  variant="outline"
                  className="w-full mt-4 gap-2 bg-transparent"
                  onClick={() => {
                    const data = JSON.stringify(result, null, 2)
                    const blob = new Blob([data], { type: "application/json" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `result-${Date.now()}.json`
                    a.click()
                  }}
                >
                  <Download className="w-4 h-4" />
                  결과 다운로드
                </Button>
              </Card>
            ) : (
              <Card className="p-12 text-center text-muted-foreground">
                <p>입력값을 작성하고 실행 버튼을 누르세요</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
