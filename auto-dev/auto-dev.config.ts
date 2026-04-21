import { defineConfig } from './src/config'

export default defineConfig({
  // AI 配置
  ai: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    apiKey: process.env.ANTHROPIC_API_KEY
  },

  // 檢查點配置
  checkpoints: [
    {
      id: 'schema-review',
      phase: 'phase-1',
      condition: 'always',
      message: 'Schema 定義完成，請確認欄位類型是否正確'
    },
    {
      id: 'api-confirm',
      phase: 'phase-2',
      condition: 'complex',
      message: 'API 涉及外部服務，請確認整合細節'
    }
  ],

  // 部署配置
  deploy: {
    platform: 'flyio',
    staging: true
  }
})
