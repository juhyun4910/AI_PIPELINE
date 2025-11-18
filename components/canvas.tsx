"use client"

import type React from "react"
import { useState, useRef } from "react"
import { X, Plus } from 'lucide-react'

const blockStyles: Record<string, string> = {
  upload: "from-blue-600 to-blue-700",
  preprocess: "from-gray-600 to-gray-700",
  embedding: "from-purple-600 to-purple-700",
  llm: "from-green-600 to-green-700",
  guardrail: "from-red-600 to-red-700",
}
const connectionStyle = "particle"

export function Canvas({
  blocks,
  edges,
  selectedBlock,
  onSelectBlock,
  onAddBlock,
  onDeleteBlock,
  onConnect,
  onUpdateBlockPosition,
}: {
  blocks: any[]
  edges: any[]
  selectedBlock: string | null
  onSelectBlock: (id: string) => void
  onAddBlock: (block: any) => void
  onDeleteBlock: (id: string) => void
  onConnect: (source: string, target: string) => void
  onUpdateBlockPosition: (id: string, x: number, y: number) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [connecting, setConnecting] = useState<{ sourceId: string; x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState<{
    id: string
    startX: number
    startY: number
    initialX: number
    initialY: number
  } | null>(null)

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (connecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setConnecting({
        sourceId: connecting.sourceId,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    if (dragging && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const currentX = e.clientX - rect.left
      const currentY = e.clientY - rect.top
      const deltaX = currentX - dragging.startX
      const deltaY = currentY - dragging.startY
      const newX = Math.max(0, dragging.initialX + deltaX)
      const newY = Math.max(0, dragging.initialY + deltaY)
      onUpdateBlockPosition(dragging.id, newX, newY)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    if (canvasRef.current) {
      canvasRef.current.style.backgroundColor = "rgba(59, 130, 246, 0.05)"
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.target === canvasRef.current) {
      if (canvasRef.current) {
        canvasRef.current.style.backgroundColor = ""
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (canvasRef.current) {
      canvasRef.current.style.backgroundColor = ""
    }

    const data = e.dataTransfer.getData("application/json")
    if (data && canvasRef.current) {
      try {
        const blockData = JSON.parse(data)
        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const newBlock = {
          id: Date.now().toString(),
          subblockId: blockData.id, // 서브블록 ID 별도 저장 (file-upload, normalization 등)
          name: blockData.name,
          description: blockData.description,
          icon: blockData.icon,
          blockType: blockData.blockType,
          modelName: blockData.modelName,
          settings: blockData.settings,
          x: Math.max(0, x - 75),
          y: Math.max(0, y - 50),
        }

        onAddBlock(newBlock)
      } catch (error) {
        console.log("[v0] Error parsing dropped block:", error)
      }
    }
  }

  const handleConnectStart = (blockId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setConnecting({
        sourceId: blockId,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleConnectEnd = (targetId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (connecting && connecting.sourceId !== targetId) {
      onConnect(connecting.sourceId, targetId)
    }
    setConnecting(null)
  }

  const handleCanvasMouseUp = () => {
    setConnecting(null)
    setDragging(null)
  }

  const handleBlockMouseDown = (blockId: string, e: React.MouseEvent) => {
    // 버튼 클릭이 아닐 때만 드래그 시작
    if ((e.target as HTMLElement).closest("button")) {
      return
    }
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const block = blocks.find((b) => b.id === blockId)
      if (block) {
        setDragging({
          id: blockId,
          startX: e.clientX - rect.left,
          startY: e.clientY - rect.top,
          initialX: block.x || 0,
          initialY: block.y || 0,
        })
      }
    }
  }

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-gradient-to-br from-slate-900/50 to-slate-800/50 overflow-auto transition-colors"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {edges.map((edge, idx) => {
          const source = blocks.find((b) => b.id === edge.source)
          const target = blocks.find((b) => b.id === edge.target)
          if (!source || !target) return null

          const x1 = (source.x || 0) + 75
          const y1 = (source.y || 0) + 50
          const x2 = (target.x || 0) + 75
          const y2 = (target.y || 0) + 50
          const from = { x: x1, y: y1 }
          const to = { x: x2, y: y2 }
          const midX = (from.x + to.x) / 2
          const midY = (from.y + to.y) / 2
          const leftToRight = from.x <= to.x
          const startPoint = leftToRight ? from : to
          const endPoint = leftToRight ? to : from
          const particleMidX = (startPoint.x + endPoint.x) / 2
          const particleMidY = (startPoint.y + endPoint.y) / 2 - 50
          const particlePath = `M ${startPoint.x} ${startPoint.y} Q ${particleMidX} ${particleMidY} ${endPoint.x} ${endPoint.y}`
          const defaultPath = `M ${from.x} ${from.y} Q ${midX} ${midY - 30} ${to.x} ${to.y}`

          return (
            <g key={idx}>
              {connectionStyle === "particle" ? (
                <>
                  <path
                    d={particlePath}
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5 5"
                  />
                  <circle r="4" fill="#3b82f6" filter="url(#glow)">
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={particlePath}
                    />
                  </circle>
                  <circle r="3" fill="#8b5cf6" filter="url(#glow)">
                    <animateMotion
                      dur="2.5s"
                      repeatCount="indefinite"
                      begin="0.5s"
                      path={particlePath}
                    />
                  </circle>
                </>
              ) : (
                <>
                  <path
                    d={defaultPath}
                    className="stroke-primary/60 stroke-2 fill-none"
                  />
                  <circle cx={x2} cy={y2} r="5" className="fill-primary/60" />
                </>
              )}
            </g>
          )
        })}

        {connecting && (
          <g>
            <line
              x1={(blocks.find((b) => b.id === connecting.sourceId)?.x || 0) + 75}
              y1={(blocks.find((b) => b.id === connecting.sourceId)?.y || 0) + 50}
              x2={connecting.x}
              y2={connecting.y}
              className="stroke-primary/50 stroke-2"
              strokeDasharray="5,5"
            />
            <circle cx={connecting.x} cy={connecting.y} r="4" className="fill-primary/50" />
          </g>
        )}
      </svg>

      {blocks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Plus className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">왼쪽에서 블록을 드래그해서 시작하세요</p>
            <p className="text-muted-foreground text-sm mt-2">블록을 마우스로 끌어 선을 그어 연결하세요</p>
          </div>
        </div>
      )}

      {blocks.map((block) => (
        <div
          key={block.id}
          className="absolute group"
          style={{
            left: `${block.x || 0}px`,
            top: `${block.y || 0}px`,
            cursor: dragging?.id === block.id ? "grabbing" : "grab",
          }}
          onMouseDown={(e) => handleBlockMouseDown(block.id, e)}
        >
          <div
            onClick={() => onSelectBlock(block.id)}
            className={`
              w-44 p-4 rounded-lg cursor-pointer transition-all duration-200
              bg-gradient-to-br ${blockStyles[block.blockType] || blockStyles.upload}
              ${selectedBlock === block.id ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/50" : "shadow-lg"}
              hover:shadow-xl hover:scale-105
              select-none
            `}
          >
            <div className="flex items-center gap-2 pointer-events-none">
              <span className="text-2xl">{block.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">{block.name}</div>
                <div className="text-xs text-white/80">{block.description}</div>
              </div>
            </div>

            {block.modelName && (
              <div className="text-xs text-white/60 mt-2 font-mono border-t border-white/10 pt-2">
                {block.modelName}
              </div>
            )}

            <div className="flex gap-2 mt-3 pt-3 border-t border-white/20">
              <button
                onMouseDown={(e) => handleConnectStart(block.id, e)}
                onMouseUp={(e) => handleConnectEnd(block.id, e)}
                className={`flex-1 px-2 py-1 text-xs rounded transition-colors pointer-events-auto ${
                  connecting?.sourceId === block.id
                    ? "bg-yellow-400 text-black font-semibold"
                    : "bg-white/20 hover:bg-white/30 text-white"
                }`}
                title="클릭하고 다른 블록으로 끌어서 연결하세요"
              >
                ○
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteBlock(block.id)
                }}
                className="px-2 py-1 text-xs rounded bg-red-500/30 hover:bg-red-500/50 text-white transition-colors pointer-events-auto"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
