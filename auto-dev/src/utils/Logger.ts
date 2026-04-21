import chalk from 'chalk'

export class Logger {
  private logs: string[] = []

  info(message: string): void {
    console.log(chalk.blue(message))
    this.logs.push(`[INFO] ${message}`)
  }

  success(message: string): void {
    console.log(chalk.green(message))
    this.logs.push(`[SUCCESS] ${message}`)
  }

  warn(message: string): void {
    console.log(chalk.yellow(message))
    this.logs.push(`[WARN] ${message}`)
  }

  error(message: string): void {
    console.log(chalk.red(message))
    this.logs.push(`[ERROR] ${message}`)
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray(message))
      this.logs.push(`[DEBUG] ${message}`)
    }
  }

  getLogs(): string[] {
    return this.logs
  }

  saveToFile(filePath: string): Promise<void> {
    const { writeFile } = require('fs/promises')
    return writeFile(filePath, this.logs.join('\n'), 'utf-8')
  }
}
