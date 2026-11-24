# ChatFate 详细中文说明（Web 实盘平台 + MCP Server + Agent Skill）

英文说明：[README_EN.md](./README_EN.md) · 仓库主页：[README.md](./README.md) · 开放技术基准：[yangtianchangxiao.github.io/Chatfate](https://yangtianchangxiao.github.io/Chatfate/)

`ChatFate`（Agent Skill 中文别名：`算了吗`，安装目录保持 `chatfate`）将确定性的**真太阳时三合紫微斗数十二宫**、**节气子平四柱八字 / 韩国四柱（Saju）**、**双人关系合盘**与 **22 阿卡纳命运矩阵（Destiny Matrix）**同时开放为：

1. **免注册、零跳转在线交互网站**：[https://chatfate.life/](https://chatfate.life/)（中文直达 [https://chatfate.life/zh/](https://chatfate.life/zh/)，繁中直达 [https://chatfate.life/tw/](https://chatfate.life/tw/)）
2. **零依赖标准 MCP Server**：`mcp/server.mjs`（支持 Claude Desktop、Claude Code、Cursor、Windsurf 等全部 MCP 客户端）
3. **Claude Code / Codex Skill**：`SKILL.md` + `scripts/chatfate_query.py`
4. **OpenClaw 插件**：`./openclaw-fate-plugin`

## 普通用户直接使用（无需安装）

打开网页输入公历或农历生日（支持全球 53,000+ 省市区县真太阳时校准与时辰不详反推），留在本页即可免费核对 2024–2025 真实起伏，并直接免费进行 **2 轮一对一深聊追问**：

- 旗舰工作台：[https://chatfate.life/](https://chatfate.life/)
- 分手断联与复合合盘：[https://chatfate.life/zh/fenshou-fuhe](https://chatfate.life/zh/fenshou-fuhe)
- 2027 正缘与婚恋时机：[https://chatfate.life/zh/zhengyuan-shiji](https://chatfate.life/zh/zhengyuan-shiji)
- 低谷转运窗口核对：[https://chatfate.life/zh/shenmeshihou-zhuanyun](https://chatfate.life/zh/shenmeshihou-zhuanyun)
- 2027 裸辞跳槽与单干对比：[https://chatfate.life/zh/luoci-tiaocao](https://chatfate.life/zh/luoci-tiaocao)
- 真太阳时原理与时辰交界指南：[https://chatfate.life/guides/true-solar-time](https://chatfate.life/guides/true-solar-time)

## 开发者接入

- **MCP Server 配置**：在客户端 MCP 配置文件中加入 `npx -y github:yangtianchangxiao/Chatfate` 即可挂载排盘、双人合盘、22 阿卡纳矩阵与城市经度检索 4 个工具。
- **HTTP API 契约文档**：详见 [https://chatfate.life/developers](https://chatfate.life/developers) 与 [https://chatfate.life/llms-full.txt](https://chatfate.life/llms-full.txt)。
- **CLI 多轮咨询脚本**：`scripts/chatfate_query.py` 支持 `--api-key`、`CHATFATE_API_KEY`、`~/.chatfate/api_key` 或本地自动匿名测试账户，自动通过 `~/.chatfate/sessions.json` 维护跨轮次会话上下文。
