# ChatFate

English: `README.md`  
中文说明：`README_CN.md`

Public release bundle for installing ChatFate as a Claude Code / Codex skill.

This directory is designed so it can either:

1. live inside a monorepo during iteration, or
2. be published as its own public GitHub repository.

## What it is

`ChatFate` exposes fate reading as a remote skill:

- the skill lives locally in Claude/Codex
- the actual fate reading is produced by the ChatFate API
- the backend can evolve without changing the user workflow
- API keys, credits, usage tracking, and memory stay on the server side

## Install

### Recommended install: hosted skill + helper script

Canonical hosted files:

- `https://chatfate.life/skills/chatfate/SKILL.md`
- `https://chatfate.life/skills/chatfate/scripts/chatfate_query.py`
- `https://chatfate.life/developers`

#### Claude Code

```bash
mkdir -p ~/.claude/skills/chatfate/scripts && \
curl -fsSL https://chatfate.life/skills/chatfate/SKILL.md \
  -o ~/.claude/skills/chatfate/SKILL.md && \
curl -fsSL https://chatfate.life/skills/chatfate/scripts/chatfate_query.py \
  -o ~/.claude/skills/chatfate/scripts/chatfate_query.py && \
chmod +x ~/.claude/skills/chatfate/scripts/chatfate_query.py && \
cat ~/.claude/skills/chatfate/SKILL.md
```

#### Codex

```bash
mkdir -p ~/.codex/skills/chatfate/scripts && \
curl -fsSL https://chatfate.life/skills/chatfate/SKILL.md \
  -o ~/.codex/skills/chatfate/SKILL.md && \
curl -fsSL https://chatfate.life/skills/chatfate/scripts/chatfate_query.py \
  -o ~/.codex/skills/chatfate/scripts/chatfate_query.py && \
chmod +x ~/.codex/skills/chatfate/scripts/chatfate_query.py && \
cat ~/.codex/skills/chatfate/SKILL.md
```

### GitHub-backed install

#### Claude Code

```bash
mkdir -p ~/.claude/skills/chatfate/scripts && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/SKILL.md \
  -o ~/.claude/skills/chatfate/SKILL.md && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/scripts/chatfate_query.py \
  -o ~/.claude/skills/chatfate/scripts/chatfate_query.py && \
chmod +x ~/.claude/skills/chatfate/scripts/chatfate_query.py && \
cat ~/.claude/skills/chatfate/SKILL.md
```

#### Codex

```bash
mkdir -p ~/.codex/skills/chatfate/scripts && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/SKILL.md \
  -o ~/.codex/skills/chatfate/SKILL.md && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/scripts/chatfate_query.py \
  -o ~/.codex/skills/chatfate/scripts/chatfate_query.py && \
chmod +x ~/.codex/skills/chatfate/scripts/chatfate_query.py && \
cat ~/.codex/skills/chatfate/SKILL.md
```

### Fast fallback: `SKILL.md` only

If only `SKILL.md` is installed, the skill falls back to raw HTTP calls.

## Optional environment variables

```bash
export CHATFATE_BASE_URL="https://chatfate.life"
export CHATFATE_API_KEY="cf_sk_xxx"
export CHATFATE_LANG="zh-CN"
export CHATFATE_TIMEOUT_SEC="360"
export CHATFATE_PROFILE="default"
export CHATFATE_STATE_DIR="$HOME/.chatfate"
```

`CHATFATE_API_KEY` is optional while public anonymous access remains enabled.
If the deployment later requires API keys, the same skill still works.

## Example prompts

- `分析我的事业`
- `回溯一下前十年`
- `我哪一年财运最好`
- `看看我的感情`
- `分析未来十年的家庭与房产走势`

## Required inputs

The skill needs:

- `birth_date` in `YYYY-MM-DD`
- `birth_time` as one of:
  - numeric index `0-12`
  - `子时 / 丑时 / ... / 亥时`
  - short label `子 / 丑 / ... / 亥`
- `gender` as `male` or `female`
- the question itself

Birth hour mapping:

- `0=子时`
- `1=丑时`
- `2=寅时`
- `3=卯时`
- `4=辰时`
- `5=巳时`
- `6=午时`
- `7=未时`
- `8=申时`
- `9=酉时`
- `10=戌时`
- `11=亥时`
- `12=早子时`

## Memory and continuity

There are two different kinds of memory:

1. agent thread memory
The local agent itself remembers prior turns in the same conversation.

2. server-side session memory
ChatFate uses `session_id`, `user_id`, and `anonymous_id` to keep remote continuity.

The helper now does the following automatically:

- persists a local state file at `~/.chatfate/sessions.json`
- reuses the same remote session for the same `birth_date + birth_time_index + gender + profile`
- creates a new remote session when needed
- saves both user and assistant messages through `/api/chat/save`

You can force a clean thread with:

```bash
python3 scripts/chatfate_query.py \
  --birth-date 1990-06-15 \
  --birth-time 子时 \
  --gender male \
  --profile annual-review \
  --new-session \
  --question "回溯一下前十年"
```

## API shape

Current request target:

```text
POST https://chatfate.life/api/fateclawd/invoke
```

Minimal payload:

```json
{
  "birth_date": "1990-06-15",
  "birth_time_index": 0,
  "gender": "male",
  "question": "分析我的事业"
}
```

## Other bundles

This repo also includes an OpenClaw plugin source bundle under `openclaw-fate-plugin/` for hosts that prefer plugin-style integration over `SKILL.md`.

## Positioning

This is not a pure prompt-only astrology skill.

It is a remote-skill wrapper around the ChatFate service, which means:

- the installation is lightweight
- the logic can evolve on the server
- API key / credit / usage governance can be added without changing the user workflow
