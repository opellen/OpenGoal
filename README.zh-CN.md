<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/opengoal-banner-light.webp">
    <img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/opengoal-banner-dark.webp" alt="OpenGoal — goal-centric AI harness"/>
  </picture>
  <p>一个问题，一个文件 — <code>CONTEXT.md</code>、<code>GOAL.md</code>、<code>ROADMAP.md</code></p>
  <p>
    打开 <code>GOAL.md</code>，看到<b>现在该做什么</b>。<br/>
    打开 <code>CONTEXT.md</code>，看到<b>当前的上下文</b>。<br/>
    打开 <code>ROADMAP.md</code>，看到<b>当前的大局</b>。
  </p>
  <p><a href="README.md">English</a> · <a href="README.ko.md">한국어</a> · <strong>简体中文</strong> · <a href="README.ja.md">日本語</a></p>
</div>

> 本文档是英文版的翻译，可能滞后于英文版，以英文版为准。欢迎提交 PR 修正翻译。

## 这是什么？

OpenGoal 让当前目标始终以纯 markdown 的形式呈现，对你和你的 AI 智能体都清晰可见。

一条 npx 命令，就能把 markdown 斜杠命令和智能体技能安装进你的项目。此后不存在运行时
——没有 CLI 参与其中，没有钩子拦截你的操作，也没有 MCP 服务器让工具定义常驻占用。留在
磁盘上的，只是你的智能体会读取、而你可以用任何编辑器修改的 markdown。

## 它解决什么问题？

**现在该做什么，看不见。**
当前目标散落在各种状态文件、任务列表和设计文档之中。
你无法打开一个文件就立刻看到接下来该做什么——你的智能体也做不到，而这更糟糕，
因为它会毫不犹豫地依据自己最后读到的那个片段继续推进。

在 OpenGoal 中，一个问题对应一个文件。

```text
ROADMAP.md  ─────────  我在大局中处于哪个位置？
     CONTEXT.md  ──────  这个项目是什么？
            ● GOAL.md  ──  我现在该做什么？
```

**维持上下文的代价，不该比上下文本身还大。**
试图跨会话维持状态的框架，往往依赖 CLI、钩子和 MCP 服务器。哪怕只是一次轻量的探索，
也会触发一次 CLI 运行；钩子会拦截每一个动作；而配置好的 MCP 服务器，即便在从不调用它
的会话里，也照样把 token 花在工具定义上。让状态持久化，这份投入是值得的；但这样的代价
不值得。

## 快速开始

```bash
npx @opellen/opengoal init
```

项目中会安装好 markdown 命令。此后不再需要任何 CLI。

```
/opgl:scout          # 开始会话 — 只要记住这一个命令就够了
```

无论是新项目还是已有代码库，scout 都会读取当前状态并引导你走向下一步。
已有代码？那就从设置项目上下文开始（`/opgl:context`）。空项目？那就先通过对话来
梳理你的想法。

大多数命令会在首次使用时自动执行 `init`——不用先手动敲 `init`，直接执行
`/opgl:goal "我的目标"` 就能立即开始。

### 选项

```bash
opengoal init --docs .planning      # 使用 docs/ 以外的其他路径
opengoal init --codebase src        # 将模板指向某个子目录下的代码库（默认：.）
opengoal init --tools cursor        # 只为指定工具安装
opengoal init --tools cursor,windsurf  # 同时安装到多个工具
opengoal init --no-subagent         # 关闭子智能体委派（默认开启）
opengoal init --root path/to/proj   # 安装到另一个项目目录
opengoal init --force               # 覆盖已存在的文件
opengoal init --dry-run             # 预览将要安装的文件
opengoal init --prefix <name>       # 斜杠命令前缀（默认：opgl）
opengoal init --from-prefix <name>  # 清理旧前缀遗留下的命令文件
```

