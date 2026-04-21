import Anthropic from '@anthropic-ai/sdk'
import type { GenerationContext, GenerationResult } from '../types'
import { FileWriter } from '../utils/FileWriter'

interface SchemaAgentContext {
  task: any
  designContext: any
  ai: Anthropic
  config: any
}

export class SchemaAgent {
  static async generate(context: SchemaAgentContext): Promise<GenerationResult> {
    const { task, designContext, ai, config } = context
    
    const prompt = this.buildPrompt(task, designContext)
    
    try {
      const response = await ai.messages.create({
        model: config.ai.model || 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.2
      })

      const code = response.content
        .filter((block): block is Extract<typeof response.content[number], { type: 'text' }> => block.type === 'text')
        .map(block => block.text)
        .join('\n')
        .replace(/```typescript\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^(typescript|tsx|ts|javascript|js)\s*\n/i, '')
        .trim()

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

  private static buildPrompt(task: any, designContext: any): string {
    return `
你是一個 TypeBox Schema 專家。

任務：${task.description}

要求：
1. 使用 Elysia 的 t 物件定義 Schema
2. 每個欄位必須有 description 說明
3. 匯出 static 類型
4. 使用 additionalProperties: false（嚴格模式）
5. 遵循 TypeBox 最佳實踐

範例格式：
\`\`\`typescript
import { t } from 'elysia'

export const UserSchema = t.Object({
  id: t.Number({ description: '唯一識別碼' }),
  name: t.String({ minLength: 1, description: '使用者名稱' }),
  email: t.String({ format: 'email', description: '電子郵件' })
}, {
  description: '使用者資料',
  additionalProperties: false
})

export type User = typeof UserSchema.static
\`\`\`

相關 User Stories：
${designContext.userStories?.map((us: any) => `- ${us.id}: ${us.title}`).join('\n') || '無'}

請直接輸出完整的 TypeScript 程式碼，不需要額外解釋。
`
  }

  private static extractDependencies(code: string): string[] {
    const dependencies: string[] = []
    
    // 提取 import 語句
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
