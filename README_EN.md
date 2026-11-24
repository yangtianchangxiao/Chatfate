# ChatFate — True Solar Time Zi Wei Dou Shu, BaZi / Korean Saju & Destiny Matrix (MCP Server + Agent Skill)

[![Live Web Platform](https://img.shields.io/badge/Web%20Platform-chatfate.life-d97706)](https://chatfate.life/en/)
[![Open Technical Spec](https://img.shields.io/badge/Technical%20Benchmark-GitHub%20Pages-0f766e)](https://yangtianchangxiao.github.io/Chatfate/)
[![License: MIT](https://img.shields.io/badge/License-MIT-16a34a)](./LICENSE)

**ChatFate** combines a **no-signup interactive web consultation platform** ([https://chatfate.life/](https://chatfate.life/)) with an open-source **Model Context Protocol (MCP) Server**, **Claude Code / Codex Skill**, and **OpenClaw Plugin**.

Instead of asking LLMs to guess astronomical pillars or star placements in raw text prompts, ChatFate computes exact **Sanhe Zi Wei Dou Shu (紫微斗数)** twelve-palace charts, **Solar-Term Four Pillars BaZi / Korean Saju (사주팔자)**, **Dual Relationship Synastry**, and **22-Arcana Destiny Matrix & Karmic Tail** charts deterministically.

---

## Try Immediately in Browser (No Signup, Zero Redirect)

- **English Hub**: [https://chatfate.life/en/](https://chatfate.life/en/)
- **22-Arcana Destiny Matrix Calculator**: [https://chatfate.life/destiny-matrix-calculator](https://chatfate.life/destiny-matrix-calculator)
- **Karmic Tail Calculator (`15-20-5`, `18-9-9`, etc.)**: [https://chatfate.life/karmic-tail-calculator](https://chatfate.life/karmic-tail-calculator)
- **Destiny Matrix Couple Compatibility**: [https://chatfate.life/destiny-matrix-compatibility](https://chatfate.life/destiny-matrix-compatibility)
- **Korean Saju Four Pillars Calculator (in English)**: [https://chatfate.life/korean-saju-calculator](https://chatfate.life/korean-saju-calculator)
- **True Solar Time & Longitude Guide**: [https://chatfate.life/guides/true-solar-time](https://chatfate.life/guides/true-solar-time)
- **Multilingual Hubs**: [简体中文 `/zh/`](https://chatfate.life/zh/) · [繁體中文 `/tw/`](https://chatfate.life/tw/) · [한국어 `/ko/`](https://chatfate.life/ko/)
- **Open Technical Specification & Reproducible Benchmark**: [https://yangtianchangxiao.github.io/Chatfate/](https://yangtianchangxiao.github.io/Chatfate/)
- **Machine-Readable LLM Reference**: [https://chatfate.life/llms.txt](https://chatfate.life/llms.txt) · [Developer API Docs](https://chatfate.life/developers)

---

## 1. Model Context Protocol (MCP) Server

`mcp/server.mjs` is a zero-dependency Node.js (>= 18) stdio MCP server supporting both newline-delimited JSON-RPC (`2024-11-05` / `2025-03-26`) and `Content-Length` framing.

### Configuration (`claude_desktop_config.json`, Claude Code, Cursor, Windsurf)

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

### Exposed MCP Tools

| Tool | Description |
| :--- | :--- |
| `calculate_ziwei_bazi_chart` | Computes a True Solar Time Sanhe Zi Wei Dou Shu 12-palace chart + Solar-Term Four Pillars BaZi / Saju chart across 53,000+ global places with historical IANA DST calibration. |
| `calculate_relationship_synastry` | Compares two birth charts via BaZi Day-Pillar chemistry, Zi Wei cross-chart Sihua transformations, and a composite 22-Arcana Destiny Matrix. |
| `calculate_destiny_matrix` | Offline deterministic 22-Major-Arcana octagon, Center Comfort Zone, Karmic Tail (`D2-D1-D`), Love & Money channels, and Personal Purpose from any Gregorian date (`1800–2200`). |
| `search_true_solar_city` | Resolves `city_id`, exact longitude, and `iana_timezone` from ChatFate's 53,000+ global city/county atlas. |

Verify locally:

```bash
node ./mcp/server.mjs --self-test
```

---

## 2. Claude Code / Codex / Agent Skill Installation

### Using `skills` CLI

```bash
npx skills add yangtianchangxiao/Chatfate
```

### Manual Clone (Claude Code or Codex)

```bash
# Claude Code
mkdir -p ~/.claude/skills && git clone https://github.com/yangtianchangxiao/Chatfate ~/.claude/skills/chatfate

# OpenAI Codex
mkdir -p ~/.codex/skills && git clone https://github.com/yangtianchangxiao/Chatfate ~/.codex/skills/chatfate
```

### Multi-Turn CLI Consultation Helper

```bash
python3 scripts/chatfate_query.py \
  --birth-date 1992-06-23 \
  --birth-time 6 \
  --gender male \
  --question "Verify my 2024-2025 career shifts first, then compare my 2027 pivot windows."
```

---

## Scope & Ethical Boundaries

ChatFate separates **deterministic astronomical/calendrical computation** (longitude equation of time, solar terms, iztro star tables, modulo-22 digital root reduction) from **symbolic cultural interpretation**. Outputs are designed for cultural exploration and personal reflection, never as medical, legal, financial, or clinical advice.

## License

MIT License — see [LICENSE](./LICENSE).
