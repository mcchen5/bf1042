# SDD 對話腳本模板

> 本文件提供在 Claude Code、Gemini CLI、Kimi 中執行 Spec-Kit 流程的完整對話模板

---

## 工具對照表

| 工具 | 類型 | 啟動方式 | 特點 |
|------|------|---------|------|
| **Claude Code** | CLI 工具 | `claude` | 最適合 Spec-Kit，原生支援 `/specify` 指令 |
| **Gemini CLI** | CLI 工具 | `gemini` | Google 官方，支援檔案上傳 |
| **Kimi** | 網頁/API | `kimi-chat` 或網頁 | 中文理解最佳，需手動貼上檔案 |

---

## 準備工作

### 1. 建立提示詞檔案

```bash
# 建立提示詞目錄
mkdir -p prompts

# 準備好以下提示詞檔案（見下方內容）
# - prompts/spec-kit-context.md
# - prompts/sdd-workflow.md
```

### 2. 準備設計文件

確保設計文件已生成：
```
docs/design/v1.0.0/
├── 00-brief.md
├── 01-personas.md
├── 02-cjm.md
├── 03-blueprint.md
├── 04-user-stories.md      # ★ Specify 主要輸入
└── 05-architecture.md      # ★ Plan 主要輸入
```

---

## 版本一：Claude Code（推薦）

### 安裝與設定

```bash
# 安裝 Claude Code
npm install -g @anthropic-ai/claude-code

# 驗證安裝
claude --version

# 進入專案目錄
cd breakfast-app
```

### 完整對話腳本

#### Step 1: 啟動並載入上下文

```bash
# 啟動 Claude Code
claude
```

在 Claude Code 中執行：

```markdown
# 你輸入：
請幫我完成 AI 語音點餐功能的規格設計。

首先，請讀取以下設計文件：

@docs/design/v1.0.0/04-user-stories.md
@docs/design/v1.0.0/05-architecture.md
@docs/design/v1.0.0/02-cjm.md

請先總結這些文件的關鍵內容，確認你理解：
1. 目標用戶（Persona）
2. 核心需求（User Stories）
3. 技術架構約束
4. 關鍵的用戶旅程時刻

確認後，我們進入 /specify 流程。
```

#### Step 2: 執行 Specify

```markdown
# 你輸入：
很好，理解正確。現在請執行 /specify。

要求：
1. 主要參考 04-user-stories.md 中的 US-004、US-005、US-006
2. 遵循 05-architecture.md 的技術選型（Elysia + Kimi）
3. 確保 API 設計符合 constitution.md 的規範
4. 輸出到 specs/001-ai-order/spec.md

請產生完整的 spec.md，包含：
- 功能背景與目標
- API 介面（使用 TypeBox Schema）
- 驗收標準（對應 User Stories 的驗收條件）
- 錯誤處理
- 效能需求
```

#### Step 3: 檢查並確認

```markdown
# Claude 會顯示產生的 spec.md 內容

# 你輸入（如果需要調整）：
請修改以下部分：
1. API 路徑改為 /api/ai/parse（而非 /api/ai-order/parse）
2. 新增 rate limiting 說明
3. 補充 Kimi API 的錯誤處理機制

# 確認無誤後：
請將最終版本寫入 specs/001-ai-order/spec.md
```

#### Step 4: 執行 Plan

```markdown
# 你輸入：
現在請執行 /plan。

請讀取：
1. @specs/001-ai-order/spec.md（剛產生的規格）
2. @docs/design/v1.0.0/05-architecture.md（技術架構）
3. @packages/api/src/schemas.ts（現有 Schema）

產生 plan.md，包含：
- 資料庫設計（新增表格）
- API 實作細節（Elysia 路由、Service 層）
- 前端實作（React 組件、TanStack Query Hooks）
- AI 整合（Kimi API 呼叫、Prompt 設計）
- 類型同步檢查清單
- 測試策略

輸出到 specs/001-ai-order/plan.md
```

#### Step 5: 執行 Tasks

```markdown
# 你輸入：
請執行 /tasks。

根據 plan.md 的內容，拆分成可執行的任務：
- Phase 1: 基礎建設
- Phase 2: 後端實作
- Phase 3: 前端實作
- Phase 4: 測試與優化

每個任務包含：
- 任務描述
- 估計工時
- 依賴關係
- 驗收標準

輸出到 specs/001-ai-order/tasks.md
```

#### Step 6: 開始實作

```markdown
# 你輸入：
請執行 /implement 開始實作 Phase 1。

或手動：
請幫我實作 packages/api/src/schemas.ts 中的 AI Order Schema。
```

---

## 版本二：Gemini CLI (Gemini Code)

### 安裝與設定

```bash
# 安裝 Google Cloud SDK
# 參考：https://cloud.google.com/sdk/docs/install

# 安裝 Gemini CLI
gcloud components install gemini

# 驗證安裝
gemini --version

# 登入
gcloud auth login
```

### 工作流程

Gemini CLI 使用方式與 Claude Code 類似，但指令前綴不同：

