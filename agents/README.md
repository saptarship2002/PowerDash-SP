# Dashboard build pipeline — subagent set

Nine subagents covering a full dashboard build, from requirements to shipped docs.

## Install

Copy these files into your project's subagent folder:

```bash
# Project-scoped (recommended — check into version control with your dashboard code)
mkdir -p .claude/agents
cp *.md .claude/agents/          # (skip this README)

# OR user-scoped (available in every project on your machine)
mkdir -p ~/.claude/agents
cp *.md ~/.claude/agents/
```

Restart your Claude Code session once after the first copy so it picks up the new `agents/` directory.

## The pipeline

| Stage | Agent(s) | What it does |
|---|---|---|
| 1. Planning | `requirements-analyst` | Clarifies audience, data sources, KPIs, layout priorities |
| 2. Design | `data-architect`, `ux-layout-designer` | Schema + API contract, and grid layout + widget spec (parallel) |
| 3. Build | `backend-engineer`, `frontend-engineer`, `chart-specialist` | API endpoints, page shell/state, and chart implementations (parallel) |
| 4. Quality | `code-reviewer`, `test-engineer`, `performance-auditor` | Read-only review, tests, and performance audit |
| 5. Ship | `docs-writer` | README, data-source docs, contributor guide |

## Running it

Simplest: just describe the dashboard and let Claude delegate automatically — each agent's `description` field is written so Claude knows when to invoke it.

```
Build me a sales dashboard showing daily revenue, top products, and conversion
funnel, pulling from our Postgres orders table.
```

Claude should walk requirements-analyst -> data-architect + ux-layout-designer ->
backend-engineer + frontend-engineer + chart-specialist -> code-reviewer +
test-engineer + performance-auditor -> docs-writer, largely on its own.

To force a specific stage explicitly, name the agent or @-mention it:

```
Use the requirements-analyst agent to scope this dashboard first
@data-architect design the schema for the metrics above
Use the chart-specialist agent to fix the revenue chart's chart type
```

## Customizing

- **Tech stack**: the agents are stack-agnostic by design. If your project always uses a specific chart library or ORM, add a line to the relevant agent's system prompt (e.g. "Always use Recharts, never introduce another charting library").
- **Models**: `docs-writer` defaults to `haiku` (cheap, low-stakes writing). `data-architect` defaults to `opus` (schema design benefits from stronger reasoning). Adjust freely based on cost/quality tradeoffs.
- **Tool restrictions**: `code-reviewer` and `performance-auditor` are read-only (`Read, Grep, Glob, Bash` — no `Write`/`Edit`) so they can't accidentally modify code while reviewing. Keep it that way unless you want them to auto-fix issues.
