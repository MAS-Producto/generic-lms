# PRD: Employee Learning Dashboard (Generic LMS Template)

---

## Document Metadata

| Field | Value |
|--------|--------|
| **PRD ID** | `0a8d4c6e-c949-49d8-88de-71f0dde4be0c` |
| **Version** | 1 |
| **Date** | 2025-06-03 |
| **Author** | Daniela Garcia |
| **Workflow status** | `draft` |
| **Prototype stack** | `new-app-moodle` |
| **Default layout** | `sidebar` |
| **Client brand** | `generic` (replace at Gate 2 with client brand; run `prototype-assembler`) |
| **Primary HTML entry** | `index.html` → redirects to `inicio.html` |
| **UI plan approved** | [ ] Date: _____ By: _____ |
| **Last frozen at** | — |

*Version, PRD ID, and Author are Agent-managed. Say **"Release prototype"** in chat (or `/release-prototype`) to archive the current generation to `releases/vN/` and start the next Version at repo root.*

---

## 1. PURPOSE / OBJECTIVE

**The Problem:** Employees cannot see mandatory training in one place. Onboarding/compliance courses and role-based learning paths (mallas) are split across LMS menus, so progress toward "fully compliant" is unclear. Supervisors lack a simple view of direct reports' mandatory progress.

**The Solution:** A **Mi Formación** module with:

- **Inicio** — landing dashboard with welcome banner, overall mandatory progress, and summary cards for **Formación base** and **Mallas**.
- **Formación base** — single mandatory course catalog (merged onboarding + compliance).
- **Mallas** — role-based learning path with fewer generic areas, sequential unlock, and course-style cards (same pattern as Formación base).
- **Biblioteca**, **Mi perfil**, **Mi equipo** (supervisors only) — same scope as reference prototype, without optional corporate program blocks.

**Business Impact:** Higher completion of mandatory training; clearer progress for employees and jefatura.

**Out of scope for this template:** Optional/corporate program catalogs, external postulation portals, and unlock-by-100% program blocks (removed from reference design).

---

## 2. USERS / ROLES

| Role | Label (UI) | Access |
|------|------------|--------|
| **Primary** | Colaborador | Own path: Inicio, Formación base, Mallas, Biblioteca, Mi perfil |
| **Supervisor** | Jefatura | Same as Colaborador + **Mi Equipo** when user has ≥1 direct report (`TBD` HR/LMS rule) |

**Permissions:** Base LMS student access. **Mi Equipo** MUST NOT appear for users with zero direct reports.

---

## 3. USER STORY

**AS A** Colaborador  
**I WANT TO** see my overall mandatory progress on **Inicio** and open **Formación base** or **Mallas** from one place  
**SO THAT** I know what to complete next without searching the LMS.

**AS A** Jefatura  
**I WANT TO** use the same **Inicio** experience for myself and open **Mi Equipo** to see each report's mandatory progress by **Formación base** and **Mallas**  
**SO THAT** I can follow up on compliance without admin tools.

---

## 4. FLOW DESCRIPTION (STEP-BY-STEP)

### 4.1 Entry and shell

1. User logs into LMS → **`index.html`** redirects to **`inicio.html`**.
2. **Sidebar (Mi Formación):** **Inicio**, **Formación base**, **Mallas**, **Biblioteca**, separator, **Mi perfil**, **Mi Equipo** (if eligible).
3. **Navbar:** notifications bell (mandatory pending items); user menu: **Panel de administración** (placeholder, no link in prototype) + **Cerrar sesión**.

### 4.2 Inicio — landing layout

**Layout (desktop):** single column, full width inside main.

