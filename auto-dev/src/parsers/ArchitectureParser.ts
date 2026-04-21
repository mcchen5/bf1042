import { readFile } from 'fs/promises'

export interface Architecture {
  techStack: {
    backend: string
    frontend: string
    database: string
    ai?: string
  }
  patterns: string[]
  constraints: string[]
}

export class ArchitectureParser {
  static async parse(filePath: string): Promise<Architecture> {
    const content = await readFile(filePath, 'utf-8')
    return this.parseContent(content)
  }

  static parseContent(content: string): Architecture {
    const techStack = this.extractTechStack(content)
    const patterns = this.extractPatterns(content)
    const constraints = this.extractConstraints(content)

    return {
      techStack,
      patterns,
      constraints
    }
  }

  private static extractTechStack(content: string): Architecture['techStack'] {
    const stack: Architecture['techStack'] = {
      backend: 'Elysia + Bun',
      frontend: 'React + Vite',
      database: 'PostgreSQL'
    }

    // 解析技術棧表格或列表
    const backendMatch = content.match(/後端[：:]\s*(.+?)(?:\n|$)/i)
    if (backendMatch) {
      stack.backend = backendMatch[1].trim()
    }

    const frontendMatch = content.match(/前端[：:]\s*(.+?)(?:\n|$)/i)
    if (frontendMatch) {
      stack.frontend = frontendMatch[1].trim()
    }

    const dbMatch = content.match(/(?:資料庫|數據庫)[：:]\s*(.+?)(?:\n|$)/i)
    if (dbMatch) {
      stack.database = dbMatch[1].trim()
    }

    const aiMatch = content.match(/(?:AI|人工智慧)[：:]\s*(.+?)(?:\n|$)/i)
    if (aiMatch) {
      stack.ai = aiMatch[1].trim()
    }

    return stack
  }

  private static extractPatterns(content: string): string[] {
    const patterns: string[] = []
    
    // 解析架構模式
    const patternMatches = content.matchAll(/[-*]\s*(Repository Pattern|MVC|Layered|Microservices|Serverless)/gi)
    for (const match of patternMatches) {
      patterns.push(match[1])
    }

    return patterns
  }

  private static extractConstraints(content: string): string[] {
    const constraints: string[] = []
    
    // 解析限制
    const constraintSection = content.match(/##?\s*(限制|約束|Constraints)[\s\S]*?(?=##?\s*|$)/i)
    if (constraintSection) {
      const matches = constraintSection[0].matchAll(/[-*]\s*(.+?)(?:\n|$)/g)
      for (const match of matches) {
        const constraint = match[1].trim()
        if (constraint && !constraint.startsWith('#')) {
          constraints.push(constraint)
        }
      }
    }

    return constraints
  }
}