#### Step 1: 啟動並上傳檔案

```bash
# 進入專案目錄
cd breakfast-app

# 啟動 Gemini CLI
gemini code

# 或使用單次模式
gemini code --prompt "提示詞"
```

#### Step 2: 完整對話腳本

```markdown
# 你輸入：
請幫我完成 AI 語音點餐功能的技術規格。

首先，請讀取以下設計文件：

<file path="docs/design/v1.0.0/04-user-stories.md">
[內容會被自動讀取]
</file>

<file path="docs/design/v1.0.0/05-architecture.md">
[內容會被自動讀取]
</file>

<file path=".specify/memory/constitution.md">
[內容會被自動讀取]
</file>

請分析這些文件，總結：
1. 核心需求（來自 User Stories）
2. 技術約束（來自 Architecture）
3. API 規範（來自 Constitution）

確認理解後，我們開始產生 spec.md。
```

**注意**：Gemini CLI 的檔案上傳語法可能為：
```bash
# 方式一：使用 --file 參數
gemini code --file docs/design/v1.0.0/04-user-stories.md --file docs/design/v1.0.0/05-architecture.md

# 方式二：在互動模式中使用 @
@docs/design/v1.0.0/04-user-stories.md
```

#### Step 3: 產生 Spec

```markdown
# 你輸入：
請扮演 Spec-Kit 的 /specify 角色。

根據上述 User Stories（特別是 US-004、US-005、US-006），產生功能規格文件。

請產生以下內容並儲存到 specs/001-ai-order/spec.md：

---
# 功能規格：AI 自然語言訂餐

## 1. 背景
[根據 User Stories 描述]

## 2. API 介面
- POST /api/ai-order/parse
  - Request: [TypeBox Schema]
  - Response: [TypeBox Schema]

## 3. 驗收標準
[對應 User Stories 的驗收條件]

## 4. 錯誤處理
...

## 5. 效能需求
...
---

請確保：
1. Schema 定義使用 TypeBox 語法
2. API 路徑符合 RESTful 規範
3. 驗收標準可量化測試
```

#### Step 4: 產生 Plan

```markdown
# 你輸入：
現在請扮演 /plan 角色。

讀取剛產生的 spec.md，加上 architecture.md 的技術約束，產生技術實作方案。

請產生 specs/001-ai-order/plan.md，包含：

1. 資料庫設計（DDL）
2. 後端實作（Elysia 路由、Service、Repository）
3. 前端實作（React 組件、Hooks）
4. AI 整合（Kimi API、Prompt）
5. 測試計畫

參考技術架構：
- 後端：Elysia + Bun
- 資料庫：PostgreSQL + Drizzle
- 前端：React + TanStack Query
- AI：Kimi API
```

#### Step 5: 產生 Tasks

```markdown
# 你輸入：
請將 plan.md 拆解為可執行的任務。

產生 specs/001-ai-order/tasks.md，格式：

## Phase 1: 基礎建設
- [ ] 任務 1: [描述] ([估計工時])
  - 依賴: 無
  - 驗收: [條件]

## Phase 2: 後端實作
...

## Phase 3: 前端實作
...

## Phase 4: 測試與優化
...
```

---

## 版本三：Kimi（網頁版 / API）

### 方式 A: 網頁版（推薦）

Kimi 目前沒有 CLI 工具，使用網頁版最方便。

#### Step 1: 準備提示詞檔案

建立 `prompts/kimi-specify-prompt.md`：

```markdown
# Role: Spec-Kit Specify Agent

你是 Spec-Kit 的 Specify 代理，負責將 User Stories 轉換為技術規格文件。

## 輸入文件
我會提供以下文件內容：
1. User Stories（功能需求）
2. Architecture（技術架構約束）
3. Constitution（API 規範）

## 任務
產生符合以下格式的 spec.md：

```markdown
# 功能規格：[功能名稱]

## 1. 背景與目標
- 來源 User Story
- 要解決的問題
- 成功指標

## 2. 功能範圍
### In Scope
...
### Out of Scope
...

## 3. API 設計
### 端點列表
| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | /api/xxx | ... |

### Request Schema (TypeBox)
```typescript
const RequestSchema = t.Object({
  // 欄位定義
})
```

### Response Schema (TypeBox)
```typescript
const ResponseSchema = t.Object({
  // 欄位定義
})
```

## 4. 驗收標準
- [ ] 具體可測試的條件 1
- [ ] 具體可測試的條件 2

## 5. 錯誤處理
| 錯誤碼 | 說明 | HTTP 狀態碼 |
|--------|------|------------|
| ... | ... | ... |

## 6. 非功能需求
- 效能：...
- 安全：...
- 監控：...
```

## 規範
- 使用 TypeBox 定義 Schema
- API 路徑使用 kebab-case
- 錯誤格式符合 Constitution
- 驗收標準必須可量化

請確認理解後，我會貼上設計文件內容。
```

#### Step 2: 在 Kimi 網頁中對話

