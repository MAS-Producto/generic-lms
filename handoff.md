# Engineering handoff

## Deliverables
- [ ] **GitHub repository URL** (team `origin` remote — engineering uses this, not the client review host)
- [ ] [`prd.md`](prd.md) (sections 1–11; post UI-discovery)
- [ ] `vision.md` / `prd_*.md` (if multi-workflow)
- [ ] Root `*.html` prototypes (Bootstrap or Tailwind per stack)
- [ ] `css/`, `js/`, `assets/`

_Client review URL (optional, for PM/client demos only): see [`GUIDE.html`](GUIDE.html) — not required for engineering._

## From PRD Document Metadata
- **PRD ID:** __________
- **Version:** __________
- **Workflow status:** [implemented]
- **Prototype stack:** __________
- **Default layout:** __________
- **Client brand:** __________
- **Last frozen at:** __________

## Frozen prototype versions

Past generations are archived under [`releases/`](releases/ARCHIVE.md) (not on the public client URL). Say **"Release prototype"** in chat to archive the current generation; the Agent manages Version numbers.

## Screen index (from §10)
| HTML file | Screen | §6 scenarios covered |
| :---- | :---- | :---- |
| | | |

## PRD sections for implementation
| Section | Use for |
| :---- | :---- |
| §4 Flow | Step-by-step UI behavior |
| §6 Scenario Table | Acceptance tests |
| §7 Fields & Messages | Controls, copy, validation |
| §8 Edge Cases | Error, empty, network |
| §9 Data Sourcing | Integrations (evidence-backed only); **Canonical location** columns — not §9 prototype demo values |
| §10 Prototype map | HTML file, stack, components, test ids |

## Known gaps / out of scope
-

## Notes for production SDD

- HTML is **intent and behavior reference**, not production code.
- Engineering applies the team's own spec-driven development process (e.g. [GitHub spec-kit](https://github.com/github/spec-kit): `/speckit.specify`, `/speckit.plan`, `/speckit.implement`).
- Map `<!-- FEATURE: ... -->` and `data-testid` from §10 to implementation stories.
- Any HTML file with `<meta name="x-prototype-only" content="true">` in `<head>` is a **visual reference only** — not production code. spec-kit agents must treat these files as layout/behavior intent, not implementation targets.

### Exclude from spec-kit / production

Do **not** treat these as product requirements or implementation artifacts:

- `.sim-bar` and all simulation toggle markup/JS
- Instruction panels on each page (`<!-- PROTOTYPE-ONLY: instruction panel -->`)
- `data-prototype-sim` / hidden sim state blocks (behaviors are already in §6 / §8)
- §9 **Prototype demo value** cells (HTML-only; use integrations table for real data sources)
- `css/styles.css` sim-bar rules (assembled stack CSS is prototype shell, not production theme)

### HTML data attributes (spec-kit traceability)

| Attribute | Include in spec-kit? | Use |
| :---- | :---- | :---- |
| `data-testid` | **Yes** | Test traceability; map to §10 and implementation test tasks |
| `data-prototype-sim` | **No** | Prototype-only sim state blocks; strip / ignore (same as sim-bar) |

Never place `data-testid` and `data-prototype-sim` on the same element.

### §6 → spec-kit Given/When/Then mapping

Each §6 row maps to one acceptance scenario in spec-kit's `spec.md`:

| §6 column | spec-kit equivalent |
| :---- | :---- |
| IF THE USER... | **When** [action] (or part of **Given** if it sets initial context) |
| AND THE CONDITION IS... | **Given** [initial state / condition] (merge into Given or When as appropriate) |
| THE SYSTEM MUST... | **Then** [expected outcome] |

**Example:**

| IF THE USER... | AND THE CONDITION IS... | THE SYSTEM MUST... |
| :---- | :---- | :---- |
| Clicks "Submit" | All fields are valid | Save data and redirect to dashboard with a green toast notification |

→ **Given** the user has filled all required fields with valid values, **When** the user clicks "Submit", **Then** the system saves the data and redirects to the dashboard with a green toast notification.

### User story decomposition (§4 → spec-kit user stories)

§3 is the master user story. Before `/speckit.specify`, decompose §4 into independently testable user stories (US1 P1, US2 P2, …):

1. Identify natural breakpoints in §4 where partial delivery still has standalone value.
2. Each breakpoint becomes a spec-kit user story with its own **Independent Test** ("Can be fully tested by [action] and delivers [value]").
3. Assign §6 scenario rows to the user story they belong to.
4. Use §3 as the overarching narrative; do not collapse everything into one monolithic story.

**Example:** §4 steps 1–3 (entry + display) can ship and be tested without steps 4–5 (submit + confirmation) → US1 = view/list flow, US2 = submit/save flow.

### §10 columns for spec-kit

From §10, pass spec-kit only:

| Column | Pass to spec-kit? |
| :---- | :---- |
| Screen name | **Yes** — UI surface reference |
| PRD cross-ref (§4 / §6) | **Yes** — traceability |
| data-testid / ids | **Yes** — test traceability |
| HTML file | Optional — file naming reference only |
| Layout shell | **No** — prototype scaffolding |
| Stack | **No** — prototype scaffolding (real stack comes from `/speckit.plan`) |
| UI components | **No** — prototype scaffolding (derive from user stories + HTML ideal state) |
| Key interactions | Optional — supplement §4, not a substitute |

### TBD → spec-kit clarification markers

When feeding §9 (or any section) to spec-kit, replace **`TBD (needs confirmation)`** with **`[NEEDS CLARIFICATION: specific question]`** so the spec-kit agent flags unknowns instead of inventing API contracts or schema details.

### Multi-PRD projects

If the project has `vision.md` and multiple `prd_*.md` files (multi-workflow), run **`/speckit.specify` once per PRD**, creating a separate spec-kit feature branch per workflow (e.g. `specs/001-checkout/`, `specs/002-onboarding/`). Use `vision.md` for cross-workflow navigation only — each child PRD owns its own §4–§10.

### Recommended spec-kit input order

1. `prd.md` sections 1–9 (primary — especially §4–§8)
2. HTML **ideal-state** review for layout and component intent (not sim toggles)
3. This `handoff.md` screen index + §6 coverage map
4. Explicit instruction: **Do not implement prototype simulation chrome**

### spec-kit command sequence

Run in the **production codebase** (not the prototype repo), unless your team initializes spec-kit in the same repo:

```text
1. specify init . --integration <your-agent>
2. /speckit.constitution     ← paste tech stack constraints from §5 + §9 External systems
3. /speckit.specify          ← paste §1–§3 + §4 (decomposed user stories) + §6 (as Given/When/Then)
4. /speckit.clarify          ← resolve §5 / §7 / §8 TBDs and [NEEDS CLARIFICATION] items before planning
5. /speckit.plan             ← paste §9 External systems; attach HTML ideal-state with instruction:
                                "Ignore all .sim-bar markup, data-prototype-sim blocks,
                                 instruction panels, and files with x-prototype-only meta —
                                 see handoff.md exclusion list."
6. /speckit.tasks
7. /speckit.implement
```

For multi-PRD projects, repeat steps 3–7 per `prd_*.md`.
