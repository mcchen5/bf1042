import { treaty } from '@elysiajs/eden'
import type { App } from '../../backend/src/index'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

// 建立 Eden Treaty 客戶端
export const api = treaty<App>(apiBaseUrl)

// 導出類型
export type { App }
