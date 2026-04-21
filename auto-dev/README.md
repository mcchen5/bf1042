# AutoDev - AI-Native Software Development Agent

自動化軟體開發代理，從設計文件到部署的完整自動化流程。

## 功能特性

- 📖 **智能解析**：自動解析 User Stories 和 Architecture 設計文件
- 🤖 **AI 驅動**：使用 Claude 3.5 Sonnet 生成高品質程式碼
- ✅ **自動驗證**：類型檢查、建置驗證、測試執行
- 🚀 **一鍵部署**：自動部署到 Fly.io / Railway
- 👤 **人機協作**：關鍵決策點保留人工確認

## 安裝

```bash
# 使用 bun（推薦）
bun install -g auto-dev

# 或使用 npm
npm install -g auto-dev
```

## 快速開始

```bash
# 在專案根目錄執行
auto-dev init

# 開始自動開發
auto-dev start

# 帶檢查點的開發（推薦）
auto-dev start --checkpoints
```

## 工作流程

```
設計文件 → 解析 → AI 規劃 → 程式碼生成 → 驗證 → 部署
     ↑                                              ↓
   人工確認 ←────── 檢查點 ────────────────────────┘
```

## 配置

建立 `auto-dev.config.ts`：

```typescript
export default {
  ai: {
    provider: 'anthropic', // 或 'openai'
    model: 'claude-sonnet-4-20250514'
  },
  checkpoints: ['schema', 'api', 'deploy'],
  deploy: {
    platform: 'flyio',
    staging: true
  }
}
```

## 專案結構要求

```
my-project/
├── docs/design/v1.0.0/
│   ├── 04-user-stories.md    # ★ 輸入
│   └── 05-architecture.md    # ★ 輸入
├── packages/api/             # ★ Schema 輸出
├── apps/backend/             # ★ 後端輸出
├── apps/frontend/            # ★ 前端輸出
└── auto-dev.config.ts
```

## License

MIT
