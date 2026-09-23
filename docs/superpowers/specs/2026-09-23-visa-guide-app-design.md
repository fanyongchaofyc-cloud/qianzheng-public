# 签证指南 App 设计文档

日期：2026-09-23
状态：待评审

## 1. 背景与目标

办理签证流程复杂、环节多、规则随目的地和申请人条件变化。本产品通过“条件式引导 + 个性化清单 + 进度跟踪”帮助用户完成签证办理，降低信息搜集和材料遗漏成本。

第一阶段只覆盖旅游签证，但数据模型预留签证类型扩展能力，后续支持留学、商务、探亲等类型。

## 2. 范围

### 2.1 第一阶段

- 平台：微信小程序、支付宝小程序
- 签证类型：旅游签
- 目的地：日本、韩国、申根（法国、德国、意大利）、美国
- 核心能力：条件式引导、材料清单、步骤时间线、费用估算、进度跟踪、基础提醒、可选材料附件上传
- 语言：zh-CN、en、ja、ko

### 2.2 后续阶段

- React Native App（Android / iOS）
- 内容与规则管理后台
- 留学签、商务签、探亲签
- 新加坡、泰国、马来西亚、阿联酋、英国、澳大利亚、加拿大
- 行前要求、入境政策等轻内容库

### 2.3 暂不做

- 第一版不引入 AI 对话式签证问答
- 不接入代递签、支付签证费、机票酒店预订等交易闭环
- 不把签证规则抓取自动化作为上线前提

## 3. 用户主流程

1. 选择目的地和签证类型。
2. 回答少量条件问题：户籍、出行目的、是否首签、是否有邀请方、停留天数等。
3. 系统生成个性化材料清单、办理步骤、时间线和费用估算。
4. 用户逐项确认、上传或记录材料。
5. 关键节点提醒：预约、递签、补材料、取签、护照寄回。
6. 用户可随时查看资料库、常见问题和已保存进度。

## 4. 总体技术选型

### 4.1 推荐方案

小程序使用 Taro + React + TypeScript，App 使用 React Native，共享业务内核。理由：

- Taro 一套代码可编译微信和支付宝小程序，启动快。
- React Native 可复用 TypeScript 业务逻辑，同时获得比 Taro RN 输出更稳定的原生体验。
- 规则引擎、API 客户端、i18n、设计变量可跨端共享。

### 4.2 备选方案

1. Taro 全包：小程序、H5、App 全部由 Taro 输出。最快，但 App 原生体验和插件能力较弱。
2. Taro 小程序 + Flutter App：App 体验最好，但 Dart 无法复用 TypeScript 业务逻辑，初期成本高。

默认采用推荐方案。若团队更熟悉 Vue，可替换为 Taro Vue + uni-app/其他 App 方案，但 monorepo 和领域边界保持不变。

## 5. Monorepo 结构

使用 pnpm workspaces + Turborepo。

```text
.
├── apps/
│   ├── weapp/                 # Taro，编译微信与支付宝小程序
│   ├── mobile/                # React Native App
│   ├── server/                # Node.js 后端 API
│   └── admin/                 # 内容与规则管理后台
├── packages/
│   ├── visa-engine/           # 签证规则引擎，生成清单和步骤
│   ├── api-client/            # 统一接口客户端
│   ├── i18n/                  # 公共多语言词典与工具
│   ├── design-tokens/         # 颜色、字号、间距等设计变量
│   ├── types/                 # 共享 TypeScript 类型
│   └── utils/                 # 共享工具
├── scripts/
│   └── i18n-extract/          # 一键文案提取与合并
└── docs/
```

### 5.1 依赖原则

- `visa-engine` 只依赖 `types`，不依赖任何前端框架。
- `api-client` 只依赖 `types`，负责接口请求和错误标准化。
- `i18n` 只放前后端公共文案，端专属文案放各自 app 目录。
- 应用层可以依赖 packages，packages 不得反向依赖 apps。

## 6. 签证规则引擎

### 6.1 设计目标

规则不能写死在页面或接口里。规则由结构化数据描述，政策变化时优先改数据、少改代码。

### 6.2 核心实体

- `Destination`：目的地国家或地区，如 Japan、Schengen、UnitedStates。
- `VisaCategory`：签证类型，第一阶段只有 Tourist，预留 Student、Business、FamilyVisit。
- `Scenario`：适用场景，描述条件组合。
- `Condition`：条件项，如护照有效期、户籍、首签、出行目的。
- `RequirementItem`：材料项，如护照、照片、在职证明、银行流水。
- `ProcessStep`：办理步骤，如填表、预约、递签、取签。
- `TimelineEvent`：时间节点与提醒规则。
- `FeeItem`：费用项，使用数值加币种代码，不做本地化金额换算。
- `PolicyVersion`：规则版本，包含生效时间和发布状态。

### 6.3 清单生成流程

输入用户答案，规则引擎按 `Destination + VisaCategory + Scenario` 匹配规则，计算适用的材料、步骤、时间线和费用。输出结果需包含命中的规则版本，便于追溯。

### 6.4 第一阶段维护方式

规则先以 JSON/YAML 文件存在 `packages/visa-engine/data` 中，由代码评审保证准确。管理后台完成后再迁移到数据库和 CMS。

## 7. 前端方案

### 7.1 小程序

- 框架：Taro 4.x + React + TypeScript
- UI：NutUI React，按需引入，支持微信、支付宝等多端
- 状态：React Query 负责服务端状态，Zustand 负责本地会话状态
- 页面风格：短问题向导、卡片式清单、时间线，避免长表单

### 7.2 App

- 框架：React Native + TypeScript
- UI：React Native 组件库，复用 `design-tokens` 保证视觉一致
- 业务逻辑复用 `packages/visa-engine`、`packages/api-client`、`packages/i18n`

