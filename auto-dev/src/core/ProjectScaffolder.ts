import { existsSync } from 'fs'
import type { AutoDevConfig } from '../types'
import { FileWriter } from '../utils/FileWriter'

interface ScaffoldFile {
  path: string
  content: string
}

export class ProjectScaffolder {
  static async ensure(config: AutoDevConfig): Promise<string[]> {
    const created: string[] = []

    for (const file of this.getScaffoldFiles(config)) {
      if (existsSync(file.path)) {
        continue
      }

      await FileWriter.write(file.path, file.content, {
        backup: false,
        createDir: true
      })
      created.push(file.path)
    }

    return created
  }

  private static getScaffoldFiles(config: AutoDevConfig): ScaffoldFile[] {
    const frontendRoot = `${config.outputPath}/frontend`
    const backendRoot = `${config.outputPath}/backend`
    const apiRoot = 'packages/api'

    return [
      {
        path: `${backendRoot}/package.json`,
        content: `{
  "name": "@auto-dev/backend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "start": "bun run dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@auto-dev/api": "workspace:*",
    "elysia": "^1.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.3.0"
  }
}
`
      },
      {
        path: `${backendRoot}/tsconfig.json`,
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["bun"]
  },
  "include": ["src/**/*"]
}
`
      },
      {
        path: `${backendRoot}/src/index.ts`,
        content: `import { Elysia } from 'elysia'

const port = Number(process.env.PORT ?? 3001)

const app = new Elysia()
  .get('/health', () => ({
    status: 'ok'
  }))
  .listen(port)

console.log(\`AutoDev backend scaffold running at http://localhost:\${port}\`)

export type App = typeof app
`
      },
      {
        path: `${frontendRoot}/package.json`,
        content: `{
  "name": "@auto-dev/frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@auto-dev/api": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.17.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.0",
    "vite": "^5.0.8"
  }
}
`
      },
      {
        path: `${frontendRoot}/tsconfig.json`,
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
`
      },
      {
        path: `${frontendRoot}/vite.config.ts`,
        content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
`
      },
      {
        path: `${frontendRoot}/index.html`,
        content: `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AutoDev Frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
      },
      {
        path: `${frontendRoot}/src/main.tsx`,
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
`
      },
      {
        path: `${frontendRoot}/src/App.tsx`,
        content: `export function App() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>AutoDev Frontend Scaffold</h1>
      <p>Generated UI components will be written to <code>src/components</code>.</p>
    </main>
  )
}
`
      },
      {
        path: `${frontendRoot}/src/vite-env.d.ts`,
        content: `/// <reference types="vite/client" />
`
      },
      {
        path: `${frontendRoot}/src/api/client.ts`,
        content: `const unimplemented = () => {
  throw new Error('AutoDev API client scaffold is a placeholder. Replace apps/frontend/src/api/client.ts with a real implementation.')
}

export const api: any = new Proxy(unimplemented as (...args: unknown[]) => never, {
  get() {
    return api
  },
  apply() {
    return unimplemented()
  }
})
`
      },
      {
        path: `${apiRoot}/package.json`,
        content: `{
  "name": "@auto-dev/api",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
`
      },
      {
        path: `${apiRoot}/tsconfig.json`,
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "emitDeclarationOnly": true
  },
  "include": ["src/**/*"]
}
`
      },
      {
        path: `${apiRoot}/src/index.ts`,
        content: `export * from './types'
`
      },
      {
        path: `${apiRoot}/src/types.ts`,
        content: `export interface ApiEnvelope<T> {
  success: boolean
  data: T
}
`
      }
    ]
  }
}
