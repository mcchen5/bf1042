import Anthropic from '@anthropic-ai/sdk'
import type { GenerationResult } from '../types'
import { FileWriter } from '../utils/FileWriter'

interface FrontendAgentContext {
  task: any
  designContext: any
  ai: Anthropic
  config: any
}

export class FrontendAgent {
  static async generate(context: FrontendAgentContext): Promise<GenerationResult> {
    const { task, designContext, ai, config } = context
    
    const prompt = this.buildPrompt(task, designContext)
    
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
        .replace(/```tsx?\n?/g, '')
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
你是一個 React + TypeScript 前端開發專家。

任務：${task.description}

技術棧：${designContext.techStack?.frontend || 'React + Vite'}

要求：
1. 使用函數組件和 Hooks
2. 使用 TypeScript（嚴格類型）
3. 使用 TanStack Query 進行資料獲取
4. 包含錯誤處理和 Loading 狀態
5. 可訪問性（ARIA 標籤）

範例格式：
\`\`\`typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

interface Props {
  id: string
}

export function ComponentName({ id }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['key', id],
    queryFn: () => api.api.path.get({ params: { id } })
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
\`\`\`

請直接輸出完整的 TypeScript/React 程式碼，不需要額外解釋。
`
  }

  private static extractDependencies(code: string): string[] {
    const dependencies: string[] = ['react', '@tanstack/react-query']
    
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
