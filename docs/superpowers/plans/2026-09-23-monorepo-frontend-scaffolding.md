# Monorepo 与前端项目搭建 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 pnpm + Turborepo 的 monorepo，并产出一个可编译到微信/支付宝小程序的 Taro 4 + React + TypeScript 前端骨架，附带共享 packages 与 i18n 一键提取脚本。

**Architecture:** 根目录用 pnpm workspaces 管理 `apps/*` 与 `packages/*`，Turborepo 负责任务编排。业务内核（类型、工具、设计变量、i18n、规则引擎、API 客户端）放在 `packages/*`，小程序放在 `apps/weapp`（Taro，同一套源码编译 weapp 与 alipay）。共享包只依赖 `packages/types`，应用依赖 packages，packages 不反向依赖 apps。

**Tech Stack:** pnpm 11、Turborepo、Taro 4.2.1、React 18、TypeScript 5、Sass、NutUI React（后续任务接入）。

**Spec:** `docs/superpowers/specs/2026-09-23-visa-guide-app-design.md`

## Global Constraints

- 包管理器必须是 pnpm（workspace 协议 `workspace:*`）。
- 小程序平台第一阶段只支持 weapp 与 alipay。
- 所有共享 package 的 TS 构建目标为 ES2020 + CommonJS 模块，根目录统一 `tsconfig.base.json`。
- 依赖方向：`packages/*` 只允许依赖 `packages/types`（`utils` 额外可依赖 `types`）；`apps/*` 可依赖任意 packages；packages 禁止依赖 apps。
- i18n 语言白名单：`zh-CN`、`en`、`ja`、`ko`；代码文案一律 `t('key')`，禁止硬编码面向用户的文本。
- Node.js 版本 >= 20（当前环境为 v24.18.1）。
- 远程仓库 `origin` 保持 SSH：`git@github.com:fanyongchaofyc-cloud/qianzheng-public.git`，不要改成 HTTPS。

---

## File Structure

```text
.
├── package.json                       # 根，私有 + workspaces 脚本
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── .gitignore
├── .npmrc
├── README.md                          # 已存在，补充 monorepo 说明
├── packages/
│   ├── types/                         # 纯类型包
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/index.ts
│   ├── utils/                         # 纯函数工具包
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/index.ts
│   │   └── src/currency.ts
│   ├── design-tokens/                 # 设计变量
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/index.ts
│   ├── i18n/                          # 公共词典 + t() 客户端
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── locales/
│   │   │   ├── zh-CN.json
│   │   │   ├── en.json
│   │   │   ├── ja.json
│   │   │   └── ko.json
│   │   └── src/index.ts
│   └── visa-engine/                   # 规则引擎骨架（本计划只放接口与类型）
│       ├── package.json
│       ├── tsconfig.json
│       └── src/index.ts
├── apps/
│   └── weapp/                         # Taro 4 + React + TS + Sass
│       ├── package.json
│       ├── babel.config.js
│       ├── tsconfig.json
│       ├── project.config.json
│       ├── config/index.ts
│       ├── config/dev.ts
│       ├── config/prod.ts
│       ├── src/app.config.ts
│       ├── src/app.tsx
│       ├── src/app.scss
│       ├── src/index.html
│       ├── src/pages/index/index.config.ts
│       ├── src/pages/index/index.tsx
│       ├── src/pages/index/index.scss
│       └── types/global.d.ts
└── scripts/
    └── i18n-extract/
        ├── package.json
        └── extract.mjs
```

## Task 1: 根级 monorepo 基础设施

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `turbo.json`
- Create: `tsconfig.base.json`
- Create: `.npmrc`
- Modify: `.gitignore`

**Interfaces:**
- Produces: 根 `package.json` 暴露脚本 `build`、`typecheck`、`extract`；`pnpm-workspace.yaml` 声明 `apps/*` 与 `packages/*`；`tsconfig.base.json` 提供 `@vcc/*` 路径映射。

- [ ] **Step 1: 写入 workspace 声明**

