#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional
from uuid import uuid4


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

STATE_VERSION = 1
DEFAULT_LANG = "zh-CN"


def parse_birth_time(raw: str) -> int:
    key = str(raw or "").strip().lower().replace(" ", "")
    if key in TIME_LABEL_MAP:
        return TIME_LABEL_MAP[key]
    raise ValueError(f"Unsupported birth time label: {raw}")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def state_root_dir() -> Path:
    base = os.getenv("CHATFATE_STATE_DIR", "~/.chatfate")
    return Path(base).expanduser()


def state_file_path() -> Path:
    return state_root_dir() / "sessions.json"


def api_key_file_path() -> Path:
    override = str(os.getenv("CHATFATE_API_KEY_FILE") or "").strip()
    if override:
        return Path(override).expanduser()
    return state_root_dir() / "api_key"


def load_api_key_from_file(path: Path) -> Optional[str]:
    try:
        if not path.exists():
            return None
        value = path.read_text(encoding="utf-8").strip()
        return value or None
    except Exception:
        return None


def resolve_api_key(args: argparse.Namespace) -> Optional[str]:
    cli_value = str(args.api_key or "").strip()
    if cli_value:
        return cli_value

    env_value = str(os.getenv("CHATFATE_API_KEY") or "").strip()
    if env_value:
        return env_value

    return load_api_key_from_file(api_key_file_path())


def load_state(path: Path) -> Dict[str, Any]:
    if not path.exists():
        return {"version": STATE_VERSION, "profiles": {}}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise ValueError("state root must be object")
        if not isinstance(data.get("profiles"), dict):
            data["profiles"] = {}
        if not data.get("version"):
            data["version"] = STATE_VERSION
        return data
    except Exception:
        backup = path.with_suffix(".broken.json")
        try:
            path.replace(backup)
        except Exception:
            pass
        return {"version": STATE_VERSION, "profiles": {}}


