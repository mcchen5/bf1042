import { defineConfig } from 'vitepress'

// Mermaid 插件配置
const customElements = [
  'mermaid-container'
]

export default defineConfig({
  title: '早餐店訂餐系統',
  description: '服務設計與技術規格文件',
  
  // 網站基礎路徑（GitHub Pages）
  base: '/breakfast-app/',
  
  // 語言設定
  lang: 'zh-TW',
  
  // 主題配置
  themeConfig: {
    // 導航欄
    nav: [
      { text: '首頁', link: '/' },
      { 
        text: '服務設計', 
        items: [
          { text: 'v1.0.0 (最新)', link: '/design/v1.0.0/00-brief' },
          { text: '變更日誌', link: '/design/CHANGELOG' }
        ]
      },
      { text: '技術規格', link: '/specs/' },
      { text: 'API 文件', link: '/api/' }
    ],

    // 側邊欄
    sidebar: {
      '/design/': [
        {
          text: '設計概覽',
          items: [
            { text: '文件導讀', link: '/design/' },
            { text: '變更日誌', link: '/design/CHANGELOG' }
          ]
        },
        {
          text: 'v1.0.0 - 初始版本',
          collapsed: false,
          items: [
            { text: '需求摘要', link: '/design/v1.0.0/00-brief' },
            { text: '人物誌 (Personas)', link: '/design/v1.0.0/01-personas' },
            { text: '客戶旅程地圖 (CJM)', link: '/design/v1.0.0/02-cjm' },
            { text: '服務藍圖', link: '/design/v1.0.0/03-blueprint' },
            { text: '使用者故事', link: '/design/v1.0.0/04-user-stories' },
            { text: '系統架構', link: '/design/v1.0.0/05-architecture' }
          ]
        }
      ],
      '/specs/': [
        {
          text: '技術規格 (SDD)',
          items: [
            { text: '規格總覽', link: '/specs/' },
            { text: '001 - AI 點餐', link: '/specs/001-ai-order/' }
          ]
        }
      ]
    },

    // 社交連結
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/breakfast-app' }
    ],

    // 頁尾
    footer: {
      message: '使用 VitePress + Mermaid 建置',
      copyright: 'Copyright © 2024 早餐店團隊'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 編輯連結
    editLink: {
      pattern: 'https://github.com/yourusername/breakfast-app/edit/main/docs/:path',
      text: '編輯此頁'
    },

    // 最後更新時間
    lastUpdated: {
      text: '最後更新',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  },

  // Markdown 配置
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    config: (md) => {
      // Mermaid 支援
      md.use(require('vitepress-plugin-mermaid').default, {
        mermaid: {
          theme: 'default',
          themeVariables: {
            primaryColor: '#e1f5fe',
            primaryTextColor: '#01579b',
            primaryBorderColor: '#0288d1',
            lineColor: '#0288d1'
          }
        }
      })
    }
  },

  // Head 設定
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c3c3c' }]
  ],

  // Vue 配置
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag)
      }
    }
  }
})
