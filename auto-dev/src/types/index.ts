// 核心類型定義

export interface AutoDevConfig {
  projectPath: string
  designPath: string
  outputPath: string
  ai: AIConfig
  checkpoints: CheckpointConfig[]
  deploy?: DeployConfig
}

export interface UserAutoDevConfig extends Partial<Omit<AutoDevConfig, 'ai' | 'deploy'>> {
  ai?: Partial<AIConfig>
  deploy?: Partial<DeployConfig>
}

export interface AIConfig {
  provider: 'anthropic' | 'openai' | 'kimi'
  model: string
  apiKey?: string
  maxTokens?: number
  temperature?: number
}

export interface CheckpointConfig {
  id: string
  phase: string
  condition: 'always' | 'complex' | 'breaking-change'
  message: string
}

export interface DeployConfig {
  platform: 'flyio' | 'railway' | 'vercel'
  staging?: boolean
  autoRollback?: boolean
}

// 設計文件類型

export interface DesignContext {
  userStories: UserStory[]
  architecture: Architecture
  techStack: TechStack
  apis: APIEndpoint[]
  personas: Persona[]
}

export interface UserStory {
  id: string
  title: string
  role: string
  want: string
  soThat: string
  acceptanceCriteria: string[]
  priority: 'P0' | 'P1' | 'P2'
  epic?: string
}

export interface Architecture {
  techStack: TechStack
  patterns: string[]
  constraints: string[]
}

export interface TechStack {
  backend: string
  frontend: string
  database: string
  ai?: string
}

export interface APIEndpoint {
  method: string
  path: string
  description: string
  requestSchema?: string
  responseSchema?: string
}

export interface Persona {
  name: string
  age: number
  occupation: string
  goals: string[]
  painPoints: string[]
}

// 執行計畫類型

export interface ExecutionPlan {
  version: string
  summary: PlanSummary
  phases: Phase[]
  checkpoints: Checkpoint[]
  estimatedDuration: number // minutes
}

export interface PlanSummary {
  totalSchemas: number
  totalAPIs: number
  totalComponents: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface Phase {
  id: string
  name: string
  description: string
  tasks: Task[]
  estimatedDuration: number
  dependencies: string[]
}

export interface Task {
  id: string
  type: 'schema' | 'backend' | 'frontend' | 'test' | 'deploy' | 'validate'
  description: string
  targetFile: string
  dependencies: string[]
  metadata?: Record<string, unknown>
}

export interface Checkpoint {
  id: string
  phase: string
  condition: CheckpointCondition
  message: string
  autoContinue?: boolean
}

export type CheckpointCondition = 
  | { type: 'always' }
  | { type: 'complex'; threshold: number }
  | { type: 'breaking-change' }
  | { type: 'cost'; maxCost: number }

// 驗證類型

export interface ValidationResult {
  success: boolean
  phase: string
  checks: CheckResult[]
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface CheckResult {
  name: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  message?: string
}

export interface ValidationError {
  type: 'typecheck' | 'build' | 'test' | 'lint'
  file?: string
  line?: number
  message: string
  code?: string
}

export interface ValidationWarning {
  type: string
  message: string
  suggestion?: string
}

// AI 生成類型

export interface GenerationContext {
  task: Task
  designContext: DesignContext
  existingCode?: string
  previousAttempts?: string[]
}

export interface GenerationResult {
  success: boolean
  code: string
  explanation?: string
  error?: string
  dependencies: string[]
  estimatedTokens: number
}

// 日誌與監控

export interface ExecutionLog {
  id: string
  timestamp: Date
  plan: ExecutionPlan
  results: PhaseResult[]
  status: 'running' | 'completed' | 'failed' | 'paused'
}

export interface PhaseResult {
  phaseId: string
  status: 'success' | 'failed' | 'skipped'
  tasks: TaskResult[]
  startedAt: Date
  completedAt?: Date
  duration?: number
}

export interface TaskResult {
  taskId: string
  status: 'success' | 'failed' | 'skipped'
  output?: string
  error?: string
  duration: number
}