1. 開啟 [kimi.moonshot.cn](https://kimi.moonshot.cn)
2. 新建對話
3. 貼上 `prompts/kimi-specify-prompt.md` 的內容
4. Kimi 確認理解後，貼上設計文件

```markdown
# 你輸入：
請產生 AI 語音點餐功能的規格。

以下是設計文件：

## User Stories
[貼上 04-user-stories.md 中 US-004, US-005, US-006 的內容]

## Architecture 約束
[貼上 05-architecture.md 的關鍵段落]

## Constitution API 規範
[貼上 .specify/memory/constitution.md 的 API 規範章節]

請產生 spec.md 內容。
```

#### Step 3: 複製輸出到檔案

Kimi 產生內容後，複製並儲存到：
```bash
# 手動建立檔案並貼上內容
mkdir -p specs/001-ai-order
vim specs/001-ai-order/spec.md  # 貼上 Kimi 的輸出
```

#### Step 4: 執行 Plan

繼續在 Kimi 對話中：

```markdown
# 你輸入：
請扮演 Plan 角色，根據剛產生的 spec.md 和以下 architecture，產生技術實作方案。

[貼上 05-architecture.md 的完整內容]

請產生 plan.md，包含：
1. 資料庫設計
2. 後端實作
3. 前端實作
4. AI 整合
5. 測試計畫
```

### 方式 B: API 呼叫（進階）

使用 Kimi API 自動化：

```bash
# 安裝 SDK
pip install openai  # Kimi 相容 OpenAI SDK

# 建立腳本 scripts/kimi-sdd.py
```

```python
#!/usr/bin/env python3
# scripts/kimi-sdd.py

import os
from openai import OpenAI

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def generate_spec():
    client = OpenAI(
        api_key=os.environ['KIMI_API_KEY'],
        base_url='https://api.moonshot.cn/v1'
    )
    
    # 讀取設計文件
    user_stories = read_file('docs/design/v1.0.0/04-user-stories.md')
    architecture = read_file('docs/design/v1.0.0/05-architecture.md')
    constitution = read_file('.specify/memory/constitution.md')
    
    # 準備提示詞
    prompt = f"""
你扮演 Spec-Kit 的 Specify Agent。

請根據以下文件產生功能規格 spec.md：

---
## User Stories
{user_stories}

## Architecture
{architecture}

## Constitution
{constitution}
---

特別關注 US-004、US-005、US-006。

請產生完整的 spec.md 內容，使用 TypeBox Schema 定義 API。
"""
    
    response = client.chat.completions.create(
        model='moonshot-v1-32k',
        messages=[
            {'role': 'system', 'content': '你是 Spec-Kit Specify Agent，專門產生技術規格文件。'},
            {'role': 'user', 'content': prompt}
        ],
        temperature=0.3
    )
    
    # 儲存輸出
    os.makedirs('specs/001-ai-order', exist_ok=True)
    with open('specs/001-ai-order/spec.md', 'w', encoding='utf-8') as f:
        f.write(response.choices[0].message.content)
    
    print('spec.md 已產生')

if __name__ == '__main__':
    generate_spec()
```

```bash
# 執行
export KIMI_API_KEY=your-api-key
python scripts/kimi-sdd.py
```

---

## 比較總結

| 功能 | Claude Code | Gemini CLI | Kimi 網頁 | Kimi API |
|------|-------------|------------|-----------|----------|
| **啟動** | `claude` | `gemini code` | 瀏覽器 | Python 腳本 |
| **檔案上傳** | `@file` | `@file` 或 `--file` | 貼上文字 | 讀取檔案 |
| **互動性** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| **自動化** | 中 | 中 | 低 | 高 |
| **中文理解** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **SDD 支援** | 原生 /specify | 需提示詞 | 需提示詞 | 需提示詞 |

---

## 推薦使用方式

### 快速開發（推薦）
```bash
# 使用 Claude Code
claude
@docs/design/v1.0.0/04-user-stories.md
/specify
/plan
/tasks
```

### 批次自動化
```bash
# 使用 Kimi API
python scripts/kimi-sdd.py
```

### 協作審查
```bash
# 使用 Gemini CLI，分享對話連結
gemini code --share
```

---

## 注意事項

1. **檔案大小限制**：
   - Claude Code: 無明確限制，但建議分批上傳
   - Gemini: 單檔 4MB 限制
   - Kimi: 網頁版有 token 限制，API 版可用 32k/128k 模型

2. **上下文保持**：
   - Claude Code: 最佳，自動保持對話上下文
   - Gemini: 良好
   - Kimi 網頁: 需在同一對話中進行

3. **輸出品質**：
   - 三個工具都能產生高品質輸出
   - 關鍵在於**提示詞的品質**和**輸入文件的完整性**

---

## 下一步

選擇適合的工具後：
1. 準備好設計文件（04-user-stories.md, 05-architecture.md）
2. 準備好提示詞（prompts/ 目錄）
3. 按照對話腳本執行
4. 將輸出儲存到 specs/ 目錄
5. 進入開發階段
