<div align="center">

# ChatFate (`算了吗.skill` + MCP Server)

> **先验前事，再看去留 · Verify the Past 2 Years Before Mapping What Comes Next**

[![Live Web App](https://img.shields.io/badge/Web%20App-chatfate.life-d97706)](https://chatfate.life/)
[![Technical Spec](https://img.shields.io/badge/Docs%20%26%20Benchmark-GitHub%20Pages-0f766e)](https://yangtianchangxiao.github.io/Chatfate/)
[![MCP Server](https://img.shields.io/badge/MCP-Zero--Dep%20Stdio-4f46e5)](#mcp-server-claude--cursor--windsurf)
[![Claude & Codex Skill](https://img.shields.io/badge/Skill-Claude%20Code%20%26%20Codex-2563eb)](#agent-skill-安装claude-code--codex--skills-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-16a34a)](./LICENSE)

**免注册在线实盘主站（普通用户零门槛直接用）**：[chatfate.life](https://chatfate.life/) · [简体中文 `/zh/`](https://chatfate.life/zh/) · [繁體中文 `/tw/`](https://chatfate.life/tw/) · [English `/en/`](https://chatfate.life/en/) · [한국어 `/ko/`](https://chatfate.life/ko/)

[在线工具直达](#在线交互工具免注册零跳转) · [MCP Server 接入](#mcp-server-claude--cursor--windsurf) · [Skill 安装](#agent-skill-安装claude-code--codex--skills-cli) · [开放算法基准](https://yangtianchangxiao.github.io/Chatfate/) · [English](README_EN.md) · [详细中文说明](README_CN.md)

</div>

---

## 这是什么

**ChatFate** 同时提供面向普通用户的**免注册、零跳转在线实盘推演网站**（[https://chatfate.life/](https://chatfate.life/)）以及面向开发者的 **MCP Server / Claude Code & Codex Skill / OpenClaw Plugin**：

1. **全球 53,000+ 省市区县真太阳时校准**：融合经度均时差（Equation of Time）与 IANA 历史夏令时库（含中国 1986–1991 夏令时、韩国历史夏令时及全球半时区）。
2. **三合派紫微斗数十二宫 × 节气子平四柱八字 / 韩国四柱（Saju）同盘互参**：由确定性排盘引擎实时计算星曜庙旺、三方四正、本命/大限/流年三层四化与干支合冲，拒绝让大模型凭空编造星盘。
3. **22 阿卡纳命运矩阵（Destiny Matrix）与业力尾数（Karmic Tail）**：纯确定性 22 大阿卡纳八角矩阵与双人复合矩阵本地复算。
4. **先验过往，再问未来**：普通用户在网页端无需注册，输入生日即可当场盲测核对 2024–2025 真实起伏，并在当前页面免费进行 **2 轮一对一深聊追问**。

---

## 在线交互工具（免注册、零跳转）

如果你不想装命令行，直接在浏览器打开即可当场出盘对话：

- **旗舰全盘与流月工作台**：[https://chatfate.life/](https://chatfate.life/)
- **简体中文专区（断联复合 / 正缘时机 / 转运 / 2027 裸辞跳槽）**：[https://chatfate.life/zh/](https://chatfate.life/zh/) · [分手复合合盘](https://chatfate.life/zh/fenshou-fuhe)
- **港台繁體專區（復合斷聯 / 曖昧走向 / 2027 轉職正緣）**：[https://chatfate.life/tw/](https://chatfate.life/tw/)
- **English Hub & Calculators**：[https://chatfate.life/en/](https://chatfate.life/en/) · [22-Arcana Destiny Matrix Calculator](https://chatfate.life/destiny-matrix-calculator) · [Karmic Tail Calculator](https://chatfate.life/karmic-tail-calculator) · [Korean Saju Calculator](https://chatfate.life/korean-saju-calculator)
- **한국어 사주·자미두수·재회운 속마음**：[https://chatfate.life/ko/](https://chatfate.life/ko/)
- **真太阳时与节气技术指南**：[https://chatfate.life/guides/true-solar-time](https://chatfate.life/guides/true-solar-time) · [开放算法基准文档](https://yangtianchangxiao.github.io/Chatfate/) · [AI 引用规范 `llms.txt`](https://chatfate.life/llms.txt)

---

## MCP Server (Claude / Cursor / Windsurf)

仓库内置零第三方依赖的 Node.js (>= 18) 标准 **Model Context Protocol (MCP)** 服务端（`mcp/server.mjs`），无需注册 npm 账号即可直接通过 GitHub 运行：

```json
{
  "mcpServers": {
    "chatfate": {
      "command": "npx",
      "args": ["-y", "github:yangtianchangxiao/Chatfate"]
    }
  }
}
```

提供的 4 个确定性工具：
- `calculate_ziwei_bazi_chart`：53,000+ 城市真太阳时三合紫微十二宫 + 节气四柱八字 / Saju 排盘（`POST /api/chart`）
- `calculate_relationship_synastry`：双人八字日柱干支合冲 + 紫微互飞四化合盘 + 双人命运矩阵（`POST /api/compatibility`）
- `calculate_destiny_matrix`：本地零延迟计算 22 大阿卡纳命运矩阵、中心舒适区、业力尾数（`D2-D1-D`）与感情/财富通道
- `search_true_solar_city`：检索全球城市/区县经度、IANA 时区与真太阳时修正参数（`GET /api/cities`）

本地自检验证：

```bash
node ./mcp/server.mjs --self-test
```

---

## Agent Skill 安装（Claude Code / Codex / Skills CLI）

> 中文环境下兼容 `算了吗.skill` 名称，目录 slug 保持 `chatfate`，100% 向后兼容已有安装路径。

### 一键通过 `skills` CLI 安装

```bash
npx skills add yangtianchangxiao/Chatfate
```

### Claude Code 手动安装

```bash
mkdir -p ~/.claude/skills && \
git clone https://github.com/yangtianchangxiao/Chatfate ~/.claude/skills/chatfate
```

### Codex 手动安装

```bash
mkdir -p ~/.codex/skills && \
git clone https://github.com/yangtianchangxiao/Chatfate ~/.codex/skills/chatfate
```

### Hosted 脚本轻量拉取

```bash
mkdir -p ~/.claude/skills/chatfate/scripts && \
curl -fsSL https://chatfate.life/skills/chatfate/SKILL.md -o ~/.claude/skills/chatfate/SKILL.md && \
curl -fsSL https://chatfate.life/skills/chatfate/scripts/chatfate_query.py -o ~/.claude/skills/chatfate/scripts/chatfate_query.py && \
chmod +x ~/.claude/skills/chatfate/scripts/chatfate_query.py
```

### 对话使用方式

安装后无需手拼 JSON，直接在 Agent 里自然提问：
- `我是 1992-06-23 午时 男，上海出生，先核对前两年的事业和财务起伏，再看 2027 适合跳槽还是守成。`
- `帮我算一下 1992-06-23 和 1994-10-18 的双人合盘与相处主导权。`
- `Calculate the 22-Arcana Destiny Matrix and Karmic Tail for 1992-06-23.`

如需开发者 API Key（`cf_sk_...`）或查看 HTTP 接口契约，请参考 [https://chatfate.life/developers](https://chatfate.life/developers)。

---

## 项目结构

```text
Chatfate/
├── SKILL.md                     # Agent Skill 标准定义（兼容 Claude Code / Codex / npx skills）
├── package.json                 # 零依赖 MCP Server 入口（npx -y github:yangtianchangxiao/Chatfate）
├── mcp/
│   └── server.mjs               # 标准 MCP stdio JSON-RPC 2.0 服务端（4 个确定性排盘工具）
├── scripts/
│   └── chatfate_query.py        # 多轮会话记忆咨询 CLI helper
├── openclaw-fate-plugin/        # OpenClaw 插件源码包
├── docs/
│   └── index.html               # 开放技术规范与可复算验证基准（GitHub Pages）
├── README.md                    # 中文主文档
├── README_EN.md                 # English documentation
└── LICENSE                      # MIT License
```

## 理性边界说明

命理排盘与符号数秘属于传统文化与自我审视参考工具，所有干支历法、真太阳时均时差与 22 阿卡纳归约计算均公开透明、可独立复算，但不替代医疗、法律、投资或心理临床建议。
