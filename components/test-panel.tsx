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
  const [testResults, setTestResults] = useState({
    answer: "테스트 결과가 여기에 표시됩니다.",
    citations: [],
    context: [],
    report: "",
  })

  const handleRunTest = () => {
    setTestResults({
      answer: "파이프라인이 성공적으로 실행되었습니다.",
      citations: ["출처 1", "출처 2"],
      context: ["관련 문맥 1", "관련 문맥 2"],
      report: "실행 보고서",
    })
  }

  return (
    <div className="w-80 border-l border-border/30 bg-card/30 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border/30">
        <h3 className="font-semibold text-sm">테스트 결과</h3>
      </div>

      <Tabs defaultValue="answer" className="flex-1 flex flex-col p-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="answer" className="text-xs">
            답변
          </TabsTrigger>
          <TabsTrigger value="citations" className="text-xs">
            인용
          </TabsTrigger>
          <TabsTrigger value="context" className="text-xs">
            맥락
          </TabsTrigger>
          <TabsTrigger value="report" className="text-xs">
            보고서
          </TabsTrigger>
        </TabsList>

        <TabsContent value="answer" className="flex-1 mt-4">
          <Card className="p-3 h-full bg-background/50">
            <p className="text-sm text-muted-foreground">{testResults.answer}</p>
          </Card>
        </TabsContent>

        <TabsContent value="citations" className="flex-1 mt-4">
          <Card className="p-3 h-full bg-background/50">
            <div className="space-y-2">
              {testResults.citations.length > 0 ? (
                testResults.citations.map((citation, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    {citation}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">인용이 없습니다</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="context" className="flex-1 mt-4">
          <Card className="p-3 h-full bg-background/50">
            <div className="space-y-2">
              {testResults.context.length > 0 ? (
                testResults.context.map((ctx, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    {ctx}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">맥락이 없습니다</p>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="flex-1 mt-4">
          <Card className="p-3 h-full bg-background/50">
            <p className="text-sm text-muted-foreground">{testResults.report}</p>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-border/30 space-y-2">
        <Button onClick={handleRunTest} className="w-full" size="sm">
          테스트 실행
        </Button>
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Download className="w-4 h-4" />
          다운로드
        </Button>
      </div>
    </div>
  )
}
