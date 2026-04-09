---
name: chatfate
description: Use when the user wants a Ziwei / fate reading through the ChatFate service. Supports past verification, best-year comparison, decade review, and open-ended consultation around career, wealth, love, family, housing, parents, travel, inner state, or overall fortune.
---

# ChatFate

Use this skill when the user wants a real ChatFate reading through the remote service rather than a handcrafted local answer.

## Required inputs

You need:

- `birth_date` in `YYYY-MM-DD`
- `birth_time` as either:
  - integer index `0-12`, or
  - Chinese hour label such as `子时` / `午时`, or
  - branch character such as `子` / `午`
- `gender` as `male` or `female`
- the user's question

If any required field is missing, ask one concise follow-up that collects all missing fields at once. Do not guess birth time.

Preferred follow-up style:

- Chinese:
  - `请直接告诉我：出生年月日、出生时辰（如子时/午时）、性别，以及你现在最想问的一个问题。`
- English:
  - `Please give me your birth date, birth hour, gender, and the one question you want to ask first.`

If the user has already provided some of the fields, only ask for the missing ones, but still keep it to one compact message.

## Workflow

1. Reuse birth info already present in the conversation when available.
2. Prefer the bundled helper:

```bash
python3 scripts/chatfate_query.py \
  --birth-date 1990-06-15 \
  --birth-time 子时 \
  --gender male \
  --question "分析我的事业"
```

Before using the helper on hosted ChatFate, make sure `CHATFATE_API_KEY` is set when the deployment requires credits.

3. The helper now auto-manages local session continuity:

- it stores a local state file under `~/.chatfate/sessions.json`
- it generates one stable local `client_id` for this installation
- it creates a remote ChatFate session when needed
- it saves both user and assistant turns through `/api/chat/save`
- it forwards `session_id / client_id / anonymous_id` to `/api/fateclawd/invoke`
- for anonymous usage it defaults `anonymous_id = client_id`

4. If the user wants a fresh thread for the same birth profile, add:

```bash
python3 scripts/chatfate_query.py \
  --birth-date 1990-06-15 \
  --birth-time 子时 \
  --gender male \
  --profile annual-review \
  --new-session \
  --question "回溯一下前十年"
```

5. If only `SKILL.md` is installed and the script is unavailable, fall back to raw HTTP:

```bash
curl -s https://chatfate.life/api/fateclawd/invoke \
  -H 'Content-Type: application/json' \
  -d '{
    "birth_date":"1990-06-15",
    "birth_time_index":0,
    "gender":"male",
    "question":"分析我的事业"
  }'
```

6. If the user explicitly wants process details, add `--steps`.
7. If the user explicitly wants raw payload/debugging, add `--json`.
8. Preserve the user's original question. Do not silently rewrite an open-ended consultation into a single-year question.

## Environment

The helper script reads these optional environment variables:

- `CHATFATE_BASE_URL`
  - default: `https://chatfate.life`
- `CHATFATE_API_KEY`
  - bearer token for hosted deployments that require API key + credits
- `CHATFATE_TIMEOUT_SEC`
  - default: `360`
- `CHATFATE_LANG`
  - default: `zh-CN`
- `CHATFATE_PROFILE`
  - default: `default`
- `CHATFATE_SESSION_ID`
  - optional session continuity id
- `CHATFATE_USER_ID`
  - optional login user id
- `CHATFATE_CLIENT_ID`
  - optional stable local installation id; auto-generated when omitted
- `CHATFATE_ANONYMOUS_ID`
  - optional anonymous id
- `CHATFATE_STATE_DIR`
  - default: `~/.chatfate`

## Good usage patterns

- `验证一下我 2020 年的事业`
- `我哪一年财运最好`
- `回溯一下前十年`
- `分析我的事业`
- `看看我的家庭和房产`
- `我最近为什么总觉得很累`

## Credit model

- hosted agent usage goes through `/api/fateclawd/invoke`
- one invoke request consumes one credit
- browser chat on the website may use a different route and does not need to share the same key flow

## Privacy boundary

This skill sends only the user's birth info, question, and optional session identifiers to the ChatFate API. The local state file stores the stable `client_id` plus profile-to-session mapping only; it is not a local fate database.
