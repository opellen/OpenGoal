<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/opengoal-banner-light.webp">
    <img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/opengoal-banner-dark.webp" alt="OpenGoal — goal-centric AI harness"/>
  </picture>
  <p>ひとつの問い、ひとつのファイル — <code>CONTEXT.md</code>、<code>GOAL.md</code>、<code>ROADMAP.md</code></p>
  <p>
    <code>GOAL.md</code> を開けば<b>今何をすべきか</b>がわかります。<br/>
    <code>CONTEXT.md</code> を開けば<b>今の文脈</b>がわかります。<br/>
    <code>ROADMAP.md</code> を開けば<b>今の全体像</b>がわかります。
  </p>
  <p><a href="README.md">English</a> · <a href="README.ko.md">한국어</a> · <a href="README.zh-CN.md">简体中文</a> · <strong>日本語</strong></p>
</div>

> このドキュメントは英語版の翻訳であり、英語版より古い場合があります。正本は英語版です。翻訳の修正 PR を歓迎します。

## これは何か

OpenGoalは、現在のゴールをプレーンなMarkdownで可視化し、あなたとAIエージェントの双方がいつでも確認できるようにします。

npxコマンドひとつで、Markdownのスラッシュコマンドとエージェントスキルがプロジェクトにインストールされます。その後はランタイムを必要としません — CLIが処理に介在することも、フックがあなたの操作を横取りすることも、MCPサーバーがツール定義を保持し続けることもありません。ディスク上に残るのは、エージェントが読み込み、あなたが好きなエディタで編集できるMarkdownだけです。

## 何を解決するか

**今すぐやるべきことが見えない。**
現在のゴールは、状態ファイルやタスクリスト、設計文書のあちこちに散らばってしまいます。
ひとつのファイルを開くだけでは次に何をすべきか一目でわからず、それはAIエージェントにとっても同じです。
むしろエージェントの方が厄介です。最後に読んだ断片だけを頼りに、自信満々で作業を進めてしまうからです。

OpenGoalでは、ひとつの問いがひとつのファイルに対応します。

```text
ROADMAP.md  ─────────  where am I in the big picture?
     CONTEXT.md  ──────  what is this project?
            ● GOAL.md  ──  what do I do now?
```

**コンテキストを保つコストが、コンテキストそのものより高くついてはいけない。**
セッションをまたいで状態を維持しようとするフレームワークは、CLI・フック・MCPサーバーに頼りがちです。
ちょっとした調査のたびにCLIが起動し、あらゆる操作をフックが横取りし、設定済みのMCPサーバーはツール定義のためだけに、それを一度も呼ばないセッションでもトークンを消費します。永続性には払う価値がありますが、その代償には見合いません。

## クイックスタート

```bash
npx @opellen/opengoal init
```

Markdownコマンドがプロジェクトにインストールされます。これ以降はCLIを必要としません。

```
/opgl:scout          # Start session — just remember this
```

新規プロジェクトでも既存のコードベースでも、scoutが現在の状態を読み取り、次の一歩へ導いてくれます。
既存のコードがある場合はコンテキストのセットアップ(`/opgl:context`)から始まります。空のプロジェクトの場合は、会話を通じてアイデアを掘り下げるところから始まります。

ほとんどのコマンドは初回利用時に`init`を自動実行します — `/opgl:goal "my goal"`は`init`と入力しなくてもそのまま動作します。

### オプション

```bash
opengoal init --docs .planning      # Use a different path instead of docs/
opengoal init --codebase src        # Point templates at a sub-directory codebase (default: .)
opengoal init --tools cursor        # Install for a specific tool
opengoal init --tools cursor,windsurf  # Multiple tools
opengoal init --no-subagent         # Disable subagent delegation (enabled by default)
opengoal init --root path/to/proj   # Install into a different project directory
opengoal init --force               # Overwrite existing files
opengoal init --dry-run             # Preview files to install
opengoal init --prefix <name>       # Slash-command prefix (default: opgl)
opengoal init --from-prefix <name>  # Clean up command files left by a previous prefix
```

