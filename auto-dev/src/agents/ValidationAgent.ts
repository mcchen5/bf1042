import { $ } from 'bun'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { join } from 'path'
import type { ValidationResult, ValidationError } from '../types'

export class ValidationAgent {
  static async validate(config: any): Promise<ValidationResult> {
    const checks = []
    const errors: ValidationError[] = []
    const warnings = []

    // 1. TypeScript 類型檢查
    console.log('   🔍 TypeScript 類型檢查...')
    const typeCheck = await this.runTypeCheck(config)
    checks.push(typeCheck)
    if (typeCheck.status !== 'passed') {
      errors.push(...typeCheck.errors)
    }

    // 2. 建置驗證
    console.log('   🔨 建置驗證...')
    const buildCheck = await this.runBuildCheck(config)
    checks.push(buildCheck)
    if (buildCheck.status !== 'passed') {
      errors.push(...buildCheck.errors)
    }

    // 3. Lint 檢查（如果有配置）
    console.log('   📏 Lint 檢查...')
    const lintCheck = await this.runLintCheck(config)
    checks.push(lintCheck)
    if (lintCheck.status === 'failed') {
      warnings.push(...lintCheck.errors)
    }

    return {
      success: errors.length === 0,
      phase: 'validation',
      checks,
      errors,
      warnings
    }
  }

  private static async runTypeCheck(config: any): Promise<any> {
    const startTime = Date.now()
    const projects = await this.getValidationProjects()
    const runnableProjects = projects.filter(project => project.ready && project.canTypecheck)

    if (runnableProjects.length === 0) {
      return {
        name: 'TypeScript Type Check',
        status: 'skipped',
        duration: (Date.now() - startTime) / 1000,
        errors: [],
        message: '未找到已安裝依賴且可執行 TypeScript 檢查的專案'
      }
    }
    
    try {
      for (const project of runnableProjects) {
        if (project.scripts.has('typecheck')) {
          await $`bun run typecheck`.cwd(project.path).quiet()
        } else {
          await $`bun run tsc --noEmit`.cwd(project.path).quiet()
        }
      }

      return {
        name: 'TypeScript Type Check',
        status: 'passed',
        duration: (Date.now() - startTime) / 1000,
        errors: []
      }
    } catch (error: any) {
      // 解析錯誤訊息
      const errors = this.parseTypeScriptErrors(error.message)
      
      return {
        name: 'TypeScript Type Check',
        status: 'failed',
        duration: (Date.now() - startTime) / 1000,
        errors,
        message: `發現 ${errors.length} 個類型錯誤`
      }
    }
  }

  private static async runBuildCheck(config: any): Promise<any> {
    const startTime = Date.now()
    const projects = await this.getValidationProjects()
    const buildProjects = projects.filter(project => project.ready && project.scripts.has('build'))

    if (buildProjects.length === 0) {
      return {
        name: 'Build Check',
        status: 'skipped',
        duration: (Date.now() - startTime) / 1000,
        errors: [],
        message: '未找到已安裝依賴且可執行 build 的專案'
      }
    }
    
    try {
      for (const project of buildProjects) {
        await $`bun run build`.cwd(project.path).quiet()
      }

      return {
        name: 'Build Check',
        status: 'passed',
        duration: (Date.now() - startTime) / 1000,
        errors: []
      }
    } catch (error: any) {
      return {
        name: 'Build Check',
        status: 'failed',
        duration: (Date.now() - startTime) / 1000,
        errors: [{
          type: 'build',
          message: error.message
        }],
        message: '建置失敗'
      }
    }
  }

  private static async runLintCheck(config: any): Promise<any> {
    const startTime = Date.now()
    const projects = await this.getValidationProjects()
    const lintProjects = projects.filter(project => project.ready && project.scripts.has('lint'))

    if (lintProjects.length === 0) {
      return {
        name: 'Lint Check',
        status: 'skipped',
        duration: (Date.now() - startTime) / 1000,
        errors: [],
        message: '未找到已安裝依賴且可執行 lint 的專案'
      }
    }
    
    try {
      for (const project of lintProjects) {
        await $`bun run lint`.cwd(project.path).quiet()
      }
      
      return {
        name: 'Lint Check',
        status: 'passed',
        duration: (Date.now() - startTime) / 1000,
        errors: []
      }
    } catch {
      // Lint 失敗不阻止流程，只作為警告
      return {
        name: 'Lint Check',
        status: 'skipped',
        duration: (Date.now() - startTime) / 1000,
        errors: []
      }
    }
  }

  private static parseTypeScriptErrors(message: string): ValidationError[] {
    const errors: ValidationError[] = []
    
    // TypeScript 錯誤格式：file.ts(line,col): error TSxxxx: message
    const regex = /(.+?)\((\d+),(\d+)\):\s*error\s*(TS\d+):\s*(.+)/g
    let match
    
    while ((match = regex.exec(message)) !== null) {
      errors.push({
        type: 'typecheck',
        file: match[1],
        line: parseInt(match[2]),
        code: match[4],
        message: match[5]
      })
    }

    return errors
  }

  private static async getValidationProjects(): Promise<Array<{
    path: string
    scripts: Set<string>
    canTypecheck: boolean
    ready: boolean
  }>> {
    const candidates = ['apps/backend', 'apps/frontend', 'packages/api']
    const projects: Array<{
      path: string
      scripts: Set<string>
      canTypecheck: boolean
      ready: boolean
    }> = []

    for (const candidate of candidates) {
      const packageJsonPath = join(candidate, 'package.json')
      const tsconfigPath = join(candidate, 'tsconfig.json')

      if (!existsSync(candidate) || !existsSync(packageJsonPath)) {
        continue
      }

      try {
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'))
        const scripts = new Set<string>(Object.keys(packageJson.scripts || {}))

        projects.push({
          path: candidate,
          scripts,
          canTypecheck: scripts.has('typecheck') || existsSync(tsconfigPath),
          ready: existsSync(join(candidate, 'node_modules'))
        })
      } catch {
        continue
      }
    }

    return projects
  }

  /**
   * 嘗試自動修復錯誤
   */
  static async autoFix(errors: ValidationError[], ai: any): Promise<boolean> {
    // 簡單的錯誤可以自動修復
    // 複雜的錯誤需要人工處理
    
    const fixableErrors = errors.filter(e => 
      e.message.includes('Cannot find name') ||
      e.message.includes('is not assignable to')
    )

    if (fixableErrors.length === 0) {
      return false
    }

    // TODO: 實作自動修復邏輯
    return false
  }
}
