#!/usr/bin/env python3
"""
Automatic prompt/response capture for the 8x assignment.

Wired into .claude/settings.json on four hook events:
  - SessionStart:      seed per-session state, grab the model if Claude Code gives us one
  - UserPromptSubmit:  log the verbatim prompt
  - Stop:              log the final assistant text for that turn (last_assistant_message)
  - PostModelSwitch:   keep the tracked model current if the user switches mid-session

Everything needed (prompt text, final response text, session id, transcript path)
comes straight off stdin JSON for the firing event - no parsing of the transcript
required, except to backfill the exact model id used for a given turn's response
(the Stop/UserPromptSubmit payloads don't carry a model field, only SessionStart
and PostModelSwitch do).

The whole log file is regenerated from a small per-session JSON state file on every
call. This is the simplest way to keep the frontmatter (total_exchanges,
first/last_prompt_time) accurate without hand-patching a growing text file, and it
is idempotent: replaying the same state produces byte-identical output, so it never
mutates the meaning of an entry that was already written.
"""
import json
import os
import sys
from datetime import datetime, timezone

FALLBACK_MODEL = "claude-sonnet-5"
TOOL_NAME = "claude-code"


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + f"{datetime.now(timezone.utc).microsecond // 1000:03d}Z"


def project_root():
    return os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()


def author_name():
    try:
        import subprocess
        name = subprocess.run(["git", "config", "user.name"], cwd=project_root(),
                               capture_output=True, text=True, timeout=5).stdout.strip()
        if name:
            return name
    except Exception:
        pass
    return os.environ.get("USER", "unknown")


def state_path(session_id):
    d = os.path.join(project_root(), ".claude", "hooks", ".state")
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, f"{session_id}.json")


def load_state(session_id, data):
    path = state_path(session_id)
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)

    ts = now_iso()
    date = ts[:10]
    time_part = ts[11:19].replace(":", "-")
    logs_dir = os.path.join(project_root(), ".agent-logs")
    os.makedirs(logs_dir, exist_ok=True)
    filename = f"{date}_{time_part}_{session_id}.md"

    model = data.get("model") or os.environ.get("ANTHROPIC_MODEL") or FALLBACK_MODEL

    return {
        "session_id": session_id,
        "log_file": os.path.join(logs_dir, filename),
        "date": date,
        "author": author_name(),
        "project": os.path.basename(project_root()),
        "current_model": model,
        "first_prompt_time": None,
        "last_prompt_time": None,
        "entries": [],  # [{type, num, timestamp, model, text}]
    }


def save_state(state):
    with open(state_path(state["session_id"]), "w") as f:
        json.dump(state, f, indent=2)


def prompt_count(state):
    return sum(1 for e in state["entries"] if e["type"] == "PROMPT")


def render(state):
    short = state["session_id"][:8]
    total_exchanges = prompt_count(state)
    header = (
        "---\n"
        f"session_id: {state['session_id']}\n"
        f"date: {state['date']}\n"
        f"author: {state['author']}\n"
        f"model: {state['current_model']}\n"
        f"tool: {TOOL_NAME}\n"
        f"project: {state['project']}\n"
        f"total_exchanges: {total_exchanges}\n"
        f"first_prompt_time: {state['first_prompt_time'] or ''}\n"
        f"last_prompt_time: {state['last_prompt_time'] or ''}\n"
        "---\n\n"
        f"# Session Log - {state['date']}\n\n"
        f"Session: `{short}` | Project: `{state['project']}` | Author: {state['author']}\n\n"
        "---\n"
    )
    parts = [header]
    for e in state["entries"]:
        parts.append(
            f"\n[LOG_ENTRY type={e['type']} num={e['num']} session={short}]\n"
            f"timestamp: {e['timestamp']}\n"
            f"model: {e['model']}\n\n"
            f"{e['text']}\n\n"
        )
    return "".join(parts)


def write_file(state):
    with open(state["log_file"], "w") as f:
        f.write(render(state))


def latest_model_from_transcript(transcript_path, fallback):
    if not transcript_path or not os.path.exists(transcript_path):
        return fallback
    try:
        with open(transcript_path, "rb") as f:
            f.seek(0, os.SEEK_END)
            size = f.tell()
            chunk = 8192
            pos = size
            buf = b""
            while pos > 0:
                pos = max(0, pos - chunk)
                f.seek(pos)
                buf = f.read(size - pos) if pos == 0 else f.read(chunk) + buf
                lines = buf.split(b"\n")
                for line in reversed(lines):
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        d = json.loads(line)
                    except Exception:
                        continue
                    if d.get("type") == "assistant":
                        model = d.get("message", {}).get("model")
                        if model:
                            return model
                if pos == 0:
                    break
    except Exception:
        pass
    return fallback


def handle_session_start(data, state):
    model = data.get("model")
    if model:
        state["current_model"] = model


def num_for_prompt_id(state, prompt_id):
    """Correlate PROMPT/RESPONSE pairs by prompt_id rather than by counting
    entries, so a Stop firing without a matching prior UserPromptSubmit (e.g.
    the first Stop after these hooks were wired mid-session) can't shift the
    numbering of every pair that follows it."""
    if "prompt_order" not in state:
        # Seed with placeholders for entries logged before this correlation
        # scheme existed, so newly-correlated numbers continue after them
        # instead of colliding with legacy nums.
        legacy = max(
            sum(1 for e in state["entries"] if e["type"] == "PROMPT"),
            sum(1 for e in state["entries"] if e["type"] == "RESPONSE"),
        )
        state["prompt_order"] = ["__legacy__"] * legacy
    order = state["prompt_order"]
    if prompt_id and prompt_id in order:
        return order.index(prompt_id) + 1
    order.append(prompt_id)
    return len(order)


def handle_user_prompt_submit(data, state):
    ts = now_iso()
    if state["first_prompt_time"] is None:
        state["first_prompt_time"] = ts
    state["last_prompt_time"] = ts
    num = num_for_prompt_id(state, data.get("prompt_id"))
    state["entries"].append({
        "type": "PROMPT",
        "num": num,
        "timestamp": ts,
        "model": state["current_model"],
        "text": data.get("prompt", ""),
    })


def handle_stop(data, state):
    ts = now_iso()
    num = num_for_prompt_id(state, data.get("prompt_id"))

    model = latest_model_from_transcript(data.get("transcript_path"), state["current_model"])
    state["current_model"] = model

    text = data.get("last_assistant_message", "")
    state["entries"].append({
        "type": "RESPONSE",
        "num": num,
        "timestamp": ts,
        "model": model,
        "text": text,
    })


def handle_post_model_switch(data, state):
    to_model = data.get("to_model")
    if to_model:
        state["current_model"] = to_model


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0

    event = data.get("hook_event_name")
    session_id = data.get("session_id")
    if not session_id:
        return 0

    state = load_state(session_id, data)

    if event == "SessionStart":
        handle_session_start(data, state)
    elif event == "UserPromptSubmit":
        handle_user_prompt_submit(data, state)
    elif event == "Stop":
        handle_stop(data, state)
    elif event == "PostModelSwitch":
        handle_post_model_switch(data, state)
    else:
        return 0

    save_state(state)
    write_file(state)
    return 0


if __name__ == "__main__":
    sys.exit(main())