```text
┌─────────────────────────────────────────────────────────────┐
│ [Optional] Congrats alert (first visit at 100% mandatory)    │
├─────────────────────────────────────────────────────────────┤
│ Welcome banner: Hola {nombre} + contextual subtitle + CTA    │
│ "Ir a Mi perfil"                                             │
├─────────────────────────────────────────────────────────────┤
│ Card "Resumen de formación" (h2)                             │
│  • Subtitle + KPI % + horizontal progress bar                │
│  • "X de Y ítems obligatorios"                               │
│  • 2 category summary tiles (md:grid-cols-2, stack mobile): │
│      [ Formación base ]  [ Mallas ]                          │
│      chip, X de Y, Ver cursos each                           │
│  • Mallas tile: optional compact rows per malla area         │
│      (chip + X de Y per area, max 3 rows)                    │
└─────────────────────────────────────────────────────────────┘
```

**Rationale:** No optional-program column; focus is mandatory progress only. Two equal summary tiles balance courses vs malla items.

4. User completes items in Moodle; **Avance general** = completed mandatory items ÷ total (Formación base courses + Malla course-cards).
5. At **100%**: progress complete styling; **dismissible congrats alert** on first visit; welcome subtitle reflects completion (no postulation CTA).

### 4.3 Formación base (`formacion-base.html`)

- Breadcrumb: **Inicio › Formación base**.
- Progress panel: chip, X de Y, %, bar.
- Unified toolbar: search, subcategory filter, status filter, clear, active filter tags.
- **Course cards** (media 16:9, subcategory + status chip, title, duration, **Ver más**, **Acceder**); grid 3×4, 12/page; pagination.
- Status: **Sin actividad** | **Pendiente** | **Aprobado** | **Reprobado** — only **Aprobado** counts toward progress.

### 4.4 Mallas (`mallas.html`)

- Breadcrumb: **Inicio › Mallas**.
- Progress panel + **Mi nivel de rol:** chip (`TBD` HR mapping).
- **3 horizontal tabs** (generic names):

| Tab | Generic label (ES) | Unlock |
|-----|-------------------|--------|
| 1 | **Fundamentos** | Always |
| 2 | **Desarrollo** | All items in Fundamentos complete |
| 3 | **Liderazgo** | All items in Desarrollo complete |

- **4th tab — Evaluación:** final assessment; unlock when all **Liderazgo** items complete (same sequential rule as reference).
- **Content:** same card component as Formación base (cover image, subcategory/area label, status chip, title, duration, Ver más modal, Acceder). No plain text-only capsule cards.
- Locked tabs: lock icon + tooltip; preview allowed; **Acceder** disabled until prior tab complete.
- Default active tab: leftmost unlocked with pending items.

### 4.5 Mi perfil (`mi-perfil.html`)

- Breadcrumb: **Inicio › Mi perfil**.
- Header: name, **Mi nivel de rol** chip, **Cursos completados** count.
- **Insignias:** **Formación base**, **Mallas** (current role level; locked until earned), prior-role Mallas badges when earned.
- **Historial de formación:** table, 10/page, search + category + status filters, **Descargar** on course rows (`TBD` production).

### 4.6 Mi equipo (`mi-equipo.html`)

- Breadcrumb: **Inicio › Mi equipo**.
- Table + toolbar (search, filters `TBD`); columns `TBD` (e.g. ID, name, department, role, overall %, actions).
- **Ver cursos** modal: member summary + **2** category panels (**Formación base**, **Mallas**) with expandable detail.

### 4.7 Biblioteca (`biblioteca.html`)

- Breadcrumb: **Inicio › Biblioteca**.
- Optional content; does **not** affect mandatory progress or notifications.
- Keep: search, type filter, 5 thematic tabs, resource cards, pagination (`TBD` catalog).

---

## 5. BUSINESS RULES (SUMMARY)

