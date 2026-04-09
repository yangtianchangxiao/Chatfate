#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any, Dict


TIME_LABEL_MAP = {
    "0": 0,
    "子": 0,
    "子时": 0,
    "latezi": 0,
    "midnight": 0,
    "1": 1,
    "丑": 1,
    "丑时": 1,
    "2": 2,
    "寅": 2,
    "寅时": 2,
    "3": 3,
    "卯": 3,
    "卯时": 3,
    "4": 4,
    "辰": 4,
    "辰时": 4,
    "5": 5,
    "巳": 5,
    "巳时": 5,
    "6": 6,
    "午": 6,
    "午时": 6,
    "noon": 6,
    "7": 7,
    "未": 7,
    "未时": 7,
    "8": 8,
    "申": 8,
    "申时": 8,
    "9": 9,
    "酉": 9,
    "酉时": 9,
    "10": 10,
    "戌": 10,
    "戌时": 10,
    "11": 11,
    "亥": 11,
    "亥时": 11,
    "12": 12,
    "早子": 12,
    "早子时": 12,
    "earlyzi": 12,
}


def parse_birth_time(raw: str) -> int:
    key = str(raw or "").strip().lower().replace(" ", "")
    if key in TIME_LABEL_MAP:
        return TIME_LABEL_MAP[key]
    raise ValueError(f"Unsupported birth time label: {raw}")


def build_payload(args: argparse.Namespace) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "birth_date": args.birth_date,
        "birth_time_index": parse_birth_time(args.birth_time),
        "gender": args.gender,
        "question": args.question,
        "lang": args.lang or os.getenv("CHATFATE_LANG", "zh-CN"),
        "include_steps": bool(args.steps),
        "trace_enabled": bool(args.trace),
    }
    session_id = args.session_id or os.getenv("CHATFATE_SESSION_ID")
    user_id = args.user_id or os.getenv("CHATFATE_USER_ID")
    anonymous_id = args.anonymous_id or os.getenv("CHATFATE_ANONYMOUS_ID")
    if session_id:
        payload["session_id"] = session_id
    if user_id:
        payload["user_id"] = user_id
    if anonymous_id:
        payload["anonymous_id"] = anonymous_id
    return payload


def post_json(url: str, payload: Dict[str, Any], timeout_sec: int, api_key: str | None) -> Dict[str, Any]:
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
        return json.loads(resp.read().decode("utf-8"))


def render_human(data: Dict[str, Any], include_steps: bool) -> str:
    parts = []
    answer = str(data.get("answer_text") or "").strip()
    if answer:
        parts.append(answer)
    else:
        parts.append("No answer_text returned from ChatFate.")

    if include_steps:
        steps = list(data.get("steps") or [])
        rendered = []
        for item in steps:
            if isinstance(item, str):
                step = item.strip()
            else:
                step = str((item or {}).get("step") or "").strip()
            if step:
                rendered.append(f"- {step}")
        if rendered:
            parts.append("\n--- Steps ---\n" + "\n".join(rendered))

    done = data.get("done") or {}
    suggestions = done.get("follow_up_suggestions") or done.get("suggested_questions")
    if isinstance(suggestions, list):
        clean = [str(item).strip() for item in suggestions if str(item).strip()]
        if clean:
            parts.append("\n--- Suggested follow-ups ---\n" + "\n".join(f"- {item}" for item in clean[:5]))
    return "\n\n".join(parts).strip() + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Query ChatFate remote fate-reading API.")
    parser.add_argument("--birth-date", required=True, help="Birth date in YYYY-MM-DD.")
    parser.add_argument("--birth-time", required=True, help="Birth time index or label, e.g. 0 / 子时 / 午时.")
    parser.add_argument("--gender", required=True, choices=["male", "female"], help="Gender.")
    parser.add_argument("--question", required=True, help="Question to ask ChatFate.")
    parser.add_argument("--base-url", default=os.getenv("CHATFATE_BASE_URL", "https://chatfate.life"), help="Base URL for ChatFate API.")
    parser.add_argument("--timeout-sec", type=int, default=int(os.getenv("CHATFATE_TIMEOUT_SEC", "360")), help="HTTP timeout in seconds.")
    parser.add_argument("--lang", default=os.getenv("CHATFATE_LANG", "zh-CN"), help="Language, default zh-CN.")
    parser.add_argument("--session-id", help="Optional session id for multi-turn continuity.")
    parser.add_argument("--user-id", help="Optional user id.")
    parser.add_argument("--anonymous-id", help="Optional anonymous id.")
    parser.add_argument("--steps", action="store_true", help="Include reasoning steps in rendered output.")
    parser.add_argument("--trace", action="store_true", help="Request backend trace in the payload.")
    parser.add_argument("--json", action="store_true", help="Print raw JSON response.")
    args = parser.parse_args()

    try:
        payload = build_payload(args)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    base_url = str(args.base_url or "").rstrip("/")
    url = f"{base_url}/api/fateclawd/invoke"
    api_key = os.getenv("CHATFATE_API_KEY")

    try:
        data = post_json(url, payload, args.timeout_sec, api_key)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        print(f"HTTP {exc.code}: {body}", file=sys.stderr)
        return 1
    except urllib.error.URLError as exc:
        print(f"Network error: {exc}", file=sys.stderr)
        return 1

    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return 0

    print(render_human(data, include_steps=args.steps), end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