`--tools` 支持 `Claude Code`、`Cursor`、`Windsurf`，以及[另外 20 多种工具](docs/supported-tools.md)。

## 文档结构

```
docs/
├── CONTEXT.md       ← 项目上下文、原则、工作流程
├── GOAL.md          ← 当前目标与任务清单
├── CHECKPOINT.md    ← 上一次会话的进度
├── DESIGN.md        ← 实现设计（按需）
├── PLAN.md          ← 实现计划（复杂任务时自动生成）
├── ROADMAP.md       ← 以里程碑组织的整体计划
├── BACKLOG.md       ← 暂缓处理的范围外发现
├── OVERVIEW.md      ← 项目全貌总览（按需）
└── suspended/       ← 被中止的目标与暂存的子目标
```

| 文档 | 回答的问题 | 生命周期 |
|----------|-------------------|----------|
| `CONTEXT.md` | 这个项目是什么，我该怎么参与？ | 项目全程 |
| `GOAL.md` | 我现在该做什么？ | 直到目标达成 |
| `CHECKPOINT.md` | 上次会话进行到哪了？ | 按会话（每次覆盖） |
| `DESIGN.md` | 这个要怎么实现？ | 直到目标达成 |
| `PLAN.md` | 这个任务要怎么实现？ | 自动生成 → 自动归档 |
| `ROADMAP.md` | 我在大局中处于哪个位置？ | 项目全程 |
| `BACKLOG.md` | 我发现了什么，但先放一放？ | 项目全程 |
| `OVERVIEW.md` | 整个项目大致是什么样子？ | 项目全程 |

可以只从 `GOAL.md` 开始，再逐步扩展到 `ROADMAP.md`；也可以先在 `ROADMAP.md` 里画出
大局，再逐步细化到 `GOAL.md`。无论哪个方向，OpenGoal 都会把"现在该做什么"保持在
markdown 中清晰可见。

<details>
<summary>GOAL.md 示例</summary>

```markdown
---
id: session-auth
goal: 将认证从 JWT 迁移到基于会话（session）
status: in-progress
started: 2026-04-04
---

## Tasks

- [x] 1. 搭建会话存储
- [ ] 2. 替换中间件 — Step 1/2（会话中间件进行中）
  - [x] 2.1. 实现会话中间件
  - [ ] 2.2. 移除旧的 JWT 代码
- [ ] 3. 数据库 schema 迁移
- [ ] 4. 集成测试
```

</details>

<details>
<summary>CONTEXT.md 示例</summary>

```markdown
# Project Overview
基于 Express + PostgreSQL 的 REST API 服务器。
认证正在从 JWT 迁移到基于会话（session）的方式。

# Architecture
- src/server/ — HTTP 路由（Express）
- src/auth/ — 认证中间件
- src/db/ — 数据库访问层

# Principles
- 迁移过程中零停机
- 与现有客户端保持向后兼容

# Resources
- 数据库：PostgreSQL 14，通过 prisma 管理迁移
- 认证：express-session + connect-pg-simple
```

</details>

<details>
<summary>ROADMAP.md 示例</summary>

```markdown
---
id: api-v2
title: API v2 迁移
status: active
started: 2026-03-01
---

- [x] **M1：认证迁移**
- [ ] **M2：限流**
- [ ] **M3：API 版本管理**
```

</details>

## 命令