`--tools`は`Claude Code`、`Cursor`、`Windsurf`など[20以上のツール](docs/supported-tools.md)を対象にできます。

## ドキュメント構成

```
docs/
├── CONTEXT.md       ← Project context, principles, workflow
├── GOAL.md          ← Current objective and checklist
├── CHECKPOINT.md    ← Last session progress
├── DESIGN.md        ← Implementation design (as needed)
├── PLAN.md          ← Implementation plan (auto-generated for complex tasks)
├── ROADMAP.md       ← Milestone-based overall plan
├── BACKLOG.md       ← Deferred out-of-scope discoveries
├── OVERVIEW.md      ← Full project overview (as needed)
└── suspended/       ← Suspended goals and parked sub-goals
```

| ドキュメント | 答える問い | 寿命 |
|----------|-------------------|----------|
| `CONTEXT.md` | このプロジェクトは何で、どう作業すればいいか? | プロジェクトの存続期間 |
| `GOAL.md` | 今何をすべきか? | ゴール達成まで |
| `CHECKPOINT.md` | 前回のセッションはどこで終わったか? | セッションごと(上書き) |
| `DESIGN.md` | どう実装するか? | ゴール達成まで |
| `PLAN.md` | このタスクをどう実装するか? | 自動生成 → 自動アーカイブ |
| `ROADMAP.md` | 全体の中で今どこにいるか? | プロジェクトの存続期間 |
| `BACKLOG.md` | 発見したが後回しにしたことは何か? | プロジェクトの存続期間 |
| `OVERVIEW.md` | プロジェクト全体はどんな姿か? | プロジェクトの存続期間 |

`GOAL.md`だけから始めて`ROADMAP.md`へ広げていくのでも、`ROADMAP.md`で全体像を描いてから`GOAL.md`へ落とし込んでいくのでも構いません。どちらの進め方でも、OpenGoalは「今何をすべきか」をMarkdown上に見える状態に保ちます。

<details>
<summary>GOAL.mdの例</summary>

```markdown
---
id: session-auth
goal: Migrate auth from JWT to session-based
status: in-progress
started: 2026-04-04
---

## Tasks

- [x] 1. Set up session store
- [ ] 2. Replace middleware — Step 1/2 (session middleware in progress)
  - [x] 2.1. Implement session middleware
  - [ ] 2.2. Remove legacy JWT code
- [ ] 3. DB schema migration
- [ ] 4. Integration tests
```

</details>

<details>
<summary>CONTEXT.mdの例</summary>

```markdown
# Project Overview
Express + PostgreSQL REST API server.
Auth migration from JWT to session-based in progress.

# Architecture
- src/server/ — HTTP routing (Express)
- src/auth/ — Auth middleware
- src/db/ — Database access layer

# Principles
- Zero downtime during migration
- Backward compatibility with existing clients

# Resources
- DB: PostgreSQL 14, migrations via prisma
- Auth: express-session + connect-pg-simple
```

</details>

<details>
<summary>ROADMAP.mdの例</summary>

```markdown
---
id: api-v2
title: API v2 migration
status: active
started: 2026-03-01
---

- [x] **M1: Auth migration**
- [ ] **M2: Rate limiting**
- [ ] **M3: API versioning**
```

</details>

## コマンド

| | コマンド | 説明 |
|---|---------|-------------|
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-scout-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-scout.webp" alt="" width="20"/></picture> | `/opgl:scout` | セッションを開始 — ドキュメントを読み、現在の状態を評価し、次のアクションを提案します |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-go-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-go.webp" alt="" width="20"/></picture> | `/opgl:go` | ゴールを実行 — `GOAL.md`のタスクを順番に進めます |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-context-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-context.webp" alt="" width="20"/></picture> | `/opgl:context` | `CONTEXT.md`の作成と同期 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-goal-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-goal.webp" alt="" width="20"/></picture> | `/opgl:goal` | `GOAL.md`の管理(init、breakdown、checkpoint、suspend、resume、subgoal、archive) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-design-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-design.webp" alt="" width="20"/></picture> | `/opgl:design` | `DESIGN.md`の管理(init、sync、archive) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-roadmap-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-roadmap.webp" alt="" width="20"/></picture> | `/opgl:roadmap` | `ROADMAP.md`のマイルストーン管理(init、add、archive) |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-overview-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-overview.webp" alt="" width="20"/></picture> | `/opgl:overview` | `OVERVIEW.md`によるプロジェクト全体の概観 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-verify-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-verify.webp" alt="" width="20"/></picture> | `/opgl:verify` | ゴール・設計・実装の整合性を検証 |
| <picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-recap-dark.webp"><img src="https://raw.githubusercontent.com/opellen/opengoal/main/assets/icons/opengoal-icon-recap.webp" alt="" width="20"/></picture> | `/opgl:recap` | セッションの締めくくり — 決定事項を生きたドキュメントに同期 |

