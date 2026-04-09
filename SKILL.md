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

3. If only `SKILL.md` is installed and the script is unavailable, fall back to raw HTTP:

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

4. If the user explicitly wants process details, add `--steps`.
5. If the user explicitly wants raw payload/debugging, add `--json`.
6. Preserve the user's original question. Do not silently rewrite an open-ended consultation into a single-year question.

## Environment

The helper script reads these optional environment variables:

- `CHATFATE_BASE_URL`
  - default: `https://chatfate.life`
- `CHATFATE_API_KEY`
  - optional bearer token for deployments that require auth
- `CHATFATE_TIMEOUT_SEC`
  - default: `360`
- `CHATFATE_LANG`
  - default: `zh-CN`
- `CHATFATE_SESSION_ID`
  - optional session continuity id
- `CHATFATE_USER_ID`
  - optional login user id
- `CHATFATE_ANONYMOUS_ID`
  - optional anonymous id

## Good usage patterns

- `验证一下我 2020 年的事业`
- `我哪一年财运最好`
- `回溯一下前十年`
- `分析我的事业`
- `看看我的家庭和房产`
- `我最近为什么总觉得很累`

## Privacy boundary

This skill sends only the user's birth info, question, and optional session identifiers to the ChatFate API. It does not need local database access.
