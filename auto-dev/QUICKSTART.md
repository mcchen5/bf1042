# AutoDev 快速開始指南

## 安裝

```bash
# 克隆專案
git clone <repository>
cd auto-dev

# 安裝依賴
bun install

# 建立 CLI 工具
bun run build

# 全域安裝（選項）
bun link
```

## 使用範例

### 1. 準備設計文件

在專案根目錄建立設計文件：

```bash
mkdir -p docs/design/v1.0.0

# 建立 User Stories
cat > docs/design/v1.0.0/04-user-stories.md << 'EOF'
# 使用者故事

## Epic 1: 訂餐

### US-001: 瀏覽菜單
**身為** 顧客  
**我想要** 瀏覽菜單  
**如此** 我可以選擇品項

**驗收標準**:
- [ ] 顯示品項列表
- [ ] 顯示價格和描述
EOF

# 建立 Architecture
cat > docs/design/v1.0.0/05-architecture.md << 'EOF'
# 系統架構

## 技術棧
- 後端: Elysia + Bun
- 前端: React + Vite
- 資料庫: PostgreSQL
EOF
```

### 2. 初始化配置

```bash
auto-dev init
```

這會建立 `auto-dev.config.ts`。建議在專案根目錄 `auto-dev/.env` 放入你的 AI API Key。

### 3. 執行自動開發

```bash
# 解析設計 → 生成計畫 → 執行
auto-dev start

# 僅生成計畫（不執行）
auto-dev plan

# 驗證生成的程式碼
auto-dev validate
```

## 工作流程

```
設計文件 → 解析 → AI 規劃 → 程式碼生成 → 驗證 → 部署
     ↑                                              ↓
   人工確認 ←────── 檢查點 ────────────────────────┘
```

## 指令說明

| 指令 | 說明 | 範例 |
|------|------|------|
| `init` | 初始化配置 | `auto-dev init` |
| `start` | 開始完整流程 | `auto-dev start` |
| `plan` | 僅生成計畫 | `auto-dev plan` |
| `validate` | 驗證程式碼 | `auto-dev validate` |

## 環境變數

```bash
# auto-dev/.env
ANTHROPIC_API_KEY=your-key
```

執行 `bun run src/index.ts start` 或 `auto-dev start` 前，請確認目前工作目錄是 `auto-dev/`。

## 故障排除

### 類型檢查失敗

```bash
# 手動執行類型檢查
cd apps/backend && bun run typecheck
cd apps/frontend && bun run typecheck
```

### AI 生成失敗

- 確認 API Key 設定正確
- 檢查網路連線
- 查看日誌：`.auto-dev/logs/`

## 開發除錯

```bash
# CLI 監看模式
bun run watch

# 前端 / 後端開發模式
bun run dev:frontend
bun run dev:backend

# 帶除錯訊息
DEBUG=1 auto-dev start
```
