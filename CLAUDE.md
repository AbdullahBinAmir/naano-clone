@AGENTS.md

# Project rules
- Design: follow docs/design/DESIGN.md exactly. Reference images are in docs/design/.
- Never use mock, demo, or hardcoded data. All data comes from Supabase via
  src/lib/actions and src/lib/supabase. If data doesn't exist, show an empty state.
- Do not modify supabase/migrations unless explicitly asked.
- Reuse components; build shared UI in src/components/ui before page-specific code.
- One task at a time. After each task: run the build, fix errors, summarize changes.
