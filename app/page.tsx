"use client"

import { useState } from "react"
import { Dashboard } from "@/components/dashboard"
import { PipelineBuilder } from "@/components/pipeline-builder"
import { PipelineLibrary } from "@/components/pipeline-library"
import { PipelineRunner } from "@/components/pipeline-runner"
import { PipelineDeployer } from "@/components/pipeline-deployer"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function Home() {
  const [view, setView] = useState<"dashboard" | "builder" | "library" | "runner" | "deployer">("dashboard")
  const [pipeline, setPipeline] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [savedPipelines, setSavedPipelines] = useState<any[]>([])

  const handleLogin = (name: string) => {
    setIsLoggedIn(true)
    setUserName(name)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserName("")
    setView("dashboard")
  }

  const handleSavePipeline = (pipelineData: any) => {
    const newPipeline = {
      id: Date.now().toString(),
      ...pipelineData,
      createdAt: new Date().toISOString(),
      author: userName,
    }
    setSavedPipelines([...savedPipelines, newPipeline])
    setPipeline(newPipeline)
  }

  const handleDeletePipeline = (id: string) => {
    setSavedPipelines(savedPipelines.filter((p) => p.id !== id))
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-center mb-2">AI 파이프라인</h1>
            <p className="text-muted-foreground text-center mb-8">빌더에 로그인하세요</p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="사용자명"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value) {
                    handleLogin(e.currentTarget.value)
                  }
                }}
                id="username-input"
              />
              <Button
                onClick={() => {
                  const input = document.getElementById("username-input") as HTMLInputElement
                  if (input.value) {
                    handleLogin(input.value)
                  }
                }}
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30"
              >
                로그인
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/30 bg-background/50 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          로그인됨: <span className="font-semibold text-foreground">{userName}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </Button>
      </div>

      {view === "dashboard" ? (
        <Dashboard
          onCreatePipeline={(pipe) => {
            setPipeline(pipe)
            setView("builder")
          }}
          savedPipelinesCount={savedPipelines.length}
          onViewLibrary={() => setView("library")}
          savedPipelines={savedPipelines}
          onRunPipeline={(pipe) => {
            setPipeline(pipe)
            setView("runner")
          }}
          onEditPipeline={(pipe) => {
            setPipeline(pipe)
            setView("builder")
          }}
          onDeletePipeline={handleDeletePipeline}
        />
      ) : view === "builder" ? (
        <div className="h-[calc(100vh-57px)]">
          <PipelineBuilder
            pipeline={pipeline}
            onBack={() => setView("dashboard")}
            onSave={handleSavePipeline}
          />
        </div>
      ) : view === "library" ? (
        <PipelineLibrary
          pipelines={savedPipelines}
          onBack={() => setView("dashboard")}
          onRun={(pipe) => {
            setPipeline(pipe)
            setView("runner")
          }}
          onDeploy={(pipe) => {
            setPipeline(pipe)
            setView("deployer")
          }}
          onDelete={handleDeletePipeline}
        />
      ) : view === "runner" ? (
        <PipelineRunner pipeline={pipeline} onBack={() => setView("dashboard")} />
      ) : view === "deployer" ? (
        <PipelineDeployer pipeline={pipeline} onBack={() => setView("dashboard")} />
      ) : null}
    </div>
  )
}