これらに加えて2つのスキルもインストールされます — `opengoal-flow`(いつ記録し、いつcheckpointを取り、いつ発見事項がそれ自体のゴールになるか)と`opengoal-subagent`(作業をどう分割し、メインエージェントが決して委譲しないものは何か)です。
スキルを直接呼び出すことはなく、必要なタイミングでコマンドがそれらを読み込みます。

### 呼び出し方

常に`/opgl:`と入力する必要はありません — 文脈から意図が明確な場合は、自然言語でも動作します。

| パターン | `/opgl`は必須か? | 例 |
|------|-------------------|---------|
| **明示的な呼び出し** | 必須 | `/opgl goal init`、`/opgl:goal init & design init` |
| **直前の提案への同意** | 不要 | AI: 「`/opgl:goal init`を推奨」→ You: "ok" / "go" |
| **アクティブなフロー中の継続** | 不要 | (goal init後) You: "breakdown now" |
| **タスク実行の意図** | 不要 | "proceed with task 6" → `/opgl:go`、"save progress" → `/opgl:goal checkpoint` |

文脈が明確であれば、自然言語だけで実行がトリガーされます。`/opgl`は、文脈が曖昧なときのエスケープハッチとして機能します。

## 利用の流れ

### 既存プロジェクトへの適用

```
You: /opgl:scout
AI:  既存のコードベースが見つかりました。CONTEXT.mdはまだありません。
     `/opgl:context`でプロジェクトコンテキストをセットアップしますか?

You: /opgl:context init
AI:  ✓ docs/CONTEXT.md を作成しました
     ゴールを設定するには: `/opgl:goal init`

You: /opgl:goal Migrate auth module from JWT to session-based
AI:  ✓ docs/GOAL.md を作成しました(5タスク)
     `/opgl:design init`を推奨します — ファイルレベルの意思決定を伴う実装タスクです。

You: /opgl:design init
AI:  ✓ docs/DESIGN.md を作成しました
     セッションストアの選定、移行戦略、ロールバックプランを含みます

You: /opgl:go
AI:  タスク1/5: セッションストアのセットアップ... ✓ 完了
     タスク2/5: ミドルウェアの置き換え... ✓ 完了
     タスク3/5にはDBスキーマの変更が必要です。進めますか?
```

### 新規プロジェクト

```
You: /opgl:scout Let's discuss building a real-time collaborative editor
AI:  (Discovery Mode — 技術スタック、要件、制約を検討中)
     ...
     ✓ docs/CONTEXT.md を作成しました

You: /opgl:roadmap init
AI:  ✓ docs/ROADMAP.md を作成しました
     ├── M1: コアエディタエンジン
     ├── M2: リアルタイム同期(CRDT)
     └── M3: デプロイとインフラ

You: /opgl:goal
AI:  ROADMAP.mdからM1を選択しています。
     ✓ docs/GOAL.md を作成しました

You: /opgl:goal breakdown
AI:  7つのサブタスクに分解しました

You: /opgl:goal breakdown 3
AI:  タスク3を4つのサブタスクに分解しました(3.1–3.4)

You: /opgl:go
AI:  タスク1/7: プロジェクト初期化... ✓ 完了
     タスク2/7: エディタコアの実装... ✓ 完了
     タスク3/7: CRDT同期エンジン... ✓ 完了

You: /opgl:goal checkpoint
AI:  ✓ docs/CHECKPOINT.md を保存しました
     (セッションが切れても、次のセッションで続きから再開できます)

     ... (次のセッションに続き、全タスク完了)

You: /opgl:goal archive
AI:  ✓ docs/archive/goals/2026-04-04-editor-core/ に4ファイルをアーカイブしました
     (GOAL.md、DESIGN.md、PLAN.md、CHECKPOINT.md)
     ROADMAP.mdでM1を完了にマークしました。
```