| | 命令 | 说明 |
|---|---------|-------------|
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-scout-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-scout.webp" alt="" width="20"/></picture> | `/opgl:scout` | 开始会话 — 读取文档、评估当前状态、给出下一步建议 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-go-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-go.webp" alt="" width="20"/></picture> | `/opgl:go` | 执行目标 — 按顺序推进 `GOAL.md` 中的任务 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-context-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-context.webp" alt="" width="20"/></picture> | `/opgl:context` | 创建并同步 `CONTEXT.md` |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-goal-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-goal.webp" alt="" width="20"/></picture> | `/opgl:goal` | `GOAL.md` 管理（init、breakdown、checkpoint、suspend、resume、subgoal、archive） |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-design-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-design.webp" alt="" width="20"/></picture> | `/opgl:design` | `DESIGN.md` 管理（init、sync、archive） |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-roadmap-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-roadmap.webp" alt="" width="20"/></picture> | `/opgl:roadmap` | `ROADMAP.md` 里程碑管理（init、add、archive） |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-overview-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-overview.webp" alt="" width="20"/></picture> | `/opgl:overview` | `OVERVIEW.md` 项目全貌总览 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-verify-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-verify.webp" alt="" width="20"/></picture> | `/opgl:verify` | 验证目标、设计与实现之间的一致性 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-recap-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-recap.webp" alt="" width="20"/></picture> | `/opgl:recap` | 会话收尾 — 把讨论中产生的决定同步进长期文档 |

随同这些命令一起安装的还有两个技能——`opengoal-flow`（什么时候该写文档、什么时候该
记录 checkpoint、什么时候一个新发现该独立成一个目标）和 `opengoal-subagent`（工作
如何拆分，以及主智能体绝不外包的部分）。你不需要直接调用某个技能；命令会在需要时
自动加载它们。

### 调用方式

你不必每次都输入 `/opgl:`——当意图从上下文中已经足够清晰时，自然语言同样能触发执行。

| 路径 | 是否需要 `/opgl` | 示例 |
|------|-------------------|---------|
| **显式调用** | 需要 | `/opgl goal init`、`/opgl:goal init & design init` |
| **确认最近的建议** | 不需要 | AI："建议执行 `/opgl:goal init`" → 用户："ok" / "继续" |
| **活跃流程中的延续** | 不需要 | （goal init 之后）用户："breakdown 一下" |
| **任务执行意图** | 不需要 | "继续做任务 6" → `/opgl:go`，"保存一下进度" → `/opgl:goal checkpoint` |

只要上下文足够清晰，单靠自然语言就能触发执行；上下文含糊不清时，`/opgl` 就是明确
的兜底方式。

## 使用流程

### 应用到已有项目

```
You: /opgl:scout
AI:  发现了一个已有代码库，还没有 CONTEXT.md。
     要用 `/opgl:context` 设置项目上下文吗？

You: /opgl:context init
AI:  ✓ docs/CONTEXT.md 已创建
     要设置目标，请用：`/opgl:goal init`

You: /opgl:goal 将认证模块从 JWT 迁移到基于会话
AI:  ✓ docs/GOAL.md 已创建（5 个任务）
     建议执行 `/opgl:design init` —— 这是一个涉及文件级决策的实现任务。

You: /opgl:design init
AI:  ✓ docs/DESIGN.md 已创建
     已包含会话存储选型、迁移策略、回滚方案

You: /opgl:go
AI:  Task 1/5：搭建会话存储... ✓ done
     Task 2/5：替换中间件... ✓ done
     Task 3/5 需要修改数据库 schema，是否继续？
```

### 新项目

```
You: /opgl:scout 我们来聊聊做一个实时协作编辑器吧
AI:  （Discovery Mode — 探索技术栈、需求与约束条件）
     ...
     ✓ docs/CONTEXT.md 已创建

You: /opgl:roadmap init
AI:  ✓ docs/ROADMAP.md 已创建
     ├── M1：核心编辑器引擎
     ├── M2：实时同步（CRDT）
     └── M3：部署与基础设施

You: /opgl:goal
AI:  从 ROADMAP.md 中选取 M1。
     ✓ docs/GOAL.md 已创建

You: /opgl:goal breakdown
AI:  已拆解为 7 个子任务

You: /opgl:goal breakdown 3
AI:  已将 Task 3 拆解为 4 个子任务（3.1–3.4）

You: /opgl:go
AI:  Task 1/7：项目初始化... ✓ done
     Task 2/7：编辑器核心实现... ✓ done
     Task 3/7：CRDT 同步引擎... ✓ done

You: /opgl:goal checkpoint
AI:  ✓ docs/CHECKPOINT.md 已保存
     （如果会话中断，下一次会从这里接着来）

     ...（在下一个会话中继续，直到所有任务完成）

You: /opgl:goal archive
AI:  ✓ 已将 4 个文件归档到 docs/archive/goals/2026-04-04-editor-core/
     （GOAL.md、DESIGN.md、PLAN.md、CHECKPOINT.md）
     已在 ROADMAP.md 中把 M1 标记为完成。
```

