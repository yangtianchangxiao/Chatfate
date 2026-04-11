---
name: chatfate
description: >-
  Use when the user wants an interactive fate consultation through the
  ChatFate service, built on the classical Chinese Sanhe-school Ziwei
  Doushu system, a traditional Chinese astrology framework.
  Chinese-facing skill name is 算了吗. Supports past verification,
  best-year comparison, decade review, and open-ended consultation around
  career, wealth, love, family, housing, parents, travel, inner state, or
  overall fortune.
---

# 算了吗

`算了吗` is the Chinese-facing skill name for ChatFate.

Use this skill when the user wants a real ChatFate consultation through the remote service, grounded in the classical Chinese Sanhe-school Ziwei Doushu system, a traditional Chinese astrology framework, rather than a handcrafted local answer.

## Required inputs

You need:

- `birth_date` in `YYYY-MM-DD`
- `birth_time` as either:
  - integer index `0-12`, or
  - Chinese hour label such as `子时` / `午时`, or
  - branch character such as `子` / `午`
- `gender` as `male` / `female`
- the actual question

## Execution

Run:

```bash
python3 scripts/chatfate_query.py \
  --birth-date 1990-06-15 \
  --birth-time 子时 \
  --gender male \
  --question '分析我的事业'
```

Use `--json` when the caller wants raw structured output.

## Auth behavior

Priority order:

1. Explicit API key provided by the user
2. Locally configured API key
3. Local ChatFate account token
4. Automatic anonymous bootstrap account

If the user explicitly gives a `cf_sk_...` API key, use it. Do not silently replace it with an anonymous account.
