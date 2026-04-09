# ChatFate

Public release bundle for installing ChatFate as a Claude Code / Codex skill.

This directory is designed so it can either:

1. live inside a monorepo during iteration, or
2. be published as its own public GitHub repository.

## What it is

`ChatFate` exposes fate reading as a remote skill:

- the skill lives locally in Claude/Codex
- the actual fate reading is produced by the ChatFate API
- the backend can later enforce API keys, credits, usage tracking, and session memory

## Install

### Fast install: SKILL.md only

This is the closest to the Cerul-style distribution model.  
If only `SKILL.md` is installed, the skill falls back to raw HTTP calls.

#### Claude Code

```bash
mkdir -p ~/.claude/skills/chatfate && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/SKILL.md \
  -o ~/.claude/skills/chatfate/SKILL.md && \
cat ~/.claude/skills/chatfate/SKILL.md
```

#### Codex

```bash
mkdir -p ~/.codex/skills/chatfate && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/SKILL.md \
  -o ~/.codex/skills/chatfate/SKILL.md && \
cat ~/.codex/skills/chatfate/SKILL.md
```

### Full install: skill + helper script

### Claude Code

```bash
mkdir -p ~/.claude/skills/chatfate/scripts && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/SKILL.md \
  -o ~/.claude/skills/chatfate/SKILL.md && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/scripts/chatfate_query.py \
  -o ~/.claude/skills/chatfate/scripts/chatfate_query.py && \
chmod +x ~/.claude/skills/chatfate/scripts/chatfate_query.py && \
cat ~/.claude/skills/chatfate/SKILL.md
```

### Codex

```bash
mkdir -p ~/.codex/skills/chatfate/scripts && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/SKILL.md \
  -o ~/.codex/skills/chatfate/SKILL.md && \
curl -fsSL https://raw.githubusercontent.com/yangtianchangxiao/Chatfate/main/scripts/chatfate_query.py \
  -o ~/.codex/skills/chatfate/scripts/chatfate_query.py && \
chmod +x ~/.codex/skills/chatfate/scripts/chatfate_query.py && \
cat ~/.codex/skills/chatfate/SKILL.md
```

## Optional environment variables

```bash
export CHATFATE_BASE_URL="https://chatfate.life"
export CHATFATE_API_KEY="cf_sk_xxx"
export CHATFATE_LANG="zh-CN"
export CHATFATE_TIMEOUT_SEC="360"
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
ChatFate can use `session_id`, `user_id`, and `anonymous_id` if the caller provides them.

This release bundle already supports passing those fields through the helper script, but it does not yet auto-create and auto-persist a session file locally. That can be added in the next iteration.

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

## Positioning

This is not a pure prompt-only astrology skill.

It is a remote-skill wrapper around the ChatFate service, which means:

- the installation is lightweight
- the logic can evolve on the server
- API key / credit / usage governance can be added without changing the user workflow
