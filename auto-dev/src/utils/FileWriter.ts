import { writeFile, mkdir, rename } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname } from 'path'

interface WriteOptions {
  backup?: boolean
  createDir?: boolean
}

export class FileWriter {
  static async write(
    filePath: string,
    content: string,
    options: WriteOptions = {}
  ): Promise<void> {
    const { backup = true, createDir = true } = options

    // 確保目錄存在
    if (createDir) {
      const dir = dirname(filePath)
      await mkdir(dir, { recursive: true })
    }

    // 備份現有檔案
    if (backup && existsSync(filePath)) {
      const backupPath = `${filePath}.backup-${Date.now()}`
      await rename(filePath, backupPath)
    }

    // 寫入新內容
    await writeFile(filePath, content, 'utf-8')
  }

  static async writeJSON(
    filePath: string,
    data: any,
    options: WriteOptions = {}
  ): Promise<void> {
    const content = JSON.stringify(data, null, 2)
    await this.write(filePath, content, options)
  }
}