### 作業の再開

```
You: /opgl:scout
AI:  CONTEXT.md ✓ | GOAL.md ✓ (3/5完了)
     前回のセッションではAPIエンドポイントに取り組んでいました。
     `/opgl:go`で再開しますか?
```

### コンテキストの圧縮後

作業の途中で会話がコンパクション(圧縮)された場合は、コマンドを再度呼び出すだけで構いません。

```
You: /opgl:go
AI:  GOAL.md ✓ (3/7完了) — タスク4、ステップ2/3
     再開中: CRDT同期エンジンの競合解決。
```

コマンドひとつですべてが復元されます — `GOAL.md`、そしてcheckpointを取っていればそれも — 作業は最初からではなく、`— Step N/M`の注記から再開されます。まず状態レポートが欲しい場合は`/opgl:scout`を使ってください。

### ブロッカーへの対応

ゴールの途中で、先に対応しなければならない問題が発生した場合。

```
You: (during Goal A) Let's fix this dependency bug first.
AI:  提案: /opgl:goal suspend + /opgl:goal init "Fix dependency bug"
You: ok
AI:  ✓ Goal Aをdocs/suspended/goal-a/にサスペンドしました
     ✓ ブロッカー用の新しいGOAL.mdを作成しました。

     ... (ブロッカーに対応し、完了したらアーカイブ)

You: /opgl:goal resume
AI:  再開: Goal A。`/opgl:go`で続けますか?
```

入れ子になったブロッカーも同じパターンに従います — suspendは積み重なり、複数のゴールが一時停止中であればresumeが一覧を提示します。サブゴールが有効な場合は、まず`/opgl:goal subgoal pause`でそれを保留してください — サブゴールが有効な間は`suspend`と`init`は拒否されます。

### サブゴールへの対応

時には、発生した事柄がブロッカーではない場合もあります — ゴール自体は前進できます — しかしタスクよりも大きく、今すぐ必要で、ゴール自体とは種類の異なる作業であるため、`BACKLOG.md`に入れて先送りにするわけにもいきません。

```
You: (during Goal A: job-application pipeline) I need a YAML→PDF portfolio builder for this — it needs its own architecture decisions first.
AI:  Goal Aをブロックするものではありませんが、そのままインラインでやるには大きすぎます。提案: /opgl:goal subgoal init "Portfolio PDF builder"
You: ok
AI:  ✓ Goal Aをdocs/suspended/job-application-pipeline/に保留しました
     ✓ Goal Aにリンクした新しいGOAL.mdを作成しました。

     ... (ポートフォリオツールを設計・構築し、完了したらアーカイブ)

AI:  ✓ サブゴールをアーカイブしました。Goal Aに戻ります — ポインタータスクにチェックを入れました。
```

それなしではゴールが前進できない場合は、代わりにブロッカーとして保留してください — 前述を参照。

## 実際の現場では

同じゴールドキュメントが、複数年がかりのアプリケーション開発から週末プロジェクトのプラグインまでを支えます。その幅の広さこそが要点です。

**長期にわたるビルド**