创建 `pnpm-workspace.yaml`：

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "scripts/*"
```

- [ ] **Step 2: 写入根 package.json**

创建 `package.json`：

```json
{
  "name": "qianzheng",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@11.16.0",
  "scripts": {
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "extract": "turbo run extract"
  },
  "devDependencies": {
    "turbo": "^2.3.3"
  }
}
```

- [ ] **Step 3: 写入 Turborepo 配置**

创建 `turbo.json`：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "extract": {}
  }
}
```

- [ ] **Step 4: 写入共享 tsconfig**

创建 `tsconfig.base.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@vcc/types": ["packages/types/src/index.ts"],
      "@vcc/utils": ["packages/utils/src/index.ts"],
      "@vcc/design-tokens": ["packages/design-tokens/src/index.ts"],
      "@vcc/i18n": ["packages/i18n/src/index.ts"],
      "@vcc/visa-engine": ["packages/visa-engine/src/index.ts"]
    }
  }
}
```

- [ ] **Step 5: 写入 .npmrc 与 .gitignore**

创建 `.npmrc`：

```ini
shamefully-hoist=true
strict-peer-dependencies=false
```

创建 `.gitignore`（如已存在则替换）：

```gitignore
node_modules/
dist/
.turbo/
*.log
.DS_Store
.idea/
.vscode/
```

- [ ] **Step 6: 验证 workspace 识别**

Run: `pnpm install`
Expected: 安装成功，无 workspace 解析报错。

- [ ] **Step 7: 提交**

```bash
git add pnpm-workspace.yaml package.json turbo.json tsconfig.base.json .npmrc .gitignore
git commit -m "chore: add monorepo workspace, turbo, and shared tsconfig"
```

## Task 2: 共享 packages 骨架

**Files:**
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/index.ts`
- Create: `packages/utils/package.json`
- Create: `packages/utils/tsconfig.json`
- Create: `packages/utils/src/index.ts`
- Create: `packages/utils/src/currency.ts`
- Create: `packages/design-tokens/package.json`
- Create: `packages/design-tokens/tsconfig.json`
- Create: `packages/design-tokens/src/index.ts`
- Create: `packages/visa-engine/package.json`
- Create: `packages/visa-engine/tsconfig.json`
- Create: `packages/visa-engine/src/index.ts`

**Interfaces:**
- Produces:
  - `@vcc/types` 导出 `LocaleCode`、`VisaCategoryCode`、`DestinationCode`。
  - `@vcc/utils` 导出 `formatCurrency(amountMinor: number, currency: string, locale: LocaleCode): string` 与 `currencyName(currency: string): string`。
  - `@vcc/design-tokens` 导出 `colors`、`spacing`、`radius`、`fontSize` 四个常量对象。
  - `@vcc/visa-engine` 导出 `PolicyVersion`、`RequirementItem`、`ProcessStep` 接口（本计划仅类型，不含算法）。

每个包的 `package.json` 命名遵循 `@vcc/<name>`，`main` 指向 `dist/index.js`，`types` 指向 `dist/index.d.ts`，`scripts.build` 为 `tsc -p tsconfig.json`。各包 `tsconfig.json` 继承根配置并输出到 `dist`。

- [ ] **Step 1: 创建 types 包**

`packages/types/package.json`：

```json
{
  "name": "@vcc/types",
  "version": "0.1.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

`packages/types/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

`packages/types/src/index.ts`：

```ts
export type LocaleCode = 'zh-CN' | 'en' | 'ja' | 'ko'

export type VisaCategoryCode = 'tourist' | 'student' | 'business' | 'family_visit'

export type DestinationCode = 'japan' | 'south_korea' | 'schengen_fr' | 'schengen_de' | 'schengen_it' | 'united_states'

export interface LocalizedText {
  'zh-CN': string
  en: string
  ja: string
  ko: string
}
```

- [ ] **Step 2: 创建 utils 包**

`packages/utils/package.json` 与 `packages/utils/tsconfig.json` 同 types 包结构，name 为 `@vcc/utils`。`packages/utils/src/currency.ts`：

```ts
import type { LocaleCode } from '@vcc/types'

const CURRENCY_NAMES: Record<string, string> = {
  CNY: '人民币',
  JPY: '日元',
  KRW: '韩元',
  EUR: '欧元',
  USD: '美元'
}

export function currencyName (currency: string): string {
  return CURRENCY_NAMES[currency] ?? currency
}

export function formatCurrency (amountMinor: number, currency: string, locale: LocaleCode): string {
  const amount = amountMinor / 100
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol'
  }).format(amount)
  return `${formatted} (${currencyName(currency)})`
}
```

`packages/utils/src/index.ts`：

```ts
export { currencyName, formatCurrency } from './currency'
```

- [ ] **Step 3: 创建 design-tokens 包**

`packages/design-tokens/package.json` 与 tsconfig 同结构，name 为 `@vcc/design-tokens`。`src/index.ts`：

```ts
export const colors = {
  primary: '#1677FF',
  success: '#00B578',
  warning: '#FF8F1F',
  danger: '#FF3141',
  text: '#1A1A1A',
  textSecondary: '#808080',
  background: '#F7F8FA'
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
} as const

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  round: 999
} as const

