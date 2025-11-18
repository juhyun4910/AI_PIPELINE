"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Play, Rocket, Trash2, Clock, User } from "lucide-react"

export function PipelineLibrary({
  pipelines,
  onBack,
  onRun,
  onDeploy,
  onDelete,
}: {
  pipelines: any[]
  onBack: () => void
  onRun: (pipeline: any) => void
  onDeploy: (pipeline: any) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold">내 파이프라인</h1>
        </div>

        {pipelines.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            <p className="mb-4">아직 저장된 파이프라인이 없습니다</p>
            <Button onClick={onBack}>새 파이프라인 만들기</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pipelines.map((pipeline) => (
              <Card
                key={pipeline.id}
                className="p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{pipeline.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{pipeline.description}</p>
                    <div className="flex gap-6 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {pipeline.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(pipeline.createdAt).toLocaleDateString("ko-KR")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-border/30">
                  <Button
                    size="sm"
                    className="gap-2 flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => onRun(pipeline)}
                  >
                    <Play className="w-4 h-4" />
                    실행
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 flex-1 bg-transparent"
                    onClick={() => onDeploy(pipeline)}
                  >
                    <Rocket className="w-4 h-4" />
                    배포
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 bg-transparent text-destructive hover:text-destructive"
                    onClick={() => onDelete(pipeline.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