def save_state(path: Path, state: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(".tmp")
    tmp_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp_path.replace(path)


def normalize_base_url(raw: str) -> str:
    return str(raw or "").rstrip("/")


def ensure_client_id(state: Dict[str, Any]) -> str:
    client_id = str(state.get("client_id") or "").strip()
    if client_id:
        return client_id
    client_id = uuid4().hex
    state["client_id"] = client_id
    if not state.get("client_created_at"):
        state["client_created_at"] = utc_now_iso()
    return client_id


def make_profile_key(
    base_url: str,
    birth_date: str,
    birth_time_index: int,
    gender: str,
    profile: str,
) -> str:
    payload = {
        "base_url": base_url,
        "birth_date": birth_date,
        "birth_time_index": birth_time_index,
        "gender": gender,
        "profile": profile,
    }
    return hashlib.sha1(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()


def request_json(
    url: str,
    payload: Dict[str, Any],
    timeout_sec: int,
    api_key: Optional[str],
) -> Dict[str, Any]:
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


def create_remote_session(
    base_url: str,
    payload: Dict[str, Any],
    timeout_sec: int,
    api_key: Optional[str],
) -> str:
    data = request_json(f"{base_url}/api/chat/session/create", payload, timeout_sec, api_key)
    session_id = str(data.get("session_id") or "").strip()
    if not data.get("success") or not session_id:
        raise RuntimeError(f"Failed to create remote session: {json.dumps(data, ensure_ascii=False)}")
    return session_id


def save_remote_message(
    base_url: str,
    payload: Dict[str, Any],
    timeout_sec: int,
    api_key: Optional[str],
) -> Dict[str, Any]:
    data = request_json(f"{base_url}/api/chat/save", payload, timeout_sec, api_key)
    if not data.get("success"):
        raise RuntimeError(f"Failed to save chat message: {json.dumps(data, ensure_ascii=False)}")
    return data


def ensure_session(args: argparse.Namespace, birth_time_index: int, base_url: str, api_key: Optional[str]) -> Dict[str, Any]:
    explicit_session_id = (args.session_id or os.getenv("CHATFATE_SESSION_ID") or "").strip()
    explicit_user_id = (args.user_id or os.getenv("CHATFATE_USER_ID") or "").strip()
    explicit_anonymous_id = (args.anonymous_id or os.getenv("CHATFATE_ANONYMOUS_ID") or "").strip()
    explicit_client_id = (args.client_id or os.getenv("CHATFATE_CLIENT_ID") or "").strip()

    if args.no_memory:
        return {
            "session_id": explicit_session_id or None,
            "user_id": explicit_user_id or None,
            "client_id": explicit_client_id or None,
            "anonymous_id": explicit_anonymous_id or explicit_client_id or None,
            "profile": args.profile,
            "state_file": None,
            "memory_enabled": False,
        }

    state_path = state_file_path()
    state = load_state(state_path)
    client_id = explicit_client_id or ensure_client_id(state)
    profile = (args.profile or os.getenv("CHATFATE_PROFILE") or "default").strip() or "default"
    profile_key = make_profile_key(base_url, args.birth_date, birth_time_index, args.gender, profile)
    entry = dict(state.get("profiles", {}).get(profile_key) or {})

    anonymous_id = (
        explicit_anonymous_id
        or str(entry.get("anonymous_id") or "").strip()
        or client_id
    )
    user_id = explicit_user_id or str(entry.get("user_id") or "").strip() or None
    session_id = explicit_session_id or None
    if not session_id and not args.new_session:
        session_id = str(entry.get("session_id") or "").strip() or None

    if not session_id:
        create_payload: Dict[str, Any] = {
            "birth_date": args.birth_date,
            "birth_time_index": birth_time_index,
            "gender": args.gender,
        }
        create_payload["client_id"] = client_id
        if user_id:
            create_payload["user_id"] = user_id
        else:
            create_payload["anonymous_id"] = anonymous_id
        session_id = create_remote_session(base_url, create_payload, args.timeout_sec, api_key)

    entry.update(
        {
            "profile": profile,
            "base_url": base_url,
            "birth_date": args.birth_date,
            "birth_time_index": birth_time_index,
            "gender": args.gender,
            "client_id": client_id,
            "user_id": user_id,
            "anonymous_id": anonymous_id,
            "session_id": session_id,
            "updated_at": utc_now_iso(),
        }
    )
    state.setdefault("profiles", {})[profile_key] = entry
    save_state(state_path, state)
    return {
        "session_id": session_id,
        "client_id": client_id,
        "user_id": user_id,
        "anonymous_id": anonymous_id,
        "profile": profile,
        "state_file": str(state_path),
        "memory_enabled": True,
    }


def build_invoke_payload(args: argparse.Namespace, birth_time_index: int, session_meta: Dict[str, Any]) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "birth_date": args.birth_date,
        "birth_time_index": birth_time_index,
        "gender": args.gender,
        "question": args.question,
        "lang": args.lang or os.getenv("CHATFATE_LANG", DEFAULT_LANG),
        "include_steps": bool(args.steps),
        "trace_enabled": bool(args.trace),
    }
    if session_meta.get("session_id"):
        payload["session_id"] = session_meta["session_id"]
    if session_meta.get("client_id"):
        payload["client_id"] = session_meta["client_id"]
    if session_meta.get("user_id"):
        payload["user_id"] = session_meta["user_id"]
    if session_meta.get("anonymous_id"):
        payload["anonymous_id"] = session_meta["anonymous_id"]
    return payload


def build_save_payload(
    args: argparse.Namespace,
    birth_time_index: int,
    session_meta: Dict[str, Any],
    role: str,
    content: str,
) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "session_id": session_meta.get("session_id"),
        "birth_date": args.birth_date,
        "birth_time_index": birth_time_index,
        "gender": args.gender,
        "role": role,
        "content": content,
    }
    if session_meta.get("client_id"):
        payload["client_id"] = session_meta["client_id"]
    if session_meta.get("user_id"):
        payload["user_id"] = session_meta["user_id"]
    if session_meta.get("anonymous_id"):
        payload["anonymous_id"] = session_meta["anonymous_id"]
    return payload


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
    parser.add_argument("--lang", default=os.getenv("CHATFATE_LANG", DEFAULT_LANG), help="Language, default zh-CN.")
    parser.add_argument("--api-key", default=os.getenv("CHATFATE_API_KEY"), help="Optional ChatFate API key.")
    parser.add_argument("--session-id", help="Optional explicit session id.")
    parser.add_argument("--user-id", help="Optional user id.")
    parser.add_argument("--client-id", help="Optional stable local client id.")
    parser.add_argument("--anonymous-id", help="Optional anonymous id.")
    parser.add_argument("--profile", default=os.getenv("CHATFATE_PROFILE", "default"), help="Local profile name for isolating multiple threads with the same birth info.")
    parser.add_argument("--new-session", action="store_true", help="Force a new remote session for this local profile.")
    parser.add_argument("--no-memory", action="store_true", help="Disable local session persistence and remote history save.")
    parser.add_argument("--steps", action="store_true", help="Include reasoning steps in rendered output.")
    parser.add_argument("--trace", action="store_true", help="Request backend trace in the payload.")
    parser.add_argument("--json", action="store_true", help="Print raw JSON response.")
    args = parser.parse_args()

    try:
        birth_time_index = parse_birth_time(args.birth_time)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    base_url = normalize_base_url(args.base_url)
    if not base_url:
        print("CHATFATE base URL is empty.", file=sys.stderr)
        return 2

    api_key = resolve_api_key(args)

    try:
        session_meta = ensure_session(args, birth_time_index, base_url, api_key)
    except Exception as exc:
        print(f"Failed to prepare session: {exc}", file=sys.stderr)
        return 1

    if session_meta.get("memory_enabled"):
        try:
            save_remote_message(
                base_url,
                build_save_payload(args, birth_time_index, session_meta, "user", args.question),
                args.timeout_sec,
                api_key,
            )
        except Exception as exc:
            print(f"Warning: failed to persist user message: {exc}", file=sys.stderr)

    try:
        data = request_json(
            f"{base_url}/api/fateclawd/invoke",
            build_invoke_payload(args, birth_time_index, session_meta),
            args.timeout_sec,
            api_key,
        )
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        if exc.code == 401 and "api_key_required" in body:
            key_path = api_key_file_path()
            print(
                "API key required. Set CHATFATE_API_KEY or save a one-time local key with:\n"
                f"mkdir -p '{key_path.parent}' && chmod 700 '{key_path.parent}' && "
                f"printf '%s' 'cf_sk_xxx' > '{key_path}' && chmod 600 '{key_path}'",
                file=sys.stderr,
            )
        print(f"HTTP {exc.code}: {body}", file=sys.stderr)
        return 1
    except urllib.error.URLError as exc:
        print(f"Network error: {exc}", file=sys.stderr)
        return 1

    answer_text = str(data.get("answer_text") or "").strip()
    if session_meta.get("memory_enabled") and answer_text:
        try:
            save_remote_message(
                base_url,
                build_save_payload(args, birth_time_index, session_meta, "assistant", answer_text),
                args.timeout_sec,
                api_key,
            )
        except Exception as exc:
            print(f"Warning: failed to persist assistant message: {exc}", file=sys.stderr)

    if args.json:
        data["_chatfate_local"] = {
            "profile": session_meta.get("profile"),
            "session_id": session_meta.get("session_id"),
            "client_id": session_meta.get("client_id"),
            "anonymous_id": session_meta.get("anonymous_id"),
            "user_id": session_meta.get("user_id"),
            "memory_enabled": session_meta.get("memory_enabled"),
            "state_file": session_meta.get("state_file"),
        }
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return 0

    print(render_human(data, include_steps=args.steps), end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
