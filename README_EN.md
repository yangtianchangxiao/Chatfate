# ChatFate

English: `README_EN.md`  
中文说明：`README.md` / `README_CN.md`

Public release bundle for installing ChatFate as a Claude Code / Codex skill. Searchable keywords: 算了吗 skill, 算了吗.skill, ChatFate skill, Claude Code fate skill, Codex Sanhe Ziwei skill.

This directory is designed so it can either:

1. live inside a monorepo during iteration, or
2. be published as its own public GitHub repository.

## What it is

`ChatFate` exposes interactive fate consultation as a remote skill, built on the classical Chinese Sanhe-school Ziwei Doushu system, a traditional Chinese astrology framework:

- the skill lives locally in Claude/Codex
- the actual fate reading is produced by the ChatFate API
- the backend can evolve without changing the user workflow
- API keys, credits, usage tracking, and memory stay on the server side

## Install

### Recommended install: clone this repo as a skill

#### Claude Code

```bash
mkdir -p ~/.claude/skills && \
git clone https://github.com/yangtianchangxiao/Chatfate ~/.claude/skills/chatfate
```

#### Codex

```bash
mkdir -p ~/.codex/skills && \
git clone https://github.com/yangtianchangxiao/Chatfate ~/.codex/skills/chatfate
```

### Hosted install: skill + helper script

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

After install, ordinary end users can start immediately without a website account or a pre-created API key. The helper will auto-bootstrap an anonymous ChatFate account, store a local `account token`, and use the current `100/day` test quota.

If you are a developer or integrator, you can still provide a ChatFate API key explicitly.

Recommended one-time setup for API key mode:

```bash
mkdir -p ~/.chatfate && chmod 700 ~/.chatfate && \
printf '%s' 'cf_sk_xxx' > ~/.chatfate/api_key && \
chmod 600 ~/.chatfate/api_key
```

Alternative:

```bash
export CHATFATE_API_KEY="cf_sk_xxx"
```

## Example prompts

- `Analyze my career.`
- `Review my last ten years.`
- `Which year is strongest for my wealth?`
- `Look at my long-term relationship trend.`
- `Analyze my family and housing for the next decade.`

## How end users should use it

Recommended guidance:

1. first turn: provide birth info and one real question
2. follow-up turns: ask naturally without repeating the whole template
3. same chart, new topic: open a separate thread
4. clean restart: explicitly ask for a fresh consultation

Good first-turn examples:

- `I was born on 1990-06-15 at 子时, male. First analyze my career structure.`
- `Review the most important changes in my last ten years.`
- `Look only at my family and housing trend for the next decade.`

## Required inputs

The skill needs:

- `birth_date` in `YYYY-MM-DD`
- `birth_time` as one of:
  - numeric index `0-12`
  - `子时 / 丑时 / ... / 亥时`
  - short label `子 / 丑 / ... / 亥`
- `gender` as `male` or `female`
- the question itself

## Memory and continuity

There are two different kinds of memory:

1. agent thread memory  
The local agent itself remembers prior turns in the same conversation.

2. server-side session memory  
ChatFate uses `session_id`, `client_id`, `user_id`, and `anonymous_id` to keep remote continuity.

The helper automatically:

- persists a local state file at `~/.chatfate/sessions.json`
- generates one stable local `client_id`
- reuses the same remote session for the same `birth_date + birth_time_index + gender + profile`
- creates a new remote session when needed
- saves both user and assistant messages through `/api/chat/save`
- defaults `anonymous_id = client_id` for backward-compatible anonymous memory

## API shape

Current request target:

```text
POST https://chatfate.life/api/fateclawd/invoke
```

Headers:

```text
X-ChatFate-Key: cf_sk_xxx
```

Minimal payload:

```json
{
  "birth_date": "1990-06-15",
  "birth_time_index": 0,
  "gender": "male",
  "question": "Analyze my career"
}
```

## Credits and auth

- one `/api/fateclawd/invoke` call consumes 1 credit in API-key mode
- ordinary skill users can run on account-token mode with the current `100/day` test quota
- helper lookup order is: `--api-key` -> `CHATFATE_API_KEY` -> `~/.chatfate/api_key` -> local account token -> auto-bootstrap account

## Other bundles

This repo also includes an OpenClaw plugin source bundle under `openclaw-fate-plugin/` for hosts that prefer plugin-style integration over `SKILL.md`.
