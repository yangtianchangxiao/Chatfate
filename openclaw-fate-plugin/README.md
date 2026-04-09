# Fate for OpenClaw

This package exposes one OpenClaw tool:

- `fate_reading`

It calls your Fate backend non-streaming endpoint:

- `POST /api/fateclawd/invoke`

## 1) Backend requirement

Your Fate service must expose:

- `POST /api/fateclawd/invoke`

Production URL:

- `https://chatfate.life/api/fateclawd/invoke`

## 2) Install plugin in OpenClaw

Hosted developer entry:

- `https://chatfate.life/developers`

Hosted plugin bundle:

- `https://chatfate.life/plugins/openclaw-fate-plugin/openclaw-fate-plugin-0.1.2.tgz`

From your OpenClaw workspace:

```bash
openclaw plugins install -l /home/ubuntu/my-app/ziwei_ai_project/old_framework/openclaw-fate-plugin
openclaw plugins enable fateclawd
openclaw plugins doctor
```

Or install from the hosted package:

```bash
curl -fsSLO https://chatfate.life/plugins/openclaw-fate-plugin/openclaw-fate-plugin-0.1.2.tgz
openclaw plugins install ./openclaw-fate-plugin-0.1.2.tgz
openclaw plugins enable fateclawd
openclaw plugins doctor
```

## 3) Configure plugin + allow tool

In `openclaw.json`:

```json5
{
  plugins: {
    entries: {
      fateclawd: {
        enabled: true,
        config: {
          baseUrl: "https://chatfate.life",
          endpointPath: "/api/fateclawd/invoke",
          timeoutMs: 120000,
          paymentMode: "off",
          upgradeUrl: "https://chatfate.life/pricing",
          traceEnabledDefault: false,
          includeStepsDefault: true,
          defaultLang: "zh-CN"
        }
      }
    }
  },
  agents: {
    list: [
      {
        id: "main",
        tools: { allow: ["fate_reading"] }
      }
    ]
  }
}
```

Then restart OpenClaw gateway.

Profile templates:

- `examples/openclaw.fate-pro.json5` (full capability)
- `examples/openclaw.fate-lite.json5` (lightweight / lower-cost defaults)
- Hosted copies:
  - `https://chatfate.life/plugins/openclaw-fate-plugin/examples/openclaw.fate-pro.json5`
  - `https://chatfate.life/plugins/openclaw-fate-plugin/examples/openclaw.fate-lite.json5`

## 4) Manual tool call (Gateway API)

```bash
curl -sS -X POST http://127.0.0.1:3456/tools/invoke \
  -H 'Content-Type: application/json' \
  -d '{
    "tool":"fate_reading",
    "args":{
      "birth_date":"1996-03-12",
      "birth_time_index":6,
      "gender":"female",
      "question":"我什么时候适合结婚？",
      "lang":"zh-CN",
      "agent_max_steps":3,
      "search_tree_enabled":true
    }
  }'
```

## 5) Tool parameters

Required:

- `birth_date` (`YYYY-MM-DD`)
- `question`

Common optional:

- `birth_time_index` (default `6`)
- `gender` (`male|female`, default `male`)
- `lang` (default `zh-CN`)
- `agent_max_steps`
- `search_tree_enabled`
- `trace_enabled`
- `include_steps`
- `include_events`
- `payment_mode` (`off|preview|enforced`)
- `payment_plan` (placeholder for future billing)
- `payment_session_id` (placeholder for future billing)
- `user_id`, `session_id`, `anonymous_id`

## 6) Tool output

The plugin text output now includes:

- `skill`
- `mode`
- `search_policy`
- `key_year`
- `elapsed_ms`
- top user-facing `steps`
- structured `evidence`
- full `answer_text`

Raw API payload is still returned in `details.response`.

## 7) Nano-like hosts

The checked-out `nanoclaw` repo currently exposes plugin support in docs, but this workspace does not contain a visible plugin loader implementation to target safely.

So this package also includes a thin HTTP adapter example:

- `examples/nanoclaw-http-tool.ts`

Use that file when you want to wire Fate into a Nano-like host without pretending the OpenClaw plugin contract is identical.

## Notes

- The tool returns a structured text summary in `content[0].text`.
- Full raw API payload remains in `details.response`.
- Billing interface is placeholder-only for now: tool returns payment status + upgrade hint, no charge execution.