| # | Rule |
|---|------|
| R1 | **Avance general %** = completed mandatory items ÷ total × 100. Items = Formación base **courses** + Mallas **course-cards** (each counts as 1). Proportional weighting by count. |
| R2 | **Formación base** catalog identical for all employees. **Mallas** content varies by **nivel de rol** (`TBD`). |
| R3 | Category/tile chip **Completado** only when all items in that category/area are done. |
| R4 | Course/malla card progress: only **Aprobado** (courses) / **Completado** (`TBD` label for malla items) increments X de Y. |
| R5 | **Mallas** sequential unlock: Fundamentos → Desarrollo → Liderazgo → Evaluación. |
| R6 | **Insignias:** one for Formación base; one Mallas badge per **nivel de rol** when that path is fully complete; show earned prior-role badges only. |
| R7 | **Biblioteca** MUST NOT affect avance general, badges, historial mandatory rows, or notifications. |
| R8 | **Mi Equipo** only if ≥1 direct report. Job title alone does not grant access. |
| R9 | **Historial** lists completed mandatory items only; certificates on courses `TBD`. |

---

## 6. SCENARIO TABLE (ACCEPTANCE — LIGHT)

| IF THE USER… | AND… | THE SYSTEM MUST… |
|--------------|------|------------------|
| Opens **Inicio** | Mandatory progress 0% | Show welcome copy for start; progress bar at 0%; both category tiles **Pendiente**. |
| Opens **Inicio** | Partial progress | Contextual welcome; tiles show X de Y; bar partial. |
| Completes last mandatory item | Reaches 100% | Bar 100%; congrats on first visit; welcome copy for completion. |
| Clicks **Ver cursos** on a tile | From Inicio | Navigate to matching list page. |
| Uses Formación base list | Filters/search | Combine filters; paginate; empty states per `TBD` copy. |
| Opens locked Mallas tab | Prior area incomplete | Show lock; disable Acceder; allow preview. |
| Selects **Mi Equipo** | Has direct reports | Show team table and modal with 2 categories. |
| Selects **Mi Equipo** | No direct reports | Hide sidebar item; block direct URL (`TBD` redirect). |
| Opens notifications | Pending mandatory items | List items with links to Formación base or Mallas. |
| Opens **Biblioteca** | Any user | Show resources; no progress change. |

*Add client-specific rows at Gate 1.*

---

## 7. FIELDS AND MESSAGES (UI = SPANISH)

### 7.1 Inicio

| Element | Copy / behavior (ES) |
|---------|----------------------|
| Welcome `<h1>` | **Hola, {nombre}** |
| Welcome subtitle (0%) | *Bienvenido a tu espacio de formación. Completa Formación base y Mallas para cumplir tu ruta obligatoria.* |
| Welcome subtitle (partial) | *Continúa tu formación obligatoria.* |
| Welcome subtitle (100%) | *Completaste tu formación obligatoria.* |
| CTA | **Ir a Mi perfil** → `mi-perfil.html` |
| Card title | **Resumen de formación** |
| Progress subtitle | *Progreso de cursos obligatorios en Formación base y Mallas* |
| Count line | *X de Y ítems obligatorios* |
| Tile CTAs | **Ver cursos** |
| Congrats alert | *¡Felicitaciones! Completaste tu formación obligatoria.* (`TBD` exact copy) |

### 7.2 Categories

| Label | Use |
|-------|-----|
| **Formación base** | Sidebar, breadcrumb, tile, badge, filters |
| **Mallas** | Sidebar, breadcrumb, tile, badge |
| Malla tabs | **Fundamentos**, **Desarrollo**, **Liderazgo**, **Evaluación** |
| Role banner | **Mi nivel de rol:** + chip |

### 7.3 Course / malla card

| Chip states (courses) | **Sin actividad**, **Pendiente**, **Aprobado**, **Reprobado** |
| Actions | **Ver más**, **Acceder** |
| Empty filter | *No se encontraron cursos con los filtros aplicados.* (`TBD`) |

### 7.4 Mi perfil / equipo / biblioteca

Reuse reference prototype Spanish strings; replace **Inducción**, **Normativos**, **Skills**, **Mi Camino** with **Formación base**, **Mallas**, **Inicio** where applicable.

