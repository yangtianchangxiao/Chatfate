<div align="center">

# 算了吗.skill

> *“先验证过去，再问未来。”*

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skill-d97706)](https://claude.ai/code)
[![Codex](https://img.shields.io/badge/Codex-Skill-2563eb)](https://openai.com)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-Plugin-059669)](./openclaw-fate-plugin)
[![Remote API](https://img.shields.io/badge/Remote%20API-ChatFate-b45309)](https://chatfate.life/developers)
[![Credits](https://img.shields.io/badge/Billing-1%20credit%20per%20invoke-7c3aed)](https://chatfate.life/developers)

<br>

不是把一堆命理话术塞进 prompt。<br>
而是给 Agent 一套真正能调用的命理后端。<br>

**网站能用，Codex 能用，Claude Code 能用，OpenClaw 也能用。**

<br>

`算了吗.skill` 是这个 skill 的中文名。<br>
如果你在 GitHub 搜 `算了吗 skill`、`算了吗.skill`、`ChatFate skill`、`Claude Code 命理 skill`、`Codex 紫微 skill`，应该搜到这个仓库。<br>
仓库名和服务名仍然是 **ChatFate**，内部安装 slug 仍然是 `chatfate`。<br>
这样可以保持现有安装路径、API、更新方式全部稳定。<br>

[安装](#安装) · [怎么用](#怎么用) · [效果示例](#效果示例) · [API--Credit](#api--credit) · [项目结构](#项目结构) · [English](README_EN.md) · [详细中文说明](README_CN.md)

</div>

---

## 先体验

如果你只是想先直接体验效果，不想先装 skill，建议直接访问网站：

- `https://chatfate.life/`

## 这是什么

`算了吗.skill` 不是一个本地写死的算命 prompt。

它的结构是：

- 本地只装一个很轻的 skill / helper
- 真正的命盘计算、咨询编排、记忆、credit、日志都在远程 ChatFate 服务端
- 网站前台和外部 Agent 打的是同一个后端
- 以后要改 planner、expert skill、search tree、计费，都不需要用户改使用方式

这件事的重点不是“让 AI 背一些宫位解释”。
而是把命理能力做成一个 **agent-ready runtime**。

---

## 安装

### Claude Code

> 推荐直接把整个仓库 clone 成一个 skill 目录。这样 `SKILL.md`、helper 脚本、README、OpenClaw plugin 会一起带下来，后续更新也简单。

```bash
mkdir -p ~/.claude/skills && \
git clone https://github.com/yangtianchangxiao/Chatfate ~/.claude/skills/chatfate
```

### Codex

```bash
mkdir -p ~/.codex/skills && \
git clone https://github.com/yangtianchangxiao/Chatfate ~/.codex/skills/chatfate
```

### 如果你更喜欢直接拉 hosted 版本

Claude Code：

```bash
mkdir -p ~/.claude/skills/chatfate/scripts && \
curl -fsSL https://chatfate.life/skills/chatfate/SKILL.md \
  -o ~/.claude/skills/chatfate/SKILL.md && \
curl -fsSL https://chatfate.life/skills/chatfate/scripts/chatfate_query.py \
  -o ~/.claude/skills/chatfate/scripts/chatfate_query.py && \
chmod +x ~/.claude/skills/chatfate/scripts/chatfate_query.py
```

Codex：

```bash
mkdir -p ~/.codex/skills/chatfate/scripts && \
curl -fsSL https://chatfate.life/skills/chatfate/SKILL.md \
  -o ~/.codex/skills/chatfate/SKILL.md && \
curl -fsSL https://chatfate.life/skills/chatfate/scripts/chatfate_query.py \
  -o ~/.codex/skills/chatfate/scripts/chatfate_query.py && \
chmod +x ~/.codex/skills/chatfate/scripts/chatfate_query.py
```

### 直接开始用

普通终端用户现在不需要先去网站，也不需要先手填 API key。

安装后直接提问，helper 会自动：

- 在本地生成 `~/.chatfate/account.json`
- 向 ChatFate 服务端自动注册一个匿名账户
- 拿到本地可复用的 `account token`
- 进入 `100/day` 的测试配额

### 配置 API key

开发者、集成方、脚本调用仍然建议走 `API key + credits`。

推荐的一次性配置：

```bash
mkdir -p ~/.chatfate && chmod 700 ~/.chatfate && \
printf '%s' 'cf_sk_xxx' > ~/.chatfate/api_key && \
chmod 600 ~/.chatfate/api_key
```

也支持：

```bash
export CHATFATE_API_KEY="cf_sk_xxx"
```

helper 鉴权优先级：

1. `--api-key`
2. `CHATFATE_API_KEY`
3. `~/.chatfate/api_key`
4. `~/.chatfate/account.json` 里的 `account token`
5. 都没有时自动匿名开户

### 更新

如果你是 clone 安装：

```bash
git -C ~/.claude/skills/chatfate pull
# 或

git -C ~/.codex/skills/chatfate pull
```

---

## 怎么用

安装完以后，不需要再自己拼 API 请求。直接在对话里问。

### 第一轮最好这样说

- `我是 1990-06-15 子时 男，分析我的事业。`
- `我是 1990-06-15 子时 男，回溯一下前十年。`
- `我是 1990-06-15 子时 男，我哪一年财运最好？`
- `我是 1990-06-15 子时 男，只看未来十年的家庭和房产。`

### 后续就自然追问

- `那 2028 年为什么是低点？`
- `感情这条线再展开一点。`
- `如果我要换城市，应该看哪几年？`
- `重新开一轮，只看父母和家庭关系。`

### 你真正该教用户的，不是命令，而是这三件事

1. 先给出生信息
2. 一次问一个真实问题
3. 然后连续追问

---

## 效果示例

> 场景一：不是只回答单一年份，而是先看长周期

```text
用户            ❯ 分析我的事业

算了吗.skill    ❯ 我先不把这个问题压缩成某一年的流年，而是先看你的长期事业结构，
                  再接当前十年阶段，最后再落到关键窗口。

                  你的事业主轴不是“平稳升职型”，而是典型的开拓型结构。
                  早期波动大，但中段开始更适合把名声、资源、判断力转成实际控制力。
```

> 场景二：比较题会走比较，不会偷换成“讲 2026”

```text
用户            ❯ 我哪一年财运最好？

算了吗.skill    ❯ 这个问题要做年份比较，不应该只讲当前年份。
                  我会先比较当前大限里的各个关键年份，再看财帛、田宅、官禄和三方四正的联动。

                  如果只看这十年里的财富爆发窗口，最强点不是平均分布，
                  而是会集中在一到两个明显高点年份。
```

> 场景三：回溯题会按十年主轴来复盘，不会只抓一个年份敷衍

```text
用户            ❯ 回溯一下前十年

算了吗.skill    ❯ 这个问题不是要我找一个“关键年”就结束，
                  而是要把过去十年的主轴、节奏变化、关系重心、事业波动一起复盘。
                  我会先看这十年的落宫和主轴，再抽出真正的高点、低点和转折点。
```

---

## 它和普通算命 prompt 的区别

很多“AI 算命”产品，本质是：

- 用户发问题
- prompt 套模板
- 固定按几个宫位讲几段话
- 看起来像懂了，其实没有真的做决策

`算了吗.skill` 这条路不一样：

- 有远程运行时，不是纯 prompt
- 有会话记忆，不是每轮重来
- 有 API key / credits / usage，也有普通终端用户直接可用的 account token
- 有网站版、skill 版、plugin 版，不是只能在一个壳里跑
- 后端可以继续演进 planner / evaluator / trace，而用户侧安装方式不需要变

也就是说，用户装的是一个 skill，真正进化的是后端能力。

---

## API / Credit

当前统一入口：

```text
POST https://chatfate.life/api/fateclawd/invoke
```

Header：

```text
X-ChatFate-Key: cf_sk_xxx
```

最小 payload：

```json
{
  "birth_date": "1990-06-15",
  "birth_time_index": 0,
  "gender": "male",
  "question": "分析我的事业"
}
```

规则：

- 外部 Agent 调用走 `/api/fateclawd/invoke`
- `1 次 invoke = 1 credit`
- 网站前台聊天可以继续走匿名网页流，不和 agent key 混在一起
- 服务端会统一处理记忆、日志、额度和未来计费

公开入口：

- 产品首页：`https://chatfate.life/`
- developers：`https://chatfate.life/developers`
- hosted skill：`https://chatfate.life/skills/chatfate/SKILL.md`
- hosted helper：`https://chatfate.life/skills/chatfate/scripts/chatfate_query.py`

---

## 记忆与连续对话

这里有两层记忆：

1. Agent 本地线程上下文
2. ChatFate 服务端 session memory

helper 会自动做这些事：

- 本地保存 `~/.chatfate/sessions.json`
- 为这台安装生成稳定的 `client_id`
- 同一命盘 + 同一 profile 自动复用 session
- 需要时自动创建新 session
- 自动保存 user / assistant 消息
- 匿名模式下默认 `anonymous_id = client_id`

如果你想强制开新线程，可以这样：

```bash
python3 scripts/chatfate_query.py \
  --birth-date 1990-06-15 \
  --birth-time 子时 \
  --gender male \
  --profile annual-review \
  --new-session \
  --question "回溯一下前十年"
```

---

## 项目结构

```text
chatfate/
├── SKILL.md
├── scripts/
│   └── chatfate_query.py
├── openclaw-fate-plugin/
│   ├── README.md
│   ├── QUICKSTART_CN.md
│   ├── index.ts
│   ├── openclaw.plugin.json
│   └── package.json
├── README.md
├── README_CN.md
└── README_EN.md
```

---

## 适合谁

- 想给 Claude Code / Codex 一个真正可调用的命理能力的人
- 想让 OpenClaw 也能直接接入的人
- 想把网站版和 Agent 版统一到同一后端的人
- 想做 API / credit / usage / memory，而不是一次性 demo 的人

---

## 注意事项

- 请不要猜出生时辰；时辰不准，后面都容易偏
- 第一轮最好直接把出生信息和问题一起给全
- 如果你只是想给终端用户用，不要把 helper flags 教给他们
- 如果你是开发者，再去用 `profile / new-session / api-key` 这些高级控制

---

### 写在最后

很多人做“AI 命理”，做着做着就退回到模板。

因为模板最省事，最像“已经完成”，也最容易假装自己有 Agent。

但如果真想让命理能力进入 Agent 世界，重点不是把文案写得更玄，
而是把这件事做成一个稳定、可调用、可计费、可演进的运行时。

`算了吗.skill` 只是这个入口名。
真正跑在后面的，是 ChatFate。