### 恢复工作

```
You: /opgl:scout
AI:  CONTEXT.md ✓ | GOAL.md ✓（3/5 已完成）
     你在上一次会话中正在处理 API 接口相关的工作。
     要用 `/opgl:go` 继续吗？
```

### 上下文压缩之后

如果对话在工作过程中被压缩（compact），只需重新调用命令即可：

```
You: /opgl:go
AI:  GOAL.md ✓（3/7 已完成） — Task 4，Step 2/3
     正在继续：CRDT 同步引擎中的冲突解决。
```

一条命令就能把一切找回来——`GOAL.md`，以及你保存过的 checkpoint（如果有的话）——
工作会从 `— Step N/M` 这个标注处继续，而不是从头开始。如果想先看一份状态报告，
用 `/opgl:scout`。

### 处理阻塞项

当目标进行到一半时，出现了必须优先处理的事情：

```
You:（目标 A 进行中）先修一下这个依赖问题吧。
AI:  建议：/opgl:goal suspend + /opgl:goal init "修复依赖问题"
You: ok
AI:  ✓ 目标 A 已中止并保存到 docs/suspended/goal-a/
     ✓ 已为这个阻塞项创建新的 GOAL.md。

     ...（处理完阻塞项后归档）

You: /opgl:goal resume
AI:  已恢复：目标 A。要用 /opgl:go 继续吗？
```

嵌套的阻塞项遵循同样的模式——`suspend` 会像栈一样层层堆叠，`resume` 在有多个目标
被暂停时会给出一个列表供选择。如果当前有 sub-goal 处于活跃状态，请先用
`/opgl:goal subgoal pause` 将它暂存——只要有 sub-goal 处于活跃状态，`suspend` 和
`init` 都会被拒绝执行。

### 处理子目标

有时候冒出来的事情并不是阻塞项——目标依然可以继续推进——但它比一个任务更大、
现在就需要处理、而且和目标本身的性质不同，所以也不能简单地丢进 `BACKLOG.md`
里等着：

```
You:（目标 A：求职申请流水线 进行中）我需要一个 YAML→PDF 的作品集生成工具——
    这个得先做一些架构上的决策。
AI:  不会阻塞目标 A，但直接内联处理又太大了。建议：
     /opgl:goal subgoal init "作品集 PDF 生成工具"
You: ok
AI:  ✓ 目标 A 已暂存到 docs/suspended/job-application-pipeline/
     ✓ 已创建新的 GOAL.md，并与目标 A 关联。

     ...（设计并构建作品集工具，完成后归档）

AI:  ✓ sub-goal 已归档。回到目标 A —— 对应的指针任务已勾选完成。
```

如果没有它目标就完全无法推进，那就应该把它当作阻塞项处理——参见上文。

## 实践案例

同样一套目标文档，既能撑起一个开发多年的应用，也能撑起一个周末就能完成的插件。
这种跨度正是关键所在。

**长周期开发**

