"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Download } from 'lucide-react'

interface TestPanelProps {
  pipeline: any
}

export function TestPanel({ pipeline }: TestPanelProps) {
  const [prompt, setPrompt] = useState("")
  const [promptError, setPromptError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<{
    answer: string
    citations: string[]
    context: string[]
    report: string
  } | null>(null)

  const handleRunTest = () => {
    if (!prompt.trim()) {
      setPromptError("프롬프트를 입력한 뒤 테스트를 실행해주세요.")
      setTestResults(null)
      return
    }

    setPromptError(null)
    setTestResults({
      answer: `입력하신 "${prompt}" 에 대한 모의 응답입니다. 실제 연동 시 이 영역에 모델이 생성한 답변을 노출하세요.`,
      citations: ["예시 문서 1", "예시 문서 2"],
      context: [`"${prompt}" 과(와) 관련된 콘텍스트 1`, `"${prompt}" 과(와) 관련된 콘텍스트 2`],
      report: "실행 로그 및 품질 리포트가 이 영역에 출력됩니다.",
    })
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
          <Card className="p-3 h-full bg-background/50">
            {testResults ? (
              <p className="text-sm text-muted-foreground">{testResults.answer}</p>
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
                <p className="text-sm text-muted-foreground">테스트를 실행하면 인용 출처가 여기에 표시됩니다.</p>
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
                <p className="text-sm text-muted-foreground">실행 결과가 없으면 콘텍스트 역시 비워집니다.</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="flex-1 mt-4">
          <Card className="p-3 h-full bg-background/50">
            {testResults ? (
              <p className="text-sm text-muted-foreground">{testResults.report}</p>
            ) : (
              <p className="text-sm text-muted-foreground">테스트 리포트는 실행 후 다운로드할 수 있습니다.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-border/30 space-y-2">
        <Button onClick={handleRunTest} className="w-full" size="sm">
          테스트 실행
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          disabled={!testResults}
          onClick={() => {
            if (!testResults) return
            const blob = new Blob([JSON.stringify(testResults, null, 2)], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `test-report-${Date.now()}.json`
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