export const fontSize = {
  xs: 24,
  sm: 28,
  md: 32,
  lg: 36,
  xl: 44
} as const
```

- [ ] **Step 4: 创建 visa-engine 包**

`packages/visa-engine/package.json` 与 tsconfig 同结构，name 为 `@vcc/visa-engine`。`src/index.ts`：

```ts
import type { DestinationCode, LocalizedText, VisaCategoryCode } from '@vcc/types'

export interface PolicyVersion {
  id: string
  destination: DestinationCode
  category: VisaCategoryCode
  version: string
  effectiveAt: string
  status: 'draft' | 'published' | 'retired'
}

export interface RequirementItem {
  id: string
  name: LocalizedText
  required: boolean
}

export interface ProcessStep {
  id: string
  title: LocalizedText
  order: number
}

export interface VisaRuleSet {
  policy: PolicyVersion
  requirements: RequirementItem[]
  steps: ProcessStep[]
}
```

- [ ] **Step 5: 构建全部 packages**

Run: `pnpm --filter "./packages/*" build`
Expected: 每个包生成 `dist/index.js` 与 `dist/index.d.ts`，无类型错误。

- [ ] **Step 6: 提交**

```bash
git add packages
git commit -m "feat: add shared types, utils, design-tokens, and visa-engine packages"
```

## Task 3: Taro 小程序脚手架

**Files:**
- Create: `apps/weapp/package.json`
- Create: `apps/weapp/babel.config.js`
- Create: `apps/weapp/tsconfig.json`
- Create: `apps/weapp/project.config.json`
- Create: `apps/weapp/config/index.ts`
- Create: `apps/weapp/config/dev.ts`
- Create: `apps/weapp/config/prod.ts`
- Create: `apps/weapp/src/app.config.ts`
- Create: `apps/weapp/src/app.tsx`
- Create: `apps/weapp/src/app.scss`
- Create: `apps/weapp/src/index.html`
- Create: `apps/weapp/src/pages/index/index.config.ts`
- Create: `apps/weapp/src/pages/index/index.tsx`
- Create: `apps/weapp/src/pages/index/index.scss`
- Create: `apps/weapp/types/global.d.ts`

**Interfaces:**
- Consumes: 根 workspace 与 `@vcc/*` 路径映射（本任务仅保留空 `@/*` 别名，暂不 import 共享包，保证首包可独立编译）。
- Produces: `pnpm --filter @vcc/weapp build:weapp` 产出 `apps/weapp/dist`；`build:alipay` 同样产出可被支付宝开发者工具打开的小程序产物。

- [ ] **Step 1: 写入 package.json**

`apps/weapp/package.json`：

```json
{
  "name": "@vcc/weapp",
  "version": "0.1.0",
  "private": true,
  "description": "签证指南小程序",
  "templateInfo": {
    "name": "default",
    "typescript": true,
    "css": "sass",
    "framework": "React"
  },
  "scripts": {
    "build:weapp": "taro build --type weapp",
    "build:alipay": "taro build --type alipay",
    "dev:weapp": "npm run build:weapp -- --watch",
    "dev:alipay": "npm run build:alipay -- --watch",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "browserslist": [
    "defaults and fully supports es6-module",
    "maintained node versions"
  ],
  "dependencies": {
    "@babel/runtime": "^7.24.4",
    "@tarojs/components": "4.2.1",
    "@tarojs/helper": "4.2.1",
    "@tarojs/plugin-framework-react": "4.2.1",
    "@tarojs/plugin-platform-alipay": "4.2.1",
    "@tarojs/plugin-platform-weapp": "4.2.1",
    "@tarojs/react": "4.2.1",
    "@tarojs/runtime": "4.2.1",
    "@tarojs/shared": "4.2.1",
    "@tarojs/taro": "4.2.1",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.4",
    "@babel/plugin-transform-class-properties": "7.25.9",
    "@babel/preset-react": "^7.24.1",
    "@pmmmwh/react-refresh-webpack-plugin": "^0.5.5",
    "@tarojs/cli": "4.2.1",
    "@tarojs/taro-loader": "4.2.1",
    "@tarojs/webpack5-runner": "4.2.1",
    "@types/minimatch": "^5",
    "@types/node": "^18",
    "@types/react": "^18.0.0",
    "@types/webpack-env": "^1.13.6",
    "babel-preset-taro": "4.2.1",
    "postcss": "^8.5.6",
    "react-refresh": "^0.14.0",
    "sass": "^1.75.0",
    "tsconfig-paths-webpack-plugin": "^4.1.0",
    "typescript": "^5.4.5",
    "webpack": "5.91.0"
  }
}
```

- [ ] **Step 2: 写入 babel 配置**

`apps/weapp/babel.config.js`：

```js
module.exports = {
  presets: [
    ['taro', {
      framework: 'react',
      ts: true,
      compiler: 'webpack5'
    }]
  ]
}
```

- [ ] **Step 3: 写入 tsconfig**

`apps/weapp/tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "commonjs",
    "removeComments": false,
    "preserveConstEnums": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "noImplicitAny": false,
    "allowSyntheticDefaultImports": true,
    "outDir": "lib",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "strictNullChecks": true,
    "sourceMap": true,
    "rootDir": ".",
    "jsx": "react-jsx",
    "allowJs": true,
    "resolveJsonModule": true,
    "typeRoots": ["node_modules/@types"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["./src", "./types", "./config"],
  "compileOnSave": false
}
```

- [ ] **Step 4: 写入小程序项目配置**

`apps/weapp/project.config.json`：

```json
{
  "miniprogramRoot": "./dist",
  "projectname": "qianzheng-weapp",
  "description": "签证指南小程序",
  "appid": "touristappid",
  "setting": {
    "urlCheck": true,
    "es6": false,
    "enhance": false,
    "compileHotReLoad": false,
    "postcss": false,
    "minified": false
  },
  "compileType": "miniprogram"
}
```

- [ ] **Step 5: 写入 Taro 编译配置**

`apps/weapp/config/index.ts`：

```ts
import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'qianzheng-weapp',
    date: '2026-9-23',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {}
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: {
      enable: false
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain (chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain (chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
      }
    },
    rn: {
      appName: 'Qianzheng',
      postcss: {
        cssModules: {
          enable: false
        }
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
```

- [ ] **Step 6: 写入 dev/prod 配置**

`apps/weapp/config/dev.ts`：

```ts
import type { UserConfigExport } from '@tarojs/cli'

export default {
  logger: {
    quiet: false,
    stats: true
  },
  mini: {},
  h5: {}
} satisfies UserConfigExport<'webpack5'>
```

`apps/weapp/config/prod.ts`：

```ts
import type { UserConfigExport } from '@tarojs/cli'

export default {
  mini: {},
  h5: {}
} satisfies UserConfigExport<'webpack5'>
```

- [ ] **Step 7: 写入应用与首页源码**

`apps/weapp/src/app.config.ts`：

```ts
export default defineAppConfig({
  pages: ['pages/index/index'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '签证指南',
    navigationBarTextStyle: 'black'
  }
})
```

`apps/weapp/src/app.tsx`：

```tsx
import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import './app.scss'

function App ({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
  })

  return children
}

export default App
```

`apps/weapp/src/app.scss` 与 `apps/weapp/src/pages/index/index.scss` 为空文件。

`apps/weapp/src/pages/index/index.config.ts`：

```ts
export default definePageConfig({
  navigationBarTitleText: '首页'
})
```

`apps/weapp/src/pages/index/index.tsx`：

```tsx
import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import './index.scss'

export default function Index () {
  useLoad(() => {
    console.log('Page loaded.')
  })

  return (
    <View className='index'>
      <Text>Hello world!</Text>
    </View>
  )
}
```

`apps/weapp/src/index.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
  <meta content="width=device-width,initial-scale=1,user-scalable=no" name="viewport">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-touch-fullscreen" content="yes">
  <meta name="format-detection" content="telephone=no,address=no">
  <meta name="apple-mobile-web-app-status-bar-style" content="white">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>签证指南</title>
  <script><%= htmlWebpackPlugin.options.script %></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```

`apps/weapp/types/global.d.ts`：

```ts
/// <reference types="@tarojs/taro" />

declare module '*.png'
declare module '*.gif'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.styl'

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    TARO_ENV: 'weapp' | 'alipay' | 'h5' | 'rn'
    TARO_APP_ID: string
  }
}
```

- [ ] **Step 8: 安装依赖**

Run: `pnpm install`
Expected: 安装成功，Taro 4.2.1 依赖解析完整。

- [ ] **Step 9: 编译微信小程序**

Run: `pnpm --filter @vcc/weapp build:weapp`
Expected: 输出 `apps/weapp/dist/app.json`、`dist/pages/index/index.js` 等产物，无编译错误。

- [ ] **Step 10: 编译支付宝小程序**

Run: `pnpm --filter @vcc/weapp build:alipay`
Expected: 同样成功产出 dist。

- [ ] **Step 11: 提交**

```bash
git add apps/weapp
git commit -m "feat: scaffold Taro weapp/alipay mini-program"
```

## Task 4: 公共 i18n 包与一键提取脚本

**Files:**
- Create: `packages/i18n/package.json`
- Create: `packages/i18n/tsconfig.json`
- Create: `packages/i18n/locales/zh-CN.json`
- Create: `packages/i18n/locales/en.json`
- Create: `packages/i18n/locales/ja.json`
- Create: `packages/i18n/locales/ko.json`
- Create: `packages/i18n/src/index.ts`
- Create: `scripts/i18n-extract/package.json`
- Create: `scripts/i18n-extract/extract.mjs`

**Interfaces:**
- Consumes: `@vcc/types` 的 `LocaleCode`。
- Produces:
  - `@vcc/i18n` 导出 `translate(key: string, locale: LocaleCode): string` 与 `setMessages(locale: LocaleCode, messages: Record<string, string>): void`。
  - `node scripts/i18n-extract/extract.mjs --root apps/weapp/src --locales packages/i18n/locales` 扫描 `t('key')`，将缺失 key 合并进四种语言 JSON 并生成 `packages/i18n/src/keys.ts`。

- [ ] **Step 1: 编写提取脚本失败测试（TDD）**

`scripts/i18n-extract/extract.mjs` 尚未实现，先写一个自校验函数：脚本以 `--self-test` 参数运行时，用内置 fixture 断言 `collectKeys` 提取 `t('hello')` 与 `t("world")`。此时运行应失败。

- [ ] **Step 2: 运行测试确认失败**

Run: `node scripts/i18n-extract/extract.mjs --self-test`
Expected: 退出码非 0，输出 `collectKeys is not defined`。

- [ ] **Step 3: 实现脚本**

`scripts/i18n-extract/extract.mjs`：

```js
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const LOCALES = ['zh-CN', 'en', 'ja', 'ko']
const KEY_RE = /\bt\(\s*(['"])([^'"]+)\1\s*\)/g

export function collectKeys (source) {
  const keys = new Set()
  for (const match of source.matchAll(KEY_RE)) {
    keys.add(match[2])
  }
  return [...keys].sort()
}

async function walk (dir, exts = ['.ts', '.tsx']) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...await walk(full, exts))
    } else if (exts.includes(path.extname(entry.name))) {
      out.push(full)
    }
  }
  return out
}

function parseArgs (argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--self-test') args.selfTest = true
    else if (arg === '--root') args.root = argv[++i]
    else if (arg === '--locales') args.locales = argv[++i]
  }
  return args
}

async function run () {
  const args = parseArgs(process.argv.slice(2))
  if (args.selfTest) {
    const keys = collectKeys("t('hello'); t(\"world\"); t('hello')")
    if (JSON.stringify(keys) !== JSON.stringify(['hello', 'world'])) {
      console.error('self-test failed')
      process.exit(1)
    }
    console.log('self-test passed')
    return
  }

  const root = args.root
  const localesDir = args.locales
  const files = await walk(root)
  const keys = new Set()
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    for (const key of collectKeys(source)) keys.add(key)
  }

  for (const locale of LOCALES) {
    const file = path.join(localesDir, `${locale}.json`)
    const current = JSON.parse(await readFile(file, 'utf8'))
    for (const key of keys) {
      if (!(key in current)) current[key] = ''
    }
    await writeFile(file, JSON.stringify(current, null, 2) + '\n')
  }

  const typeName = 'I18nKey'
  const union = [...keys].sort().map(key => `  | ${JSON.stringify(key)}`).join('\n')
  const keysFile = path.join(path.dirname(localesDir), 'src', 'keys.ts')
  await writeFile(keysFile, `export type ${typeName} =\n${union}\n`)
  console.log(`extracted ${keys.size} keys`)
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
```

- [ ] **Step 4: 运行测试确认通过**

Run: `node scripts/i18n-extract/extract.mjs --self-test`
Expected: 输出 `self-test passed`。

- [ ] **Step 5: 创建公共词典与 t() 客户端**

四个 locale JSON 内容分别为：

`zh-CN.json`：

```json
{
  "app.name": "签证指南",
  "common.confirm": "确认",
  "common.cancel": "取消"
}
```

`en.json`：

```json
{
  "app.name": "Visa Guide",
  "common.confirm": "Confirm",
  "common.cancel": "Cancel"
}
```

`ja.json`：

```json
{
  "app.name": "ビザガイド",
  "common.confirm": "確認",
  "common.cancel": "キャンセル"
}
```

`ko.json`：

```json
{
  "app.name": "비자 가이드",
  "common.confirm": "확인",
  "common.cancel": "취소"
}
```

`packages/i18n/src/index.ts`：

```ts
import type { LocaleCode } from '@vcc/types'

const messages: Partial<Record<LocaleCode, Record<string, string>>> = {}

export function setMessages (locale: LocaleCode, value: Record<string, string>): void {
  messages[locale] = value
}

export function translate (key: string, locale: LocaleCode = 'zh-CN'): string {
  return messages[locale]?.[key] ?? key
}
```

- [ ] **Step 6: 构建并跑一次提取**

Run:
1. `pnpm --filter @vcc/i18n build`
2. `node scripts/i18n-extract/extract.mjs --root apps/weapp/src --locales packages/i18n/locales`
Expected: 生成 `packages/i18n/src/keys.ts`，四个 JSON 保持结构合法。

- [ ] **Step 7: 提交**

```bash
git add packages/i18n scripts/i18n-extract
git commit -m "feat: add shared i18n package and one-click extract script"
```

## Task 5: README 补充

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 更新 README**

把 README 改为包含以下内容的简短说明：项目定位、目录结构、安装命令 `pnpm install`、构建命令 `pnpm --filter @vcc/weapp build:weapp` 与 `build:alipay`、i18n 提取命令。

- [ ] **Step 2: 提交**

```bash
git add README.md
git commit -m "docs: document monorepo layout and commands"
```
