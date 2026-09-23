# 签证指南 App

通过「条件式引导 + 个性化清单 + 进度跟踪」帮助用户完成签证办理。第一阶段支持微信小程序与支付宝小程序，覆盖日本、韩国、申根（法/德/意）、美国旅游签证。

## 目录结构

```text
apps/
  weapp/          # Taro + React + TypeScript，编译微信与支付宝小程序
packages/
  types/          # 共享类型
  utils/          # 纯函数工具
  design-tokens/  # 颜色、字号、间距等设计变量
  i18n/           # 公共多语言词典与 t() 客户端
  visa-engine/    # 签证规则引擎（骨架）
scripts/
  i18n-extract/   # 一键文案提取与合并
docs/             # 设计文档与实施计划
```

## 开发命令

```bash
pnpm install
pnpm --filter @vcc/weapp build:weapp   # 编译微信小程序
pnpm --filter @vcc/weapp build:alipay  # 编译支付宝小程序
pnpm build                             # 构建全部 packages
node scripts/i18n-extract/extract.mjs --root apps/weapp/src --locales packages/i18n/locales
```

## 依赖原则

- `packages/*` 只允许依赖 `packages/types`；`apps/*` 可依赖任意 packages；packages 禁止反向依赖 apps。
- 面向用户文案一律 `t('key')`，语言白名单为 `zh-CN`、`en`、`ja`、`ko`。
