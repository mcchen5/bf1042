import Anthropic from '@anthropic-ai/sdk'
import type { DesignContext, ExecutionPlan, Phase, Task, Checkpoint } from '../types'

export class PlanGenerator {
  private ai: Anthropic
  private config: any

  constructor(ai: Anthropic, config: any) {
    this.ai = ai
    this.config = config
  }

  async generate(context: DesignContext): Promise<ExecutionPlan> {
    const prompt = this.buildPrompt(context)
    
    const response = await this.ai.messages.create({
      model: this.config.ai.model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.3
    })

    const content = response.content
      .filter((block): block is Extract<typeof response.content[number], { type: 'text' }> => block.type === 'text')
      .map(block => block.text)
      .join('\n')
    
    // 解析 AI 輸出為結構化計畫
    return this.parsePlan(content, context)
  }

  private buildPrompt(context: DesignContext): string {
    return `
你是一個資深的軟體架構師，負責規劃開發任務。

請根據以下設計上下文，生成詳細的執行計畫：

## User Stories
${context.userStories.map(us => `- ${us.id}: ${us.title} (${us.priority})`).join('\n')}

## 技術棧
- 後端: ${context.techStack.backend}
- 前端: ${context.techStack.frontend}
- 資料庫: ${context.techStack.database}
${context.techStack.ai ? `- AI: ${context.techStack.ai}` : ''}

## API 需求
${context.apis.map(api => `- ${api.method} ${api.path}`).join('\n')}

請生成執行計畫，格式為 JSON：

{\n  "summary": {\n    "totalSchemas": 數字,\n    "totalAPIs": 數字,\n    "totalComponents": 數字,\n    "riskLevel": "low" | "medium" | "high"\n  },\n  "phases": [\n    {\n      "id": "phase-1",\n      "name": "Schema 定義",\n      "description": "定義 TypeBox Schema",\n      "tasks": [\n        {\n          "id": "task-1",\n          "type": "schema",\n          "description": "定義 OrderSchema",\n          "targetFile": "packages/api/src/schemas/order.ts",\n          "dependencies": []\n        }\n      ],\n      "estimatedDuration": 10\n    }\n  ],\n  "checkpoints": [\n    {\n      "id": "checkpoint-1",\n      "phase": "phase-2",\n      "condition": { "type": "complex", "threshold": 3 },\n      "message": "API 涉及外部服務，請確認整合細節"\n    }\n  ],\n  "estimatedDuration": 45\n}

注意：
1. 根據 User Stories 拆解任務
2. 確保任務依賴關係正確
3. 識別需要人工確認的檢查點
4. 預估時間要合理
`
  }

  private parsePlan(content: string, context: DesignContext): ExecutionPlan {
    try {
      // 提取 JSON 部分
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('無法從 AI 輸出中提取 JSON')
      }
      
      const planData = JSON.parse(jsonMatch[0])
      
      // 驗證和補充預設值
      return {
        version: '1.0',
        summary: {
          totalSchemas: planData.summary?.totalSchemas || context.apis.length,
          totalAPIs: planData.summary?.totalAPIs || context.apis.length,
          totalComponents: planData.summary?.totalComponents || context.userStories.length,
          riskLevel: planData.summary?.riskLevel || 'medium'
        },
        phases: planData.phases.map((phase: any, index: number) => ({
          id: phase.id || `phase-${index + 1}`,
          name: phase.name,
          description: phase.description,
          tasks: phase.tasks.map((task: any, taskIndex: number) => ({
            id: task.id || `task-${index + 1}-${taskIndex + 1}`,
            type: task.type,
            description: task.description,
            targetFile: task.targetFile,
            dependencies: task.dependencies || [],
            metadata: task.metadata || {}
          })),
          estimatedDuration: phase.estimatedDuration || 15,
          dependencies: phase.dependencies || []
        })),
        checkpoints: (planData.checkpoints || []).map((cp: any) => ({
          id: cp.id,
          phase: cp.phase,
          condition: cp.condition,
          message: cp.message,
          autoContinue: cp.autoContinue || false
        })),
        estimatedDuration: planData.estimatedDuration || 60
      }
    } catch (error) {
      // 如果解析失敗，返回預設計畫
      return this.generateDefaultPlan(context)
    }
  }

  private generateDefaultPlan(context: DesignContext): ExecutionPlan {
    // 生成預設計畫
    const phases: Phase[] = [
      {
        id: 'phase-1',
        name: 'Schema 定義',
        description: '定義 TypeBox Schema 和類型',
        tasks: context.apis.map((api, index) => ({
          id: `schema-${index + 1}`,
          type: 'schema',
          description: `定義 ${api.path} 的 Schema`,
          targetFile: `packages/api/src/schemas/${api.path.split('/').pop()}.ts`,
          dependencies: []
        })),
        estimatedDuration: 10,
        dependencies: []
      },
      {
        id: 'phase-2',
        name: '後端 API 開發',
        description: '實作 Elysia 路由和 Service',
        tasks: context.apis.map((api, index) => ({
          id: `backend-${index + 1}`,
          type: 'backend',
          description: `實作 ${api.method} ${api.path}`,
          targetFile: `apps/backend/src/routes/${api.path.split('/').pop()}.ts`,
          dependencies: [`schema-${index + 1}`]
        })),
        estimatedDuration: 25,
        dependencies: ['phase-1']
      },
      {
        id: 'phase-3',
        name: '前端組件開發',
        description: '實作 React 組件和 Hooks',
        tasks: context.userStories.slice(0, 3).map((us, index) => ({
          id: `frontend-${index + 1}`,
          type: 'frontend',
          description: `實作 ${us.title} 的 UI`,
          targetFile: `apps/frontend/src/components/${us.id}.tsx`,
          dependencies: []
        })),
        estimatedDuration: 20,
        dependencies: ['phase-2']
      },
      {
        id: 'phase-4',
        name: '驗證與測試',
        description: '類型檢查、建置驗證、測試執行',
        tasks: [
          {
            id: 'validate-1',
            type: 'validate',
            description: '執行類型檢查和測試',
            targetFile: '',
            dependencies: []
          }
        ],
        estimatedDuration: 10,
        dependencies: ['phase-3']
      }
    ]

    return {
      version: '1.0',
      summary: {
        totalSchemas: context.apis.length,
        totalAPIs: context.apis.length,
        totalComponents: Math.min(context.userStories.length, 3),
        riskLevel: 'medium'
      },
      phases,
      checkpoints: [
        {
          id: 'checkpoint-api',
          phase: 'phase-2',
          condition: { type: 'complex', threshold: 2 },
          message: '即將生成 API，請確認外部服務整合設定',
          autoContinue: false
        }
      ],
      estimatedDuration: 65
    }
  }
}