- [Planura](https://github.com/opellen/Planura) — ネイティブなダイレクトモデリング3Dアプリケーション(C++20 / Qt 6 / OpenGL): half-edgeジオメトリカーネル、CSGソリッドモデリング、推論駆動の描画を、専用フレームワーク [Ordo](https://github.com/opellen/Ordo) の上に実装。
- [Ordo](https://github.com/opellen/Ordo) — Planura から切り出された C++20 の型付きイベント・アプリケーションフレームワークです。イベントはただの構造体で、型がアイデンティティ、フィールドがペイロードです。
- リバースエンジニアリングのキャンペーン — OpenGoalが設計された本来の領域であり、ゴールは大きく、道筋は不明で、進捗が細かく分割できるかどうかにかかっています。

**アプリケーションとツール**

- [SeedNote](https://github.com/opellen/Seed-Note) — Android向けの構造化ブロックエディタ(Kotlin / Jetpack Compose)
- [ScreenUse](https://github.com/opellen/Screen-Use) — 実際のアプリを操作・記録する、シナリオ駆動のUIリプレイ&検証ツール
- [OpenIllust](https://github.com/opellen/OpenIllust) — Claude Code と Codex のためのキャンペーン駆動型 AI ベクター素材制作ツールです。このリポジトリのロゴ一式も OpenIllust で制作しました。

**特化ツール**

- [Hilo](https://github.com/opellen/Hilo) — Obsidian用ハイライトプラグイン
- [Loft](https://github.com/opellen/Loft) — Obsidian用画像アップロードプラグイン

## **ギャップ**から

> **アプリケーション開発から始まったわけではありません。**
>
> OpenGoalは、ゴールが大きく、道筋が見えず、未知を検証可能な小さなステップへと分割し続けることでしか進捗を生めない仕事のために作られました。人間とエージェントが長い時間をかけてそれを手渡し合っていく — 元々は、長期にわたるリバースエンジニアリングのキャンペーンがその原型でした。それ以外の用途は、すべてこの形を受け継いでいます。
>
> **重厚なワークフローが常に必要だったわけではありません。**
>
> ちょっとした修正がしたいだけなのに、本当にここまで必要なのか? そう思うことがありました。
> 質問攻めと隙のない仕様書による徹底的な議論が、いつも必要だったわけではありません。
> 綿密なプロセスには魅力があります。ですがAIは吸収する量を増やし続け、私たちが寄りかかろうとしているセーフティネットこそが、実は行き過ぎた足かせになりつつあるのではないかと思うようになりました。
> それでも、コンテキストは残り続ける必要がありました。
>
> **「今」に集中したかった。**
>
> 仕様書やタスクリストの下敷きになっている「現在のゴール」を、そこから引っ張り出したかったのです。
> 自分にとってもAIにとっても、すぐに理解でき、集中できる「現在」を作りたかった。
> 小さく始めて大きく育てるのでも、全体像から降りてくるのでも構いません —
> どちらの方向であっても、「今何をすべきか」がすぐに見える構造が欲しかったのです。
>
> **このギャップを埋めたかった。**
>
> 私はときどきOpenSpecから始めてOpenGoalへ乗り換えたり、その逆をしたりします。
> Superpowersを組み合わせることもあります。
> うまく機能しているものは、そのままうまく使えばいい。
> 私に必要だったのは、完全性とパワーの手前に — あるいはその間に — 立てる何かでした。

## 記法

OpenGoalのコマンドとスキルは、普通の散文としては書かれていません。`## Constraints`、`(condition) => action`形式のディスパッチルール、`for each`、`loop until`といった、小さなMarkdown記法に従っています。

この形式は、疑似コードプロンプティングに関する既発表の研究に基づいています。CodeAgents(2025)は、エージェントのワークフローを散文ではなく疑似コードとして記述することで、トークン使用量を55–87%削減しつつ、タスク性能を3–36ポイント向上させたと報告しています。

構文と優先順位のルールは[docs/NOTATION.md](docs/NOTATION.md)にまとめられています — インストールしたコマンドを自分のプロジェクトで調整する際に役立ちます。この記法の背景にある根拠と研究については、[docs/notation-guide.md](docs/notation-guide.md)を参照してください。

## コントリビュート

Issueは歓迎します — バグ、質問、アイデア、異論、何でも構いません。

プラットフォームアダプター(`src/platforms/`)についてはプルリクエストを受け付けています。プロンプトテンプレートは私自身がメンテナンスしています。詳しくは[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。

### 開発

```bash
git clone https://github.com/opellen/OpenGoal.git
cd OpenGoal
npm install
npm run build
npm test
```

## ライセンス

MITライセンス — 詳細は[LICENSE](LICENSE)を参照してください。
