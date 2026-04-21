import { readFile } from 'fs/promises'
import type { UserStory, Persona } from '../types'

export class UserStoryParser {
  static async parse(filePath: string): Promise<UserStory[]> {
    const content = await readFile(filePath, 'utf-8')
    return this.parseContent(content)
  }

  static parseContent(content: string): UserStory[] {
    const stories: UserStory[] = []
    
    // 使用正則表達式解析 Markdown
    // 格式：### US-XXX: 標題
    const storyRegex = /###\s+(US-\d+):\s*(.+?)\n\s*\*\*身為\*\*\s*(.+?)\n\s*\*\*我想要\*\*\s*(.+?)\n\s*\*\*如此\*\*\s*(.+?)(?=###|##|$)/gs
    
    let match
    while ((match = storyRegex.exec(content)) !== null) {
      const [_, id, title, role, want, soThat] = match
      
      // 提取驗收標準
      const acceptanceMatch = content.slice(match.index).match(
        /\*\*驗收標準\*\*:\s*\n((?:- \[.\].*\n)+)/
      )
      const acceptanceCriteria: string[] = []
      if (acceptanceMatch) {
        const criteriaText = acceptanceMatch[1]
        const criteriaRegex = /- \[[ x]\]\s*(.+)/g
        let criteriaMatch
        while ((criteriaMatch = criteriaRegex.exec(criteriaText)) !== null) {
          acceptanceCriteria.push(criteriaMatch[1].trim())
        }
      }

      // 提取優先級
      const priorityMatch = content.slice(match.index).match(/\*\*優先級\*\*:\s*(P\d)/)
      const priority = (priorityMatch?.[1] as 'P0' | 'P1' | 'P2') || 'P2'

      // 提取 Epic
      const epicMatch = content.slice(match.index).match(/\*\*對應 Epic\*\*:\s*(.+?)\n/)
      const epic = epicMatch?.[1].trim()

      stories.push({
        id: id.trim(),
        title: title.trim(),
        role: role.trim(),
        want: want.trim(),
        soThat: soThat.trim(),
        acceptanceCriteria,
        priority,
        epic
      })
    }

    // 如果正則沒有匹配到，使用簡化解析
    if (stories.length === 0) {
      return this.parseSimpleFormat(content)
    }

    return stories
  }

  private static parseSimpleFormat(content: string): UserStory[] {
    const stories: UserStory[] = []
    const lines = content.split('\n')
    
    let currentStory: Partial<UserStory> = {}
    let lineIndex = 0
    
    while (lineIndex < lines.length) {
      const line = lines[lineIndex].trim()
      
      // 檢測 User Story 標題
      if (line.match(/^#{1,4}\s+(US-\d+|\d+)[\.:\s]/i)) {
        if (currentStory.id) {
          stories.push(currentStory as UserStory)
        }
        
        const titleMatch = line.match(/^#{1,4}\s+(?:US-)?(\d+)[\.:\s]*(.*)/i)
        currentStory = {
          id: `US-${titleMatch?.[1] || stories.length + 1}`,
          title: titleMatch?.[2] || line,
          acceptanceCriteria: [],
          priority: 'P2'
        }
      }
      // 檢測角色
      else if (line.match(/^(身為|As a)/i)) {
        currentStory.role = line.replace(/^身為|As a/i, '').trim()
      }
      // 檢測需求
      else if (line.match(/^(我想要|I want)/i)) {
        currentStory.want = line.replace(/^我想要|I want/i, '').trim()
      }
      // 檢測價值
      else if (line.match(/^(如此|So that)/i)) {
        currentStory.soThat = line.replace(/^如此|So that/i, '').trim()
      }
      // 檢測驗收標準
      else if (line.startsWith('- [') || line.startsWith('* [')) {
        const criteria = line.replace(/^[-*]\s*\[[ x]\]\s*/, '').trim()
        if (currentStory.acceptanceCriteria) {
          currentStory.acceptanceCriteria.push(criteria)
        }
      }
      
      lineIndex++
    }
    
    // 添加最後一個 story
    if (currentStory.id) {
      stories.push(currentStory as UserStory)
    }
    
    return stories
  }

  static async parsePersonas(filePath: string): Promise<Persona[]> {
    try {
      const content = await readFile(filePath, 'utf-8')
      return this.parsePersonasContent(content)
    } catch {
      return []
    }
  }

  private static parsePersonasContent(content: string): Persona[] {
    const personas: Persona[] = []
    
    // 簡化的 persona 解析
    const sections = content.split(/^#{2,3}\s+/m)
    
    for (const section of sections) {
      const nameMatch = section.match(/^(主要人物誌|次要人物誌)?\s*[:：]\s*(.+?)[（(]/)
      if (nameMatch) {
        const name = nameMatch[2].trim()
        
        // 提取年齡
        const ageMatch = section.match(/年[齡龄][:：]\s*(\d+)/)
        const age = ageMatch ? parseInt(ageMatch[1]) : 30
        
        // 提取職業
        const occupationMatch = section.match(/職[業业][:：]\s*(.+)/)
        const occupation = occupationMatch?.[1].trim() || 'Unknown'
        
        // 提取目標
        const goals: string[] = []
        const goalsMatch = section.match(/目[標标][：:]\s*\n((?:- .+\n)+)/)
        if (goalsMatch) {
          const goalLines = goalsMatch[1].split('\n')
          for (const line of goalLines) {
            const goal = line.replace(/^-\s*/, '').trim()
            if (goal) goals.push(goal)
          }
        }
        
        // 提取痛點
        const painPoints: string[] = []
        const painMatch = section.match(/痛[點点][：:]\s*\n((?:- .+\n)+)/)
        if (painMatch) {
          const painLines = painMatch[1].split('\n')
          for (const line of painLines) {
            const pain = line.replace(/^-\s*/, '').trim()
            if (pain) painPoints.push(pain)
          }
        }
        
        personas.push({
          name,
          age,
          occupation,
          goals: goals.length > 0 ? goals : ['未指定'],
          painPoints: painPoints.length > 0 ? painPoints : ['未指定']
        })
      }
    }
    
    return personas
  }
}
