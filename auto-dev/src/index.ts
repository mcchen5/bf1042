#!/usr/bin/env bun
import { Command } from "commander";
import chalk from "chalk";
import { AutoDevAgent } from "./core/Agent";
import type { AutoDevConfig, UserAutoDevConfig } from "./types";

const program = new Command();

program
  .name("auto-dev")
  .description("AI-Native Software Development Agent")
  .version("0.1.0");

program
  .command("init")
  .description("初始化 AutoDev 配置")
  .action(async () => {
    console.log(chalk.blue("🚀 初始化 AutoDev..."));

    // 建立預設配置檔案
    const configContent = `import { defineConfig } from './src/config'

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
`;

    await Bun.write("auto-dev.config.ts", configContent);
    console.log(chalk.green("✓ 已建立 auto-dev.config.ts"));
    console.log(chalk.gray("請確認 .env 已設定 ANTHROPIC_API_KEY"));
  });

program
  .command("start")
  .description("開始自動開發")
  .option("-c, --checkpoints", "啟用檢查點", true)
  .option("-d, --design <path>", "設計文件路徑", "docs/design/v1.0.0")
  .action(async (options) => {
    try {
      // 載入配置
      let config: AutoDevConfig;
      try {
        const configModule = await import(
          `${process.cwd()}/auto-dev.config.ts`
        );
        config = resolveConfig(configModule.default, options.design);
      } catch {
        console.log(chalk.yellow("未找到配置文件，使用預設配置"));
        config = getDefaultConfig(options.design);
      }

      // 設定檢查點
      if (!options.checkpoints) {
        config.checkpoints = [];
      }

      // 建立 Agent 並執行
      const agent = new AutoDevAgent(config);

      // Phase 1: 解析設計
      const context = await agent.parseDesign();

      // Phase 2: 生成計畫
      const plan = await agent.generatePlan(context);

      // 確認是否執行
      const proceed = await agent.confirm("是否開始自動開發？");
      if (!proceed) {
        console.log(chalk.yellow("已取消"));
        process.exit(0);
      }

      // Phase 3: 執行
      await agent.execute(plan);
    } catch (error: any) {
      console.error(chalk.red(`\n❌ 錯誤: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("plan")
  .description("僅生成執行計畫，不執行")
  .option("-d, --design <path>", "設計文件路徑", "docs/design/v1.0.0")
  .action(async (options) => {
    try {
      const config = getDefaultConfig(options.design);
      const agent = new AutoDevAgent(config);

      const context = await agent.parseDesign();
      const plan = await agent.generatePlan(context);

      console.log(chalk.green("\n✓ 計畫已生成"));
      console.log(chalk.gray(`預估時間: ${plan.estimatedDuration} 分鐘`));

      // 儲存計畫到檔案
      await Bun.write(".auto-dev/plan.json", JSON.stringify(plan, null, 2));
      console.log(chalk.gray("計畫已儲存到 .auto-dev/plan.json"));
    } catch (error: any) {
      console.error(chalk.red(`錯誤: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("validate")
  .description("驗證生成的程式碼")
  .action(async () => {
    console.log(chalk.blue("🔍 開始驗證..."));

    const { ValidationAgent } = await import("./agents/ValidationAgent");
    const result = await ValidationAgent.validate({});

    if (result.success) {
      console.log(chalk.green("\n✓ 所有驗證通過！"));
    } else {
      console.log(chalk.red(`\n✗ 發現 ${result.errors.length} 個錯誤`));
      for (const error of result.errors) {
        console.log(chalk.red(`  - ${error.type}: ${error.message}`));
      }
      process.exit(1);
    }
  });

// 輔助函數
function getDefaultConfig(designPath: string): AutoDevConfig {
  return {
    projectPath: process.cwd(),
    designPath,
    outputPath: "apps",
    ai: {
      provider: "anthropic",
      model: "claude-sonnet-4-20250514",
    },
    checkpoints: [
      {
        id: "api-confirm",
        phase: "phase-2",
        condition: "complex",
        message: "API 涉及外部服務整合，請確認設定",
      },
    ],
  };
}

function resolveConfig(
  userConfig: UserAutoDevConfig | undefined,
  designPath: string,
): AutoDevConfig {
  const defaultConfig = getDefaultConfig(designPath);

  return {
    ...defaultConfig,
    ...userConfig,
    ai: {
      ...defaultConfig.ai,
      ...userConfig?.ai,
    },
    checkpoints: userConfig?.checkpoints ?? defaultConfig.checkpoints,
    deploy: defaultConfig.deploy
      ? {
          ...defaultConfig.deploy,
          ...userConfig?.deploy,
          platform: userConfig?.deploy?.platform ?? defaultConfig.deploy.platform,
        }
      : undefined,
  };
}

if (process.argv.slice(2).length === 0) {
  program.help({ error: false });
}

program.parse();
