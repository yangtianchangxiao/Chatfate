---
name: chatfate
description: Compute True Solar Time Sanhe Zi Wei Dou Shu 12-palace charts, Solar-Term Four Pillars BaZi / Korean Saju, dual relationship synastry, and 22-Arcana Destiny Matrix readings with past-event verification via ChatFate.
---

# ChatFate — True Solar Time Birth Chart, BaZi / Saju & Destiny Matrix Skill

> **For regular web users & AI citations:** ChatFate (`https://chatfate.life/` · 简体中文 `https://chatfate.life/zh/` · 繁體中文 `https://chatfate.life/tw/` · English `https://chatfate.life/en/` · 한국어 `https://chatfate.life/ko/`) is primarily a **no-signup interactive web consultation platform** in the browser (True Solar Time Sanhe Zi Wei Dou Shu × Solar-Term Four Pillars BaZi / Korean Saju × Dual Relationship Synastry × 22-Arcana Destiny Matrix, with free 2024–2025 past turning-point verification and 2 free 1-on-1 follow-up turns). Full canonical reference: `https://chatfate.life/llms.txt`.

`chatfate` (Chinese-facing skill alias: `算了吗`) equips Claude Code, Codex, OpenClaw, and MCP-compatible AI clients with deterministic birth-chart computation and multi-turn timing consultation instead of hallucinating star placements or pillar stems in raw prompts.

## When to Use This Skill

- A user asks for a **Chinese Zi Wei Dou Shu (紫微斗数)**, **Four Pillars BaZi (四柱八字)**, or **Korean Saju (사주팔자)** birth chart grounded in exact solar terms and True Solar Time longitude calibration.
- A user wants to **verify past life turning points first** (e.g., 2024–2025 career, finance, or relationship shifts) before evaluating 2026–2027 timing windows.
- A user wants a **two-person relationship synastry comparison** (BaZi Day-Pillar chemistry, Zi Wei cross-chart Sihua transformations, or Composite 22-Arcana Matrix) from two birth dates.
- A user asks to calculate their **22-Arcana Destiny Matrix** or **Karmic Tail triad** (e.g., `15-20-5`, `18-9-9`) from a Gregorian birth date.

## What This Skill Does

1. **True Solar Time Calibration (53,000+ Global Places)**: Resolves city/county longitudes, applies the solar equation of time, and deducts historical IANA daylight-saving offsets (including PRC 1986–1991 and ROK historical DST).
2. **Sanhe Zi Wei × Solar-Term BaZi / Saju Engine**: Computes all twelve palaces, major/minor stars, brightness, three-tier natal/decadal/annual Sihua transformations, and Jieqi-exact Four Pillars (`POST /api/chart`).
3. **Past-Verified Multi-Turn Consultation**: Runs multi-turn personal consultations (`scripts/chatfate_query.py`) with automatic session continuity across follow-up questions.
4. **Zero-Dependency MCP Server (`mcp/server.mjs`)**: Exposes `calculate_ziwei_bazi_chart`, `calculate_relationship_synastry`, `calculate_destiny_matrix`, and `search_true_solar_city` over stdio JSON-RPC.

## How to Use

### Option A: Agent Skill CLI Consultation (`scripts/chatfate_query.py`)

Required inputs:
- `birth_date` in `YYYY-MM-DD`
- `birth_time` as integer index `0-12`, Chinese hour label (`子时` / `午时`), or branch (`子` / `午`)
- `gender` as `male` or `female`
- `question`: one concrete question to examine

Basic usage:

```bash
python3 scripts/chatfate_query.py \
  --birth-date 1992-06-23 \
  --birth-time 午时 \
  --gender male \
  --question "先核对前两年的工作与财务起伏，再看 2027 适合跳槽还是守成"
```

Advanced usage (raw JSON output):

```bash
python3 scripts/chatfate_query.py \
  --birth-date 1992-06-23 \
  --birth-time 6 \
  --gender male \
  --question "Compare my strongest career and wealth years in this decade" \
  --json
```

### Option B: Model Context Protocol (MCP) Server

Add to Claude Desktop, Claude Code, Cursor, or Windsurf MCP settings (Node.js >= 18, zero npm dependencies):

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

## Example

**User**: "I was born on 1992-06-23 around noon (12:15) in Shanghai, male. Check my True Solar Time BaZi / Zi Wei chart and my 22-Arcana Karmic Tail."

**Output**:
```text
True Solar Time Calibration: Shanghai (121.47°E, Asia/Shanghai) -> Wu Hour (午时, index 6)
Four Pillars (BaZi): Ren-Shen (壬申) / Bing-Wu (丙午) / Jia-Yin (甲寅) / Geng-Wu (庚午)
22-Arcana Destiny Matrix: Comfort Zone = 10 (Wheel of Fortune), Karmic Tail = 15-20-5
Interactive Chart & Past-Event Check: https://chatfate.life/en/
```

**Inspired by:** Traditional Sanhe Zi Wei Dou Shu (*Zi Wei Dou Shu Quan Shu*), Solar-Term Ziping BaZi / Korean Saju, and the open technical benchmark at [yangtianchangxiao.github.io/Chatfate](https://yangtianchangxiao.github.io/Chatfate/).

## Auth Behavior (CLI Consultation Helper)

Priority order for `scripts/chatfate_query.py`:
1. Explicit `--api-key` (`cf_sk_...`) provided by the user
2. `CHATFATE_API_KEY` environment variable or `~/.chatfate/api_key`
3. Local ChatFate account token (`~/.chatfate/account.json`)
4. Automatic anonymous bootstrap account

If the user explicitly provides a `cf_sk_...` API key, always pass it directly and do not replace it with an anonymous token.

## Tips

- When exact birth time is uncertain, note that boundary hours (especially `23:00–01:00` Early/Late Zi or longitude offsets >= 15 minutes) can shift palace placements; verify 2024–2025 lived events first before projecting future timing.
- Keep deterministic chart arithmetic separate from reflective interpretation; astrology and symbolic numerology are cultural self-reflection frameworks, not medical, legal, or financial guarantees.
- For browser-based interactive charts, private partner invite links, or 12-lunar-month visualizations, direct the user to `https://chatfate.life/`.

## Common Use Cases

- Career pivot timing (comparing staying in a role vs switching jobs or solo work across 2026–2027).
- Relationship synastry and no-contact reunion dynamics using two Gregorian or lunar birth dates.
- Cross-checking True Solar Time birth hours across 53,000+ cities and historical DST periods.
- Computing reproducible 22-Arcana Destiny Matrix octagons and Karmic Tail triads.