### 7.5 Notifications

- Summary: *Recordatorios de formación obligatoria*
- Empty: *No tienes recordatorios pendientes.*
- Links: `formacion-base.html`, `mallas.html`

---

## 8. EDGE CASES (LIGHT)

| Case | Behavior |
|------|----------|
| No courses assigned in Formación base | Empty catalog message + `TBD` support path |
| Role change mid-malla | Recalculate path; credit transversal completions (`TBD`) |
| 100% then new mandatory item assigned | Progress drops; congrats not re-shown (`TBD`) |
| Direct URL to `mi-equipo.html` without reports | Redirect to `inicio.html` |
| LMS load failure | Error stub on Inicio (`TBD`) |

---

## 9. DATA SOURCING

| Data | Source |
|------|--------|
| User name, avatar | LMS profile `TBD` |
| Formación base catalog & completion | LMS courses `TBD` |
| Mallas catalog by nivel de rol | LMS / HR `TBD` |
| Nivel de rol | HR → LMS `TBD` |
| Direct reports | Org chart `TBD` |
| Biblioteca resources | Content repo `TBD` |
| Certificates | LMS `TBD` |
| Demo/fixture counts | Prototype-only `TBD` (suggest: FB courses N + Mallas items M = total items) |

---

## 10. PROTOTYPE & SCREEN MAP

| Screen | HTML file | Layout | UI components (summary) |
|--------|-----------|--------|---------------------------|
| Redirect | `index.html` | — | Meta refresh → `inicio.html` |
| Landing | `inicio.html` | `new-app/layout-sidebar.html` | Welcome banner; full-width **Resumen de formación** card; 2 category tiles; sim-bar; congrats alert; notifications |
| Formación base | `formacion-base.html` | sidebar | Breadcrumb; progress panel; toolbar; media course cards; modal; pagination |
| Mallas | `mallas.html` | sidebar | Breadcrumb; progress panel; role chip; 3+1 tabs; same course cards; sequential lock |
| Mi perfil | `mi-perfil.html` | sidebar | Header; insignias (2 core + mallas per role); historial table |
| Mi equipo | `mi-equipo.html` | sidebar | Table; filters; modal (2 categories) |
| Biblioteca | `biblioteca.html` | sidebar | Tabs; resource cards; optional |

**Stack:** `new-app-moodle` · **Icons:** Heroicons inline · **Actions:** `btn-carozzi` / primary Tailwind pattern from kit

**Sidebar order:** Inicio → Formación base → Mallas → Biblioteca → (sep) → Mi perfil → Mi Equipo*

---

## 11. REVISION LOG

| Version | Date | Summary |
|---------|------|---------|
| 1 | 2025-06-03 | Generic template from Carozzi reference; removed Corporativos y Extensión; merged Formación base; Mallas simplified; new Inicio layout |

---

## Appendix: Mapping from Carozzi prototype

| Carozzi | Generic |
|---------|---------|
| Mi Camino (module) | **Mi Formación** |
| `mi-camino.html` | `inicio.html` |
| Inducción + Normativos | **Formación base** → `formacion-base.html` |
| Skills | **Mallas** → `mallas.html` |
| 5 skill areas | **Fundamentos**, **Desarrollo**, **Liderazgo** (+ Evaluación) |
| Capsule text cards | **Course-style media cards** |
| Corporativos y Extensión | **Removed** |
| 2/3 + 1/3 dashboard | **Full-width Resumen + 2 tiles** |
| Postular aquí | **Removed** |

---

## Open items (optional before first client build)

1. **Demo totals** for sim-bar (e.g. 20 Formación base + 9 Mallas = 29 items) — set when building the first client.
2. **Malla item status label** on cards: use **Aprobado** like courses, or **Completado** for microlearning — pick one for consistency.
3. **Evaluación** as 4th tab vs last card inside **Liderazgo** — template assumes 4th tab.
