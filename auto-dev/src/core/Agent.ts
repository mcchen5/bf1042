import Anthropic from '@anthropic-ai/sdk'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import type { 
  AutoDevConfig, 
  DesignContext, 
  ExecutionPlan, 
  ExecutionLog,
  PhaseResult 
} from '../types'
import { UserStoryParser } from '../parsers/UserStoryParser'
import { ArchitectureParser } from '../parsers/ArchitectureParser'
import { PlanGenerator } from './PlanGenerator'
import { ProjectScaffolder } from './ProjectScaffolder'
import { SchemaAgent } from '../agents/SchemaAgent'
import { BackendAgent } from '../agents/BackendAgent'
import { FrontendAgent } from '../agents/FrontendAgent'
import { ValidationAgent } from '../agents/ValidationAgent'
import { FileWriter } from '../utils/FileWriter'
import { Logger } from '../utils/Logger'

export class AutoDevAgent {
  private ai: Anthropic
  private config: AutoDevConfig
  private logger: Logger
  private currentLog: ExecutionLog

  constructor(config: AutoDevConfig) {
    this.config = config
    this.logger = new Logger()
    
    // 初始化 AI 客戶端
    const apiKey = config.ai.apiKey || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('缺少 AI API Key，請設定 ANTHROPIC_API_KEY 或在配置中指定')
    }
    
    this.ai = new Anthropic({ apiKey })
    
