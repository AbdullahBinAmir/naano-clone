# Capture Test

## Tool and model

- **Tool:** Claude Code (CLI / VS Code extension)
- **Model:** Sonnet 5 (`claude-sonnet-5`). No planner/executor split — one model
  handles both planning and execution in a normal interactive session; the model
  can only change mid-session via `/model`, which is why the hook setup below
  also tracks model switches explicitly.

## Mechanism

Claude Code hooks, configured in [`.claude/settings.json`](.claude/settings.json).
Four lifecycle events are wired, all to the same script,
[`.claude/hooks/agent_log.py`](.claude/hooks/agent_log.py):

- `UserPromptSubmit` — fires when a prompt is submitted; payload includes the
  verbatim prompt text and a `prompt_id`.
- `Stop` — fires when the agent finishes a turn; payload includes
  `last_assistant_message` (the final response text, tool calls/thinking excluded)
  and the same `prompt_id` as the triggering prompt.
- `SessionStart` — seeds the tracked model for a new session, when Claude Code
  supplies one.
- `PostModelSwitch` — updates the tracked model immediately if the user switches
  models mid-session (`/model`), so a mid-build switch is visible in the log.

The script maintains a small per-session JSON state file under
`.claude/hooks/.state/` (gitignored — bookkeeping only, not part of the log) and
regenerates the corresponding Markdown file in `.agent-logs/` on every hook call,
so the frontmatter (`total_exchanges`, `first_prompt_time`, `last_prompt_time`)
stays accurate without hand-patching a growing text file.

## Log files the canaries landed in

- Session 1 (the session that installed the hook, mid-session):
  [`.agent-logs/2026-09-12_07-58-59_adeb2923-2037-4932-9611-3fb37668f576.md`](.agent-logs/2026-09-12_07-58-59_adeb2923-2037-4932-9611-3fb37668f576.md)
- Session 2 (a separate session started after the hook was already installed):
  [`.agent-logs/2026-09-12_08-04-44_052a92c8-fe11-480d-953f-baefb5daefe5.md`](.agent-logs/2026-09-12_08-04-44_052a92c8-fe11-480d-953f-baefb5daefe5.md)

## Canary entries, pasted raw

### Session 1 (installed the hook mid-session)

The first two canary attempts in this session failed — see "What didn't work
first" below — so the entries below are the third attempt, the first one that
actually carried text. Its response is numbered one higher (`num=4` instead of
`num=3`) because a `Stop` fired earlier in this same session with no matching
prior `UserPromptSubmit` (the prompt before the hook existed) — a one-time
bootstrap artifact of installing the hook mid-session, not a defect in normal
operation (confirmed clean in session 2 below). Left in rather than relabeled,
per the assignment's own instruction not to tidy the log after the fact.

```
[LOG_ENTRY type=PROMPT num=3 session=adeb2923]
timestamp: 2026-09-12T08:00:28.974Z
model: claude-sonnet-5

CAPTURE TEST — 8x assignment, Abdullah Amir
```

```
[LOG_ENTRY type=RESPONSE num=4 session=adeb2923]
timestamp: 2026-09-12T08:02:07.518Z
model: claude-sonnet-5

Numbering fix applied and syntax-checked. When this turn ends, the `Stop` hook will fire and should log this response paired correctly with your last canary prompt. Send anything as your next message and I'll verify the pairing, then move on to the second-session test and `CAPTURE-TEST.md`.
```

### Session 2 (separate session, hook already installed)

Pairing is clean here (`num=1`/`num=1`) since this session started after the
hook was fully working, with no bootstrap gap:

```
[LOG_ENTRY type=PROMPT num=1 session=052a92c8]
timestamp: 2026-09-12T08:05:00.523Z
model: claude-sonnet-5

CAPTURE TEST — 8x assignment, Abdullah Amir (session 2)
```

```
[LOG_ENTRY type=RESPONSE num=1 session=052a92c8]
timestamp: 2026-09-12T08:05:06.027Z
model: claude-sonnet-5

This looks like an internal test message rather than an actual task request — there's nothing here for me to act on. Could you clarify what you'd like me to do?
```

(That response is a stray, unrelated message that arrived in the second
session — not something staged for this test. It's left verbatim because
that's genuinely what the hook captured.)

## What didn't work first

1. **Wrong prompt field name from documentation.** The official Claude Code
   hooks docs (fetched via `WebFetch`, which summarizes pages through a small
   model rather than returning raw text) described the `UserPromptSubmit`
   payload as containing a `user_prompt` field. The script was first written
   against that field name. The first real canary
   (`.agent-logs/.../adeb2923....md`, `PROMPT num=1`) came through with an
   **empty** prompt text as a result — visible in that file, left unedited.
   Verified the actual payload by temporarily dumping raw stdin JSON to a
   scratch file on the next hook call; the real field is `prompt`, not
   `user_prompt`. Fixed the script and removed the temporary debug dump.
2. **Turn-numbering drift from counting entries instead of correlating by
   `prompt_id`.** The first implementation numbered `PROMPT`/`RESPONSE` pairs
   by counting how many of each type existed so far. Because installing the
   hook mid-session produced one `Stop` with no matching prior
   `UserPromptSubmit`, every pair after it was numbered one apart from its
   actual partner. Fixed by correlating `PROMPT` and `RESPONSE` entries using
   the `prompt_id` field both events carry, with legacy (pre-fix) entries
   seeded as placeholders so new numbers don't collide with them. Confirmed
   fixed cleanly in session 2, which started after the fix was in place.