### 7.3 交互原则

- 所有流程可保存、可回退。
- 条件问题尽量少，默认值合理，减少用户输入。
- 清单项可展开查看说明和模板。
- 政策页面必须显示版本、更新时间和免责声明。

## 8. 后端方案

- 运行时：Node.js + TypeScript
- 框架：NestJS
- 数据库：PostgreSQL
- 缓存与队列：Redis
- 对象存储：护照、材料图片等附件，第一阶段可先使用云对象存储

### 8.1 服务模块

- 用户与登录：微信、支付宝授权，手机号绑定
- 签证案例：用户当前办理案例、答案、清单状态、进度
- 规则与内容：签证规则查询、资料库、常见问题
- 通知：短信、邮件、小程序订阅消息、Push、站内信
- 后台管理：规则、内容、翻译、通知模板

### 8.2 API 约定

- REST/JSON 为主，后续可引入 GraphQL 按需聚合。
- 统一响应结构。
- 统一错误码和本地化错误消息。
- 语言通过 `lang` 查询参数或 `Accept-Language` 协商。

## 9. 国际化方案

### 9.1 文案分类

1. 系统/静态文案：错误提示、校验消息、枚举标签。
2. 业务内容：签证规则、材料、步骤、FAQ、国家政策。
3. 通知模板：短信、邮件、订阅消息、Push、站内信。

### 9.2 系统/静态文案

后端使用 i18next，词典按语言目录存放：

```text
apps/server/locales/
├── zh-CN/messages.json
├── en/messages.json
├── ja/messages.json
└── ko/messages.json
```

接口返回稳定错误码和本地化消息：

```json
{
  "code": "VISA_RULE_NOT_FOUND",
  "message": "未找到对应的签证规则"
}
```

语言优先级：请求 `lang` 或 `Accept-Language` > 用户偏好 > 默认 `zh-CN`。语言代码使用白名单。

### 9.3 业务内容

结构化内容的可翻译字段使用 JSONB：

```json
{
  "name": {
    "zh-CN": "护照原件",
    "en": "Original passport",
    "ja": "パスポート原本",
    "ko": "여권 원본"
  }
}
```

接口只返回目标语言和兜底信息：

```json
{
  "locale": "en",
  "fallbackLocale": "zh-CN",
  "name": "Original passport"
}
```

### 9.4 通知模板

按渠道和语言存储，字段包括：`code`、`channel`、`locale`、`subject`、`body`、`variables`、`version`、`status`。正文使用 `{{variable}}` 占位符，渲染时插值并按语言格式化日期和数字。

### 9.5 一键提取

提取脚本扫描：

```text
apps/server/src
apps/weapp/src
apps/mobile/src
packages/*
```

扫描 `t('key')` 和 JSX 文本，自动合并到各语言词典，并生成 TypeScript 类型。

数据库中的业务内容不能从代码提取，管理后台提供“翻译中心”：展示缺失翻译、支持 XLIFF/JSON 导入导出，可选机器翻译后人工确认。

### 9.6 边界

- `packages/i18n`：公共枚举和通用文案。
- `apps/server/locales`：后端专属文案。
- `apps/weapp/locales`、`apps/mobile/locales`：端专属 UI 文案。

## 10. 数据与状态

### 10.1 主要数据实体

- `User`：用户、登录方式、语言偏好、通知偏好
- `VisaCase`：目的地、签证类型、当前答案、状态、进度
- `CaseItem`：用户清单项状态、备注、附件
- `Destination`、`VisaCategory`、`RequirementItem`、`ProcessStep`、`PolicyVersion`
- `Notification`：通知记录、渠道、状态
- `Content`、`Faq`

### 10.2 状态流转

签证案例建议状态：`draft` → `in_progress` → `ready_to_submit` → `submitted` → `completed`，并允许 `archived`。

## 11. 提醒与通知

- 提醒类型：预约开始、材料截止、递签日期、取签/寄回。
- 渠道优先级：小程序订阅消息 > Push > 短信。
- 所有提醒带时区和语言偏好，避免日期显示错误。

## 12. 发布顺序

1. 建立 monorepo、设计变量、i18n 提取脚本、规则引擎骨架。
2. 上线微信小程序，完成日本、韩国、申根、美国旅游签引导与清单。
3. 接入支付宝小程序，完成账号和进度同步。
4. 增加提醒、通知和基础后台。
   - 这一阶段先做规则和内容维护的最小后台，满足运营改数据。
5. 开发 React Native App。
6. 正式上线多语言翻译中心和完整运营后台，扩展留学/商务签和第二批国家。

## 13. 风险与对策

- 签证政策频繁变化：规则版本化、发布审核、政策更新时间展示。
- 规则准确性：所有正式规则需人工复核，并展示免责声明。
- 多端差异：统一 API 和 i18n，端上只处理平台交互差异。
- 翻译质量：机器翻译仅辅助，正式发布需人工确认。
- 合规：涉及护照等敏感信息时，仅保存最小必要字段，附件加密存储，明确隐私政策。

## 14. 假设

- 第一版面向中国出发用户，默认语言 zh-CN。
- 旅游签为第一版唯一签证类型。
- 团队可使用 React + TypeScript 技术栈。
- 签证规则由人工维护，不依赖自动化爬取。
- 游客可浏览内容；保存进度、同步多端、上传附件需要登录。
- 第一版支持护照和材料图片作为可选附件上传，但不代用户向官方提交。
- 费用信息作为估算展示，不作为实际收费依据。

## 15. 待确认事项

- 第一批四个目的地的官方规则来源和复核责任方尚未指定。
- 多语言翻译由内部完成还是接入外部翻译服务。
