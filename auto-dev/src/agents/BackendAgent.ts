import Anthropic from '@anthropic-ai/sdk'
import type { GenerationResult } from '../types'
import { FileWriter } from '../utils/FileWriter'

interface BackendAgentContext {
  task: any
  designContext: any
  ai: Anthropic
  config: any
}

export class BackendAgent {
  static async generate(context: BackendAgentContext): Promise<GenerationResult> {
    const { task, designContext, ai, config } = context
    
    // 讀取相關的 Schema 檔案
    const schemaCode = await this.readRelatedSchema(task)
    
    const prompt = this.buildPrompt(task, designContext, schemaCode)
    
    try {
      const response = await ai.messages.create({
        model: config.ai.model || 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.3
      })

      let code = response.content
        .filter((block): block is Extract<typeof response.content[number], { type: 'text' }> => block.type === 'text')
        .map(block => block.text)
        .join('\n')
        .replace(/```typescript\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^(typescript|tsx|ts|javascript|js)\s*\n/i, '')
        .trim()

      // 如果沒有包含 export，添加預設匯出
      if (!code.includes('export')) {
        code = `export default ${code}`
      }

      // 寫入檔案
      await FileWriter.write(task.targetFile, code, { backup: true })

      return {
        success: true,
        code,
        dependencies: this.extractDependencies(code),
        estimatedTokens: response.usage?.input_tokens || 0
      }
    } catch (error: any) {
      return {
        success: false,
        code: '',
        error: error.message,
        dependencies: [],
        estimatedTokens: 0
      }
    }
  }

  private static async readRelatedSchema(task: any): Promise<string> {
    // 嘗試讀取相關的 Schema 檔案
    const schemaPath = task.targetFile
      .replace('/routes/', '/schemas/')
      .replace('.ts', '.ts')
    
    try {
      const { readFile } = await import('fs/promises')
      return await readFile(schemaPath, 'utf-8')
    } catch {
      return ''
    }
  }

  private static buildPrompt(task: any, designContext: any, schemaCode: string): string {
    return `
你是一個 Elysia.js 後端開發專家。

任務：${task.description}

技術棧：${designContext.techStack?.backend || 'Elysia + Bun'}

${schemaCode ? `相關 Schema 定義：\n\`\`\`typescript\n${schemaCode}\n\`\`\`` : ''}

要求：
1. 使用 Elysia 定義路由
2. 包含輸入驗證（使用 TypeBox Schema）
3. 包含錯誤處理
4. 包含 JSDoc 註釋
5. 遵循 RESTful 設計原則

範例格式：
\`\`\`typescript
import { Elysia, t } from 'elysia'
import { SomeSchema } from '../schemas/some'

export const someRoutes = new Elysia({ prefix: '/api/some' })
  .get('/', async () => {
    return { data: [] }
  }, {
    response: t.Object({ data: t.Array(SomeSchema) })
  })
  .post('/', async ({ body }) => {
    return { data: body }
  }, {
    body: SomeSchema,
    response: t.Object({ data: SomeSchema })
  })
\`\`\`

請直接輸出完整的 TypeScript 程式碼，不需要額外解釋。
`
  }

  private static extractDependencies(code: string): string[] {
    const dependencies: string[] = ['elysia']
    
    const importMatches = code.matchAll(/from\s+['"]([^'"]+)['"]/g)
    for (const match of importMatches) {
      const dep = match[1]
      if (!dep.startsWith('.') && !dep.startsWith('@/')) {
        dependencies.push(dep)
      }
    }

    return [...new Set(dependencies)]
  }
}
