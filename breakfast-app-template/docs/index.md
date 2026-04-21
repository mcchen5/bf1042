---
layout: home

hero:
  name: 早餐店訂餐系統
  text: 服務設計與技術文件
  tagline: 從需求探索到程式碼實作的完整記錄
  image:
    src: /logo.svg
    alt: 早餐店系統
  actions:
    - theme: brand
      text: 開始閱讀
      link: /design/v1.0.0/00-brief
    - theme: alt
      text: 查看 API 文件
      link: /api/

features:
  - icon: 🎯
    title: 服務設計
    details: 基於 Persona、CJM、Service Blueprint 的使用者中心設計方法
  - icon: 📝
    title: 規範驅動開發
    details: 使用 Spec-Kit 進行結構化的需求到實作流程
  - icon: 🔧
    title: 端對端類型安全
    details: Elysia + Eden Treaty + TanStack 的現代全端架構
  - icon: 🤖
    title: AI 輔助開發
    details: Kimi 協助服務設計與自然語言點餐功能
---

## 文件結構

```
docs/
├── design/           # 服務設計文件
│   ├── v1.0.0/      # 版本化設計
│   └── CHANGELOG.md # 變更日誌
├── specs/           # 技術規格 (SDD)
│   └── 001-ai-order/# 功能規格
└── api/             # API 文件
```

## 快速導航

| 主題 | 文件 | 說明 |
|------|------|------|
| 為什麼做這個？ | [需求摘要](./design/v1.0.0/00-brief) | 產品願景與目標 |
| 為誰做？ | [人物誌](./design/v1.0.0/01-personas) | 目標用戶分析 |
| 他們怎麼用？ | [客戶旅程地圖](./design/v1.0.0/02-cjm) | 使用情境與痛點 |
| 系統如何支援？ | [服務藍圖](./design/v1.0.0/03-blueprint) | 前後台流程對齊 |
| 要開發什麼？ | [使用者故事](./design/v1.0.0/04-user-stories) | 功能需求清單 |
| 技術怎麼做？ | [系統架構](./design/v1.0.0/05-architecture) | 技術架構設計 |

## 技術棧

- **後端**: Elysia + Bun + Drizzle ORM
- **前端**: React + Vite + TanStack
- **AI**: Kimi (Moonshot)
- **文件**: VitePress + Mermaid
- **流程**: Spec-Kit (SDD)

---

*此文件使用 [VitePress](https://vitepress.dev/) 建置，圖表使用 [Mermaid](https://mermaid.js.org/) 繪製。*
