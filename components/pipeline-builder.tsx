"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BlockPalette } from "@/components/block-palette"
import { Canvas } from "@/components/canvas"
import { PropertyPanel } from "@/components/property-panel"
import { TestPanel } from "@/components/test-panel"
import { Save, Play, Share2, ArrowLeft, RotateCcw, X } from 'lucide-react'

export function PipelineBuilder({
  pipeline,
  onBack,
  onSave,
}: {
  pipeline: any
  onBack: () => void
  onSave: (pipeline: any) => void
}) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [blocks, setBlocks] = useState<any[]>(
    pipeline.blocks?.map((b: any) => ({
      ...b,
      id: Date.now().toString() + Math.random(),
    })) || []
  )
  const [edges, setEdges] = useState<any[]>(pipeline.edges || [])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showTestPanel, setShowTestPanel] = useState(false)
  const [pipelineName, setPipelineName] = useState(pipeline.name || "")

  const handleAddBlock = (block: any) => {
    setBlocks([...blocks, block])
  }

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id))
    if (selectedBlock === id) {
      setSelectedBlock(null)
    }
    setEdges(edges.filter((e) => e.source !== id && e.target !== id))
  }

  const handleConnect = (source: string, target: string) => {
    if (!edges.some((e) => e.source === source && e.target === target)) {
      setEdges([...edges, { source, target }])
    }
  }

  const handleUpdateBlockPosition = (id: string, x: number, y: number) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, x, y } : b)))
  }

  const handleReset = () => {
    if (confirm("파이프라인을 초기화하시겠습니까? 모든 블록이 제거됩니다.")) {
      setBlocks([])
      setEdges([])
      setSelectedBlock(null)
    }
  }

  const getSelectedBlockData = () => {
    return blocks.find((b) => b.id === selectedBlock)
  }

  const handleSavePipeline = () => {
    setShowSaveDialog(true)
  }

  const handleConfirmSave = () => {
    if (pipelineName.trim()) {
      onSave({
        name: pipelineName,
        blocks,
        edges,
        description: pipeline.description || "저장된 파이프라인",
      })
      setShowSaveDialog(false)
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* 상단 도구모음 */}
      <div className="border-b border-border/50 backdrop-blur-sm bg-background/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
          <h2 className="text-xl font-semibold">{pipelineName || pipeline.name}</h2>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
            초기화
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleSavePipeline}>
            <Save className="w-4 h-4" />
            저장
          </Button>
          <Button
            size="sm"
            className={"gap-2 " + (showTestPanel
              ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700")}
            onClick={() => setShowTestPanel(!showTestPanel)}
          >
            <Play className="w-4 h-4" />
            {showTestPanel ? "테스트 닫기" : "테스트 실행"}
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Share2 className="w-4 h-4" />
            공유
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 팔레트 */}
        <BlockPalette onAddBlock={handleAddBlock} />

        {/* 중앙 캔버스 */}
        <div className="flex-1 overflow-auto">
          <Canvas
            blocks={blocks}
            edges={edges}
            selectedBlock={selectedBlock}
            onSelectBlock={setSelectedBlock}
            onAddBlock={handleAddBlock}
            onDeleteBlock={handleDeleteBlock}
            onConnect={handleConnect}
            onUpdateBlockPosition={handleUpdateBlockPosition}
          />
        </div>

        {/* 우측 속성 패널 */}
        {selectedBlock && <PropertyPanel block={getSelectedBlockData()} />}

        {/* 테스트 패널 */}
        {showTestPanel && (
          <TestPanel
            pipeline={pipeline}
            blocks={blocks}
            edges={edges}
          />
        )}
      </div>

      {/* 하단 상태바 */}
      <div className="border-t border-border/50 backdrop-blur-sm bg-background/50 px-6 py-3 text-xs text-muted-foreground">
        파이프라인 준비 완료 • {blocks.length}개 블록 {edges.length > 0 && "• " + edges.length + "개 연결됨"}
      </div>

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">파이프라인 저장</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">파이프라인 이름</label>
                <input
                  type="text"
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  placeholder="파이프라인 이름을 입력하세요"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleConfirmSave()
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  className="bg-transparent"
                >
                  취소
                </Button>
                <Button
                  onClick={handleConfirmSave}
                  disabled={!pipelineName.trim()}
                  className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30"
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