    // 初始化執行日誌
    this.currentLog = {
      id: `run-${Date.now()}`,
      timestamp: new Date(),
      plan: {} as ExecutionPlan,
      results: [],
      status: 'running'
    }
  }

  /**
   * 解析設計文件
   */
  async parseDesign(): Promise<DesignContext> {
    const spinner = ora('📖 解析設計文件...').start()
    
    try {
      // 解析 User Stories
      const userStoriesPath = `${this.config.designPath}/04-user-stories.md`
      const userStories = await UserStoryParser.parse(userStoriesPath)
      
      // 解析 Architecture
      const architecturePath = `${this.config.designPath}/05-architecture.md`
      const architecture = await ArchitectureParser.parse(architecturePath)
      
      // 解析 Personas（如果有）
      let personas: any[] = []
      try {
        personas = await UserStoryParser.parsePersonas(
          `${this.config.designPath}/01-personas.md`
        )
      } catch {
        this.logger.warn('未找到 personas 文件，使用預設')
      }

      // 推導技術棧
      const techStack = this.inferTechStack(architecture)
      
      // 提取 API 端點
      const apis = this.extractAPIs(userStories)

      const context: DesignContext = {
        userStories,
        architecture,
        techStack,
        apis,
        personas
      }

      spinner.succeed(`✓ 解析完成：${userStories.length} 個 User Stories，${apis.length} 個 API`)
      
      return context
    } catch (error) {
      spinner.fail('解析失敗')
      throw error
    }
  }

  /**
   * 生成執行計畫
   */
  async generatePlan(context: DesignContext): Promise<ExecutionPlan> {
    const spinner = ora('📋 生成執行計畫...').start()
    
    try {
      const generator = new PlanGenerator(this.ai, this.config)
      const plan = await generator.generate(context)
      
      this.currentLog.plan = plan
      
      spinner.succeed('✓ 計畫生成完成')
      
      // 顯示計畫摘要
      this.displayPlanSummary(plan)
      
      return plan
    } catch (error) {
      spinner.fail('計畫生成失敗')
      throw error
    }
  }

  /**
   * 執行完整計畫
   */
  async execute(plan: ExecutionPlan): Promise<void> {
    console.log(chalk.blue.bold('\n🚀 開始自動開發\n'))
    await this.ensureProjectScaffold()
    
    for (const phase of plan.phases) {
      // 檢查是否有檢查點
      const checkpoint = plan.checkpoints.find(c => c.phase === phase.id)
      if (checkpoint && this.config.checkpoints.some(configCheckpoint => configCheckpoint.id === checkpoint.id)) {
        const shouldContinue = await this.handleCheckpoint(checkpoint)
        if (!shouldContinue) {
          console.log(chalk.yellow('⏸️  已暫停，等待人工處理...'))
          this.currentLog.status = 'paused'
          await this.saveLog()
          return
        }
      }

      // 執行階段
      const result = await this.executePhase(phase)
      this.currentLog.results.push(result)
      
      if (result.status === 'failed') {
        this.currentLog.status = 'failed'
        await this.saveLog()
        throw new Error(`階段 ${phase.name} 執行失敗`)
      }
    }

    this.currentLog.status = 'completed'
    await this.saveLog()
    
    console.log(chalk.green.bold('\n✅ 自動開發完成！\n'))
  }

  private async ensureProjectScaffold(): Promise<void> {
    const spinner = ora('🧱 檢查專案骨架...').start()

    try {
      const createdFiles = await ProjectScaffolder.ensure(this.config)

      if (createdFiles.length === 0) {
        spinner.succeed('✓ 專案骨架已就緒')
        return
      }

      spinner.succeed(`✓ 已初始化專案骨架 (${createdFiles.length} 個檔案)`)
    } catch (error) {
      spinner.fail('專案骨架初始化失敗')
      throw error
    }
  }

  /**
   * 執行單個階段
   */
  private async executePhase(phase: any): Promise<PhaseResult> {
    console.log(chalk.blue(`\n📦 ${phase.name}`))
    console.log(chalk.gray(`   ${phase.description}`))
    
    const result: PhaseResult = {
      phaseId: phase.id,
      status: 'success',
      tasks: [],
      startedAt: new Date()
    }

    for (const task of phase.tasks) {
      const taskResult = await this.executeTask(task)
      result.tasks.push(taskResult)
      
      if (taskResult.status === 'failed') {
        result.status = 'failed'
        break
      }
    }

    result.completedAt = new Date()
    result.duration = (result.completedAt.getTime() - result.startedAt.getTime()) / 1000
    
    const statusIcon = result.status === 'success' ? '✓' : '✗'
    const statusColor = result.status === 'success' ? chalk.green : chalk.red
    console.log(statusColor(`   ${statusIcon} 完成 (${result.duration}s)`))
    
    return result
  }

  /**
   * 執行單個任務
   */
  private async executeTask(task: any): Promise<any> {
    const spinner = ora(`   ${task.description}...`).start()
    const startTime = Date.now()
    
    try {
      let result: any

      switch (task.type) {
        case 'schema':
          result = await SchemaAgent.generate({
            task,
            designContext: this.currentLog.plan as any,
            ai: this.ai,
            config: this.config
          })
          break
        
        case 'backend':
          result = await BackendAgent.generate({
            task,
            designContext: this.currentLog.plan as any,
            ai: this.ai,
            config: this.config
          })
          break
        
        case 'frontend':
          result = await FrontendAgent.generate({
            task,
            designContext: this.currentLog.plan as any,
            ai: this.ai,
            config: this.config
          })
          break
        
        case 'validate':
          result = await ValidationAgent.validate(this.config)
          break
        
        default:
          throw new Error(`未知的任務類型: ${task.type}`)
      }

      const duration = (Date.now() - startTime) / 1000
      
      if (result.success) {
        spinner.succeed(`   ✓ ${task.description} (${duration.toFixed(1)}s)`)
      } else {
        spinner.fail(`   ✗ ${task.description}`)
      }

      return {
        taskId: task.id,
        status: result.success ? 'success' : 'failed',
        output: result.code || result.message,
        error: result.error,
        duration
      }
    } catch (error: any) {
      spinner.fail(`   ✗ ${task.description}`)
      return {
        taskId: task.id,
        status: 'failed',
        error: error.message,
        duration: (Date.now() - startTime) / 1000
      }
    }
  }

  /**
   * 處理檢查點
   */
  private async handleCheckpoint(checkpoint: any): Promise<boolean> {
    console.log(chalk.yellow(`\n⚠️  檢查點: ${checkpoint.message}`))
    
    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: '是否繼續？',
      default: true
    }])
    
    return proceed
  }

  /**
   * 顯示計畫摘要
   */
  private displayPlanSummary(plan: ExecutionPlan): void {
    console.log(chalk.gray('\n📊 執行計畫摘要:'))
    console.log(chalk.gray(`   預估時間: ${plan.estimatedDuration} 分鐘`))
    console.log(chalk.gray(`   Schema: ${plan.summary.totalSchemas} 個`))
    console.log(chalk.gray(`   API: ${plan.summary.totalAPIs} 個`))
    console.log(chalk.gray(`   組件: ${plan.summary.totalComponents} 個`))
    console.log(chalk.gray(`   風險等級: ${plan.summary.riskLevel}`))
    
    if (plan.checkpoints.length > 0) {
      console.log(chalk.yellow(`   檢查點: ${plan.checkpoints.length} 個`))
    }
    console.log()
  }

  /**
   * 推導技術棧
   */
  private inferTechStack(architecture: any): any {
    // 從 architecture 文件推導技術棧
    return {
      backend: 'Elysia + Bun',
      frontend: 'React + Vite',
      database: 'PostgreSQL',
      ai: 'Claude 3.5 Sonnet'
    }
  }

  /**
   * 提取 API 端點
   */
  private extractAPIs(userStories: any[]): any[] {
    // 從 User Stories 提取 API 需求
    const apis: any[] = []
    
    for (const story of userStories) {
      // 解析 story 中的 API 需求
      if (story.acceptanceCriteria) {
        // 簡單的啟發式提取
        const matches = story.acceptanceCriteria.join(' ').match(/GET|POST|PUT|DELETE/g)
        if (matches) {
          apis.push({
            method: matches[0],
            path: `/api/${story.epic || 'unknown'}`,
            description: story.title
          })
        }
      }
    }
    
    return apis
  }

  /**
   * 儲存執行日誌
   */
  private async saveLog(): Promise<void> {
    const logPath = `.auto-dev/logs/${this.currentLog.id}.json`
    await FileWriter.write(logPath, JSON.stringify(this.currentLog, null, 2), {
      backup: false
    })
  }

  /**
   * 確認提示
   */
  async confirm(message: string): Promise<boolean> {
    const { confirmed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmed',
      message,
      default: true
    }])
    return confirmed
  }
}