- [Planura](https://github.com/opellen/Planura) — 一款原生的直接建模 3D 应用
  （C++20 / Qt 6 / OpenGL）：半边（half-edge）几何内核、CSG 实体建模、推理驱动的
  绘图，构建在自研框架 [Ordo](https://github.com/opellen/Ordo) 之上。
- [Ordo](https://github.com/opellen/Ordo) — 从 Planura 中提取出来的 C++20 类型化事件应用框架。
  事件就是一个普通的结构体：类型即身份，字段即载荷。
- 逆向工程项目 — OpenGoal 最初就是为这类场景设计的：目标庞大、路径未知，
  进展全靠把任务拆得足够细。

**应用与工具**

- [SeedNote](https://github.com/opellen/Seed-Note) — 一款面向 Android 的结构化块编辑器（Kotlin / Jetpack Compose）
- [ScreenUse](https://github.com/opellen/Screen-Use) — 一款场景驱动的 UI 回放与验证工具，能驱动真实应用并录制过程
- [OpenIllust](https://github.com/opellen/OpenIllust) — 面向 Claude Code 与 Codex 的、以 campaign 为单位的 AI
  矢量素材生产工具。本仓库的 logo 套件正是用它制作的。

**专注型工具**

- [Hilo](https://github.com/opellen/Hilo) — 一款 Obsidian 高亮插件
- [Loft](https://github.com/opellen/Loft) — 一款 Obsidian 图片上传插件

## 源于**空白**

> **一开始，它跟应用开发没什么关系。**
>
> OpenGoal 是为那种目标庞大、路径完全未知的工作而生的——进展只能靠把未知拆成
> 一个个足够小、能验证的步骤，让人和智能体在很长的时间跨度里来回接力完成。
> 最初的场景，是旷日持久的逆向工程项目。后来它被用到的所有其他地方，
> 都继承了这个基本形态。
>
> **繁重的流程，并不总是必要的。**
>
> 我其实只是想做一个小修复——真的需要搞这么大阵仗吗？
> 连环追问式的详尽讨论、滴水不漏的规格说明，并不总是必要的。
> 严谨的流程当然有它的吸引力。但 AI 能吞下的东西越来越多，
> 我开始觉得，我们想要依赖的那些安全网，很多时候其实变成了过度的枷锁。
> 可上下文，终究还是要留住的。
>
> **我想把注意力放回当下。**
>
> 我想把"现在的目标"从层层规格和任务列表底下拽出来。
> 我想创造一个我和 AI 都能立刻理解、立刻专注的"当下"。
> 无论是从小处起步慢慢长大，还是从大局出发逐步下钻——
> 不管哪个方向，我都想要一种"现在该做什么"能立刻被看见的结构。
>
> **我想填补这处空白。**
>
> 我有时候从 OpenSpec 开始，中途转到 OpenGoal，反过来也一样；
> 有时候我会用上 Superpowers。
> 好用的东西，就该继续被好好用。
> 我需要的是一样能站在"完整"与"强大"之前——或者说，介于两者之间——的东西。

## 标记法

OpenGoal 的命令和技能并不是用普通散文写成的，而是遵循一套精简的 markdown 标记法
——`## Constraints`、`(condition) => action` 式的分派规则、`for each`、`loop until`。

这种形式借鉴了关于伪代码提示（pseudocode prompting）的已发表研究。CodeAgents
（2025）的报告显示，用伪代码而非散文描述智能体工作流，能将 token 用量降低
55–87%，同时将任务表现提升 3–36 分。

语法和优先级规则记录在 [docs/NOTATION.md](docs/NOTATION.md) 中——如果你要调整
项目里已安装的命令，会用得上。这套标记法背后的原理和研究背景，参见
[docs/notation-guide.md](docs/notation-guide.md)。

## 贡献

欢迎提交 Issue——无论是 bug、疑问、想法，还是不同意见。

平台适配器（`src/platforms/`）部分接受 Pull Request；提示词模板（prompt templates）
由我自己维护。详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 本地开发

```bash
git clone https://github.com/opellen/OpenGoal.git
cd OpenGoal
npm install
npm run build
npm test
```

## 许可证

MIT 许可证——详见 [LICENSE](LICENSE)。
