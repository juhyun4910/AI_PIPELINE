"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Copy, Check, Rocket, Globe, Lock } from "lucide-react"

export function PipelineDeployer({
  pipeline,
  onBack,
}: {
  pipeline: any
  onBack: () => void
}) {
  const [isDeployed, setIsDeployed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deploymentUrl] = useState(`https://api.ai-pipeline.io/v1/${pipeline.id}`)
  const [apiKey] = useState(`sk_${Math.random().toString(36).substr(2, 20).toUpperCase()}`)

  const handleDeploy = () => {
    setIsDeployed(true)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold">{pipeline.name} 배포</h1>
        </div>

        {!isDeployed ? (
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
              <div className="flex gap-4 items-start">
                <Rocket className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-2">파이프라인 배포</h2>
                  <p className="text-muted-foreground mb-6">
                    이 파이프라인을 배포하면 REST API로 접근 가능하게 됩니다. 배포된 파이프라인은 공개 또는 비공개로
                    설정할 수 있습니다.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-background/50">
                      <div className="text-xs text-muted-foreground mb-1">배포 환경</div>
                      <div className="font-semibold">프로덕션</div>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50">
                      <div className="text-xs text-muted-foreground mb-1">블록 수</div>
                      <div className="font-semibold">{pipeline.blocks?.length || 0}개</div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30"
                    onClick={handleDeploy}
                  >
                    <Rocket className="w-5 h-5" />
                    지금 배포
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">배포 옵션</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 rounded-lg border border-border/50 cursor-pointer hover:bg-card/50 transition-colors">
                  <input type="radio" name="visibility" defaultChecked className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      공개 (Public)
                    </div>
                    <p className="text-xs text-muted-foreground">누구나 접근 가능</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-lg border border-border/50 cursor-pointer hover:bg-card/50 transition-colors">
                  <input type="radio" name="visibility" className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      비공개 (Private)
                    </div>
                    <p className="text-xs text-muted-foreground">API 키를 사용한 인증 필요</p>
                  </div>
                </label>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8">
            <div className="flex gap-4 mb-8">
              <Check className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-2">배포 완료!</h2>
                <p className="text-muted-foreground">파이프라인이 성공적으로 배포되었습니다.</p>
              </div>
            </div>

            <Tabs defaultValue="api" className="mb-8">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="api">API 엔드포인트</TabsTrigger>
                <TabsTrigger value="usage">사용 방법</TabsTrigger>
              </TabsList>

              <TabsContent value="api" className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={deploymentUrl}
                      readOnly
                      className="flex-1 p-3 rounded-lg bg-input border border-border text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => handleCopy(deploymentUrl)}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          복사
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={apiKey}
                      readOnly
                      className="flex-1 p-3 rounded-lg bg-input border border-border text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => handleCopy(apiKey)}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          복사
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="usage" className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium mb-2">cURL 예제</h4>
                  <pre className="p-4 rounded-lg bg-background/50 border border-border/50 text-xs overflow-x-auto">
                    {`curl -X POST ${deploymentUrl} \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "질문을 입력하세요"}'`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">JavaScript 예제</h4>
                  <pre className="p-4 rounded-lg bg-background/50 border border-border/50 text-xs overflow-x-auto">
                    {`const response = await fetch('${deploymentUrl}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ input: '질문' })
});`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>

            <Button variant="outline" className="w-full bg-transparent" onClick={onBack}>
              돌아가기
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
