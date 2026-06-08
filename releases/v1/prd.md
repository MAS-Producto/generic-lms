# PRD: Employee Learning Dashboard (Generic LMS Template)

---

## Document Metadata

| Field | Value |
|--------|--------|
| **PRD ID** | `0a8d4c6e-c949-49d8-88de-71f0dde4be0c` |
| **Version** | 1 |
| **Date** | 2025-06-03 |
| **Author** | Daniela Garcia |
| **Workflow status** | `implemented` |
| **Input richness** | `structured` |
| **First workflow completed** | 2025-06-03 |
| **Prototype stack** | `new-app-moodle` |
| **Default layout** | `sidebar` |
| **Client brand** | `masconsultores` (demo; swap via Metadata + `prototype-assembler` for each client) |
| **Primary HTML entry** | `index.html` → redirects to `inicio.html` |
| **UI plan approved** | [x] Date: 2025-06-03 By: Daniela Garcia |
| **Last frozen at** | — |

**Design system registry** *(filled at Gate 2; update when a new component role is introduced)*

| Role | Canonical pattern |
| :---- | :---- |
| Primary CTA | `.mf-btn-primary` |
| Secondary action | `.mf-btn-secondary` |
| Destructive action | TBD (not used in prototype) |
| Bookmark toggle | `.course-bookmark-btn` on card cover (top-left) + `data-mf-modal-bookmark` in Ver más modal |
| Table data surface | filter box + sortable table + pagination toolbar (Mi equipo, historial) |
| Form field | Tailwind bordered inputs in filter boxes |
| Empty state | centered dashed-border block + heading + helper + CTA per 007 |
| Progress ring | Single-segment SVG ring (Inicio hero) |
| Instruction banner | removed — sim-bar only (no per-page instruction panels) |

*Version, PRD ID, and Author are Agent-managed. Say **"Release prototype"** in chat (or `/release-prototype`) when you need to preserve the current prototype before a very different next version — archives to `releases/vN/` and starts the next Version at repo root; no version numbers in your message. To roll back, run **`/restore-prototype N`** (use the Version from `releases/ARCHIVE.md`); the Agent offers to release current work first and confirms before overwriting root.*

---

## 1. PURPOSE / OBJECTIVE

**The Problem:** Employees cannot see mandatory training in one place. Onboarding, compliance, complementary training, and role-based mallas are split across LMS menus, so progress toward "fully compliant" is unclear. Supervisors lack a simple view of direct reports' mandatory progress.

**The Solution:** A **Mi formación** module with:

- **Inicio** — landing dashboard with welcome banner, overall mandatory progress ring, and **Últimos vistos** course carousel.
- **Three mandatory grupos** (each its own sidebar item and page — **independent from Mallas**):
  - **Inducción** — onboarding courses; **within-grupo** curso locks.
  - **Cursos normativos** — compliance courses; **within-grupo** curso locks.
  - **Formación complementaria** — complementary mandatory courses; **no locks**.
- **Mallas** — one **malla assigned to the user** (by **nivel de rol**), with internal grupos (tabs), group-level and within-grupo prerequisites.
- **Biblioteca**, **Mis favoritos** (user-curated course bookmarks), **Mi perfil**, **Mi equipo** (supervisors only).

**Business Impact:** Higher completion of mandatory training; clearer progress for employees and jefatura.

**Out of scope:** Optional/corporate program catalogs, external postulation portals, unlock-by-100% program blocks.

### 1.1 Conceptual model (curso → grupo → malla)

| Concept | Definition | UI in prototype |
|---------|------------|-----------------|
| **Curso** | Base unit. Same card everywhere: cover 16:9, **categoría** chip, status chip, title, duration, **Ver más**, **Acceder**. | Course card |
| **Categoría** | **Property of a curso** (chip + filter). Independent of sidebar **grupo** name. | Chip on card; filter on each grupo page |
| **Grupo** | Named mandatory catalog of cursos. **Top-level grupos** = own sidebar + `.html` page. **Malla internal grupos** = tabs inside `mallas.html` only. | Sidebar item + dedicated page **or** tab within Mallas |
| **Malla** | Role-assigned learning path for one user. Contains **internal grupos** (tabs) with between-grupo and within-grupo rules. **Not** a parent of Inducción / Cursos normativos / Complementaria. | `mallas.html` |
| **Recurso (Biblioteca)** | Optional viewable asset (documento, video, imagen only). **Not** a curso; no progress, locks, or links. | Resource card: type icon, title, short description, **Ver** → content modal |

**There is no "Formación base" module, page, or sidebar item.** The old Formación base concept is replaced by three separate **grupos**.

**Prerequisite types:**

1. **Within-grupo (curso locks):** Applies to **Inducción**, **Cursos normativos**, and **Mallas** internal grupos. A curso is locked until prerequisite cursos in the **same grupo/page or same malla tab** are **Aprobado**. **Exception (prototype):** cursos **En proceso**, **Reprobado**, or **Aprobado** are never locked — the user can continue or retry.
2. **Between-grupos (Mallas only):** Internal malla tab B unlocks after tab A is fully **Aprobado**. Parallel tabs allowed (no edge between them).
3. **Top-level grupos (Inducción, Cursos normativos, Complementaria):** **no prerequisites between each other** — each sidebar page is always accessible. **Formación complementaria** has no within-grupo locks.

---

## 2. USERS / ROLES

| Role | Label (UI) | Access |
|------|------------|--------|
| **Primary** | Colaborador | Inicio, Inducción, Cursos normativos, Formación complementaria, Mallas, Biblioteca, Mi perfil |
| **Supervisor** | Jefatura | Same + **Mi equipo** when ≥1 direct report (`TBD (needs confirmation)`) |

**Default prototype persona:** **Jefatura** with direct reports. Demo user **María González**; **Mi nivel de rol:** **Líder** → malla **"Malla Líder — Ruta 2025"** assigned to this user.

---

## 3. USER STORY

**AS A** Colaborador  
**I WANT TO** see my overall mandatory progress on **Inicio** and open **Inducción**, **Cursos normativos**, **Formación complementaria**, or **Mallas** from one place  
**SO THAT** I know what to complete next without searching the LMS.

**AS A** Jefatura  
**I WANT TO** use the same **Inicio** for myself and open **Mi equipo** to see each report's progress by grupo and **Malla**  
**SO THAT** I can follow up on compliance without admin tools.

**AS A** Colaborador  
**I WANT TO** bookmark cursos from any course card and find them later in **Mis favoritos**  
**SO THAT** I can quickly return to cursos I care about without searching each grupo again.

---

## 4. FLOW DESCRIPTION (STEP-BY-STEP)

### 4.1 Entry and shell

1. **`index.html`** → **`inicio.html`** (meta refresh).
2. **Sidebar (Mi formación):** **Inicio** → **Inducción** → **Cursos normativos** → **Formación complementaria** → **Mallas** → **Biblioteca** → **Mis favoritos** → (sep) → **Mi perfil** → **Mi equipo** (if eligible).
3. **Navbar:** notifications **bell** → **dropdown panel** (pending mandatory cursos; empty state copy); user menu: **Panel de administración** (disabled placeholder) + **Cerrar sesión**.
4. **Sim-bar** (PROTOTYPE-ONLY, fixed bottom): label **Simulación de progreso**; **0% · 45% · 100%** as toggle buttons — prototype-wide via `localStorage`; drives hero ring, Últimos vistos carousel, malla tab locks, notifications, locked cards, congrats alert consistently on all pages. No persona toggle.

### 4.2 Inicio — mission-control landing

```text
┌─────────────────────────────────────────────────────────────┐
│ [Optional] Congrats alert (first visit at 100% mandatory)    │
├─────────────────────────────────────────────────────────────┤
│ HERO (brand-surface): ring % + Hola {nombre} + subtitle      │
│  Quick links: Ir a Mi perfil · Ver Mi equipo                 │
├─────────────────────────────────────────────────────────────┤
│ ÚLTIMOS VISTOS: horizontal carousel of course cards          │
│  scroll strip + prev/next; Ver más modal + Acceder → grupo   │
│  Prototype: sim-bar drives carousel (0% empty / 45% / 100%)  │
│  0%: empty state; 45%: in-progress mix; 100%: final cursos   │
└─────────────────────────────────────────────────────────────┘
```

- **Avance general** = all mandatory cursos **Aprobado** ÷ total (6 + 8 + 6 + 9 = **29**).
- **Últimos vistos** = horizontal carousel on **Inicio** only; **sim-bar** sets demo recents: **0%** = empty; **45%** = IND-4, NOR-3, MLL-4, COM-2; **100%** = IND-6, NOR-8, MLL-9, COM-6 (últimos cursos de cada ruta). Ver más / Acceder use the same course-card actions as grupo pages.
- **Ideal sim:** **13 de 29** (~45%). **0%** / **100%** = sim-bar toggles.

### 4.3 Inducción (`induccion.html`)

- Breadcrumb: **Inicio › Inducción**.
- Page description (replaces inline progress subtitle).
- Filter box: search (title only), **categoría** (curso subcategory), **estado**, clear — filters course grid live.
- Pagination below grid: page size (6 / 12 / 24; default **12**), **Página X de Y**, Anterior / Siguiente — applies to filtered results.
- **6 course cards** with **within-grupo locks** (parallel + join pattern — §9.2).

### 4.4 Cursos normativos (`cursos-normativos.html`)

- Breadcrumb: **Inicio › Cursos normativos**.
- Page description only (no inline grupo progress — same as Inducción).
- Same filter box and pagination as Inducción.
- **8 course cards** with **within-grupo locks** (§9.2).

### 4.5 Formación complementaria (`formacion-complementaria.html`)

- Breadcrumb: **Inicio › Formación complementaria**.
- Page description + same filter box and pagination as Inducción.
- **6 course cards** — **all Acceder enabled** (no locks).

### 4.6 Mallas (`mallas.html`)

- Breadcrumb: **Inicio › Mallas**.
- Header: **Tu malla:** **Malla Líder — Ruta 2025** (demo — assigned to logged-in user by **nivel de rol** **Líder**).
- **Mi nivel de rol:** **Líder** badge (no inline malla progress count).
- **4 internal grupos** as horizontal tabs:

| Tab | Prerequisite (between internal grupos) |
|-----|----------------------------------------|
| **Fundamentos** | None |
| **Desarrollo** | All **Fundamentos** **Aprobado** |
| **Liderazgo** | All **Desarrollo** **Aprobado** |
| **Evaluación** | All **Desarrollo** **Aprobado** (**parallel** with **Liderazgo**) |

- Locked tab / locked curso behavior per §1.1. Full mock in §9.2.

### 4.7 Mi perfil (`mi-perfil.html`)

- **Profile summary box** (same layout as Mi equipo modal profile per member): avatar placeholder with initials, nombre, RUT/DNI, cargo, gerencia/área/familia de cargo + large numeric metrics — **Finalizados**, **Aprobados**, **Reprobados** (from `historialCourseIds()` / `getCourseEstadoKey()`) and **Avance general** as **%** only (sim-bar; same calculation as Inicio hero; no doughnut).
- **Insignias:** one per top-level grupo (**Inducción**, **Cursos normativos**, **Formación complementaria**) + **Mallas** (current role); locked until grupo/malla fully **Aprobado**.
- **Historial** (mandatory cursos **finalizados** only — **Aprobado** or **Reprobado**; excludes Sin actividad / En proceso): **filter box** — **Buscar** (ID o curso) · **Categoría** (grupo) · **Estado** (**Todos** / **Aprobado** / **Reprobado**) · **Limpiar filtros**; catalog empty state when none finalized; filter empty state; table columns **ID**, **Curso**, **Categoría** (grupo only), **Estado**, **Fecha finalización**, **Certificado** (**Descargar** when **Aprobado**; — otherwise); **pagination** (6 / 12 / 24 per page, default **6**). Rows from `historialCourseIds()` via `renderHistorialTable()` on sim-bar change (same estado source as grupo cards).

### 4.8 Mi equipo (`mi-equipo.html`)

- **Filter box** (same pattern as grupo/Biblioteca): **Buscar** (RUT/DNI, nombre, gerencia, área, cargo, familia de cargo) · **Gerencia** · **Área** · **Familia de cargo** · **Limpiar filtros**; filter empty state when no rows match.
- Table of direct reports — columns (in order): **RUT/DNI**, **Nombre**, **Gerencia**, **Área**, **Cargo**, **Familia de cargo**, **Avance general** (brand progress bar + %), **Acciones**. All columns except **Acciones** are **sortable** (click header toggles asc/desc; default **Nombre** ascending; **Avance general** defaults to descending on first click).
- **Avance general** per row = share of all mandatory cursos assigned to that user (**Aprobado** / 29 in demo) — same calculation as **Inicio** overall progress for that user (not the supervisor’s sim-bar state).
- Row action **Ver cursos** as secondary table button (`.mf-btn-table`; not text link).
- **Pagination** on filtered rows: page size **6 / 12 / 24** (default **6**), **Anterior** / **Siguiente**, *Página N de M*.
- **Ver cursos** modal: **profile box** (same layout as Mi perfil summary — avatar placeholder with initials; nombre, RUT/DNI, cargo, gerencia/área/familia; **Finalizados** / **Aprobados** / **Reprobados** from per-member fixture; **Avance general** large **%**) + **filter box** (**Buscar** by ID or curso · **Categoría** = grupo: Inducción / Cursos normativos / Formación complementaria / Mallas · **Estado** · **Limpiar filtros**) + **sortable table** (columns **ID**, **Curso**, **Categoría**, **Estado**; same table/sort/pagination pattern as main Mi equipo table; per-member fixture, independent of supervisor sim-bar).

### 4.9 Mis favoritos (`mis-favoritos.html`)

- Breadcrumb: **Inicio › Mis favoritos**.
- Page description: user-curated list of bookmarked mandatory **cursos** (distinct from **Últimos vistos**, which is session-driven on Inicio).
- **Bookmark toggle** on every course card (grupo pages, Mallas, Inicio carousel) and in **Ver más** modal — top-left icon on cover; persists in `localStorage` (`mf-bookmarks`).
- **Mis favoritos** page: dynamic course-card grid from bookmark IDs; **filter box** — **Buscar** (title) · **Grupo** (Inducción / Cursos normativos / Formación complementaria / Mallas) · **Estado** · **Limpiar filtros**; catalog empty state when none saved; filter empty state; **pagination** (6 / 12 / 24 per page, default **12**). Same card actions (**Ver más**, **Acceder**, bookmark toggle) as grupo pages.
- Bookmarks do **not** affect **Avance general**, notifications, insignias, or historial.

### 4.10 Biblioteca (`biblioteca.html`)

- Optional; no impact on mandatory progress.
- Thematic tabs (dummy catalog): **Todos**, **Onboarding**, **Seguridad y salud**, **Liderazgo**, **Herramientas digitales** — each tab shows mixed documento / video / imagen resources.
- **Resource cards** (distinct from course cards): Heroicon by content type (no cover image), type chip, title, short description, single **Ver** action.
- **Ver** opens modal with inline content: document page image, video player, or image — by resource type.
- **Search / filter box** (same pattern as grupo pages): **Buscar** by title + **Tipo** (Documento / Video / Imagen) + **Limpiar filtros** — applies to resources visible on the **active thematic tab** (including **Todos**).
- **Pagination** on filtered results: page size **6 / 12 / 24** (default **12**), **Anterior** / **Siguiente**, *Página N de M*.

---

## 5. BUSINESS RULES (SUMMARY)

| # | Rule |
|---|------|
| R1 | **Avance general** counts every mandatory **curso** across all top-level grupos + malla (29 in demo). |
| R2 | **Inducción**, **Cursos normativos**, **Formación complementaria** = same for all employees. **Malla** = assigned per **nivel de rol** (`TBD (needs confirmation)`). |
| R3 | Mi perfil insignia unlocks when all cursos in that grupo/malla are **Aprobado**. |
| R4 | Only **Aprobado** increments progress. |
| R5 | **Categoría** ≠ grupo name; used for chip + filter only. |
| R6 | **Within-grupo locks:** Inducción, Cursos normativos, Mallas internal grupos (not Complementaria). |
| R7 | **Mallas between internal grupos:** per §4.6 graph. |
| R8 | **No cross-links** between top-level grupos (Inducción ⊥ Cursos normativos ⊥ Complementaria ⊥ Mallas at navigation level). |
| R9 | **Biblioteca** excluded from progress, badges, historial mandatory rows, notifications. |
| R10 | **Mi equipo** only with ≥1 direct report. |
| R11 | **Historial** = mandatory cursos **finalizados** (**Aprobado** or **Reprobado** only). |
| R12 | **Mis favoritos** = user-curated bookmarks only; toggle on any mandatory **curso** card; does not affect progress, notifications, insignias, or historial. |

---

## 6. SCENARIO TABLE (ACCEPTANCE)

*Each row is one acceptance scenario. For spec-kit handoff, map columns to Given/When/Then: **IF THE USER...** → When (action); **AND THE CONDITION IS...** → Given (state/condition); **THE SYSTEM MUST...** → Then (outcome). See `handoff.md` for a worked example.*

| IF THE USER… | AND… | THE SYSTEM MUST… |
|--------------|------|------------------|
| Opens **Inicio** | Sim **45%** | ~45% ring; Últimos vistos carousel (4 in-progress demo cards). |
| Opens **Inicio** | Sim **0%** | 0% progress; Últimos vistos empty state (no cards). |
| Opens **Inicio** | Sim **100%** | 100% progress; Últimos vistos shows last cursos per ruta (IND-6, NOR-8, MLL-9, COM-6). |
| Opens **Ver más** on a recent card | From Inicio | Open course preview modal (same as grupo pages). |
| Clicks **Acceder** on a recent card | Curso not locked | Navigate to grupo page (same button pattern as grupo pages). |
| Opens **Inducción** | Curso locked | Lock icon; **Acceder** disabled; tooltip lists prerequisites. |
| Opens **Formación complementaria** | Any | All **Acceder** enabled. |
| Opens **Mallas** | Demo user | Show **Malla Líder — Ruta 2025**; 4 internal tabs. |
| Opens locked Malla tab | Upstream incomplete | Lock tab; preview; **Acceder** disabled. |
| Opens **Mi equipo** | Has reports | Table shows RUT/DNI, org fields, **Avance general** bar per report; filters, **column sort**, and pagination apply. |
| Clicks a sortable column header | Mi equipo table | Sort rows by that column (asc/desc toggle); **Acciones** not sortable. |
| Opens **Mi equipo** modal | **Ver cursos** on a row | Profile box + sortable/filterable/paginated curso table (ID, Curso, Categoría, Estado) for that member. |
| Opens notifications | Pending items | Links to relevant grupo page or `mallas.html`. |
| Opens **Ver** on a Biblioteca resource | documento / video / imagen | Open modal showing that resource’s content (PDF page mock, player, or image). |
| Filters Biblioteca tab | e.g. **Onboarding** | Show only resources tagged to that thematic tab (mixed types). |
| Filters Biblioteca (search / tipo) | Active tab has matches | Filter visible resources by title and **Tipo**; empty state when no matches; **Limpiar filtros** resets search/tipo only (tab unchanged). |
| Paginates Biblioteca grid | Tab + filters yield &gt; page size | Show **Mostrar N por página** and page controls on filtered set; reset to page 1 on tab/filter change. |
| Filters grupo page (search / categoría / estado) | Inducción, Normativos, or Complementaria | Filter course grid by title, curso **categoría**, or **estado** chip; empty state when no matches. |
| Toggles bookmark on a course card | Any page with course cards | Icon fills (saved); course ID stored in `mf-bookmarks`; toast confirms action. |
| Opens **Mis favoritos** | Has bookmarks | Grid shows saved courses with grupo label, filters, and pagination. |
| Opens **Mis favoritos** | No bookmarks | Catalog empty state with **Explorar cursos** CTA. |
| Removes bookmark from **Mis favoritos** | Card visible | Card removed from grid; toggle off on other pages. |

---

## 7. FIELDS AND MESSAGES (UI = SPANISH)

### 7.1 Inicio

| Element | Copy |
|---------|------|
| Welcome subtitle (0%) | *Te damos la bienvenida a tu espacio de formación.* |
| Welcome subtitle (partial) | *Sigue avanzando en tu formación.* |
| Welcome subtitle (100%) | *Completaste todos tus cursos asignados.* |
| Congrats alert heading | *¡Felicitaciones!* |
| Congrats alert body | *Completaste todos tus cursos asignados.* |
| Congrats alert dismiss | Icon-only close (`aria-label` **Cerrar**) |
| Últimos vistos heading | *Últimos vistos* |
| Últimos vistos helper | *Retoma donde lo dejaste en tu última sesión* |
| Recientes empty heading | *Aún no has visto cursos* |
| Recientes empty helper | *Abre un curso desde tus rutas obligatorias y aparecerá aquí la próxima vez.* |
| Carousel controls | `aria-label` **Desplazar cursos anteriores** / **Desplazar cursos siguientes** |
| Hero quick links | **Ir a Mi perfil** · **Ver Mi equipo** |

### 7.2 Sidebar labels

**Inducción** · **Cursos normativos** · **Formación complementaria** · **Mallas** · **Biblioteca** · **Mis favoritos** · **Mi perfil** · **Mi equipo**

### 7.2.1 Grupo pages — description, filters, estados

| Screen | Page description |
|--------|------------------|
| Inducción | *Cursos de bienvenida e integración para nuevos colaboradores. Los cursos se desbloquean en secuencia dentro de este grupo.* |
| Cursos normativos | *Cursos obligatorios de compliance, ética, seguridad y normativa corporativa. Debes completarlos según el orden de prerrequisitos.* |
| Formación complementaria | *Cursos complementarios obligatorios sin bloqueos entre ellos. Puedes acceder a cualquier curso cuando lo necesites.* |

| Filter control | Copy / behavior |
|----------------|-----------------|
| Search | Placeholder *Buscar por título…* — matches **curso title** only (case-insensitive) |
| Categoría | Options populated from distinct **categoría** values on that page's cursos |
| Estado | **Todos** · **Sin actividad** · **En proceso** · **Aprobado** · **Reprobado** |
| Clear | **Limpiar filtros** |
| Pagination | **Mostrar** [6 / 12 / 24] **por página** (default 12) · **Página X de Y** · **Anterior** / **Siguiente** (filtered set) |
| Empty filter (heading) | *No se encontraron cursos* |
| Empty filter (helper) | *Prueba con otro título, categoría o estado, o **limpiar filtros**.* |

**Estado chips** on cards use the same four labels. Only **Aprobado** counts toward progress sim. Prototype **estado** fixtures vary by sim-bar (`EN_PROCESO_BY_LEVEL`, `REPROBADO_BY_LEVEL` in `mi-formacion.js`).

### 7.3 Mallas header

| Element | Copy |
|---------|------|
| Malla title | **Tu malla:** **Malla Líder — Ruta 2025** |
| Role chip | **Mi nivel de rol:** **Líder** |

### 7.4 Empty / locked copy

| State | Copy |
|-------|------|
| Empty filter | *No se encontraron cursos* (+ helper with **limpiar filtros** link on grupo pages) |
| Empty grupo | *Aún no tienes cursos asignados en [nombre grupo].* + support helper |
| Locked curso | *Completa [prerequisito] para desbloquear este curso.* |
| Locked malla tab | *Completa todos los cursos de [grupo upstream] para desbloquear esta sección.* |

### 7.5 Notifications

- Summary (dropdown heading): *Recordatorios de formación obligatoria*
- Empty: *No tienes recordatorios pendientes.*
- Links: `induccion.html`, `cursos-normativos.html`, `formacion-complementaria.html`, `mallas.html`
- Badge count derives from progress sim

### 7.6 Course preview modal (Ver más)

- Title, categoría, duration, description, prerequisites when locked
- Header bookmark toggle: `aria-label` **Guardar curso** / **Quitar de favoritos**; `aria-pressed` reflects saved state
- Footer: **Cerrar**; **Acceder** (disabled when locked)

### 7.6.1 Bookmarks (Mis favoritos)

| Element | Copy / behavior |
|---------|-----------------|
| Page title | **Mis favoritos** |
| Page helper | *Tus cursos marcados para retomar o consultar cuando lo necesites.* |
| Card toggle (off) | `aria-label` **Guardar curso** |
| Card toggle (on) | `aria-label` **Quitar de favoritos**; filled bookmark icon (`--brand-primary`) |
| Toast (add) | *Curso guardado en Mis favoritos.* |
| Toast (remove) | *Curso quitado de Mis favoritos.* |
| Filter toolbar | **Buscar** (placeholder *Buscar por título…*) · **Grupo** (**Todos** / Inducción / Cursos normativos / Formación complementaria / Mallas) · **Estado** (same as grupo pages) · **Limpiar filtros** |
| Catalog empty (heading) | *Aún no tienes cursos favoritos* |
| Catalog empty (helper) | *Usa el ícono de marcador en cualquier tarjeta de curso para agregarlo aquí.* |
| Catalog empty CTA | **Explorar cursos** → `induccion.html` |
| Filter empty (heading) | *No se encontraron cursos favoritos* |
| Filter empty (helper) | *Prueba con otro título, grupo o estado, o **limpiar filtros**.* |
| Pagination | **Mostrar** (6 / 12 / 24 por página) · *Página N de M* · **Anterior** · **Siguiente** |

### 7.7 Mi perfil

| Element | Copy / behavior |
|---------|-----------------|
| Page helper | *Insignias por grupo y registro de mi historial de cursos completados.* |
| Profile summary | Avatar initials · nombre · RUT/DNI · cargo · gerencia · área · familia de cargo · **Finalizados** / **Aprobados** / **Reprobados** large numeric stats (historial source) · **Avance general** large **%** (sim-bar; no doughnut) |
| Historial section heading | **Mi historial de formación** |
| Filter toolbar | **Buscar** (placeholder *Buscar por ID o curso…*) · **Categoría** (grupo; dynamic from rows) · **Estado** (**Todos** / **Aprobado** / **Reprobado**) · **Limpiar filtros** (hidden when catalog empty) |
| Catalog empty (heading) | *Aún no hay cursos finalizados* |
| Catalog empty (helper) | *Cuando completes un curso obligatorio con estado **Aprobado** o **Reprobado**, aparecerá en este historial.* |
| Historial table columns | **ID** · **Curso** · **Categoría** (grupo name only) · **Estado** (chips) · **Fecha finalización** · **Certificado** (**Descargar** `.mf-btn-table` secondary if Aprobado; — otherwise) |
| Filter empty (heading) | *No se encontraron cursos en el historial* |
| Filter empty (helper) | *Prueba con otro título, categoría o estado, o **limpiar filtros**.* |
| Pagination | **Mostrar** (6 / 12 / 24 por página) · *Página N de M* · **Anterior** · **Siguiente** |

### 7.8 Mi equipo

| Element | Copy / behavior |
|---------|-----------------|
| Page helper | *Seguimiento de formación obligatoria de tus reportes directos.* |
| Filter toolbar | **Buscar** (placeholder *RUT/DNI, nombre, gerencia, área, cargo o familia de cargo…* — matches those six text columns) · **Gerencia** (dynamic **Todas** + demo values) · **Área** (dynamic **Todas** + demo values) · **Familia de cargo** (dynamic **Todas** + demo values) · **Limpiar filtros** |
| Table columns | **RUT/DNI** · **Nombre** · **Gerencia** · **Área** · **Cargo** · **Familia de cargo** · **Avance general** (`.inicio-progress-fill` bar + % label) · **Acciones** |
| Sortable headers | All columns except **Acciones** — centered in `<thead>`; body cells **left-aligned**; button per `<th>` with `aria-sort`; chevron indicators; `.mf-table-sort-btn--active` uses `--brand-primary` |
| Filter empty (heading) | *No se encontraron colaboradores* |
| Filter empty (helper) | *Prueba con otros criterios de búsqueda o filtros, o **limpiar filtros**.* |
| Row action | **Ver cursos** (`.mf-btn-table` secondary in **Acciones** column) |
| Pagination | **Mostrar** (6 / 12 / 24 por página) · *Página N de M* · **Anterior** · **Siguiente** |

**Modal (Ver cursos):** profile box (same as Mi perfil summary — avatar + org fields + **Finalizados** / **Aprobados** / **Reprobados** + **Avance general** %) · filter toolbar (**Buscar** *ID o nombre del curso…* · **Categoría** · **Estado** · **Limpiar filtros**) · sortable table **ID** · **Curso** · **Categoría** (grupo) · **Estado** (chips: Aprobado / En proceso / Pendiente / Reprobado) · pagination (6/12/24). Per-member `EQUIPO_MEMBERS` fixture; independent of supervisor sim-bar.

### 7.9 Biblioteca — resource cards and content modal

| Element | Copy / behavior |
|---------|-----------------|
| Page helper | *Catálogo de material de consulta organizado por categorías.* |
| Filter toolbar | **Buscar** (placeholder *Buscar por título…*) · **Tipo** (**Todos** / **Documento** / **Video** / **Imagen**) · **Limpiar filtros** |
| Filter empty (heading) | *No se encontraron recursos* |
| Filter empty (helper) | *Prueba con otro título o tipo, o **limpiar filtros**.* |
| Pagination | **Mostrar** (6 / 12 / 24 por página) · *Página N de M* · **Anterior** · **Siguiente** |
| Empty state (heading) | *No hay recursos en esta categoría* |
| Empty state (helper) | *Prueba otra categoría o vuelve a **Todos** para ver el catálogo completo.* |
| Thematic tabs | **Todos** · **Onboarding** · **Seguridad y salud** · **Liderazgo** · **Herramientas digitales** |
| Card action | **Ver** (opens modal with resource content) |
| Type chips | **Documento** · **Video** · **Imagen** |
| Modal footer | **Cerrar** |
| Modal content | Documento → page preview image; Video → HTML5 player; Imagen → full image |

### 7.10 Prototype-only client state

| Key | Purpose |
|-----|---------|
| `mf-progress` | Sim-bar: `0` \| `45` \| `100` |
| `mf-congrats-seen` | Dismiss congrats on Inicio at 100% |
| `mf-recent-courses` | Prototype optional persistence on Ver más / Acceder; **Inicio carousel** driven by sim-bar (`RECENT_BY_LEVEL` in `mi-formacion.js`) |
| `mf-bookmarks` | JSON array of curso IDs bookmarked by user; demo seed `NOR-3`, `COM-2`, `MLL-4` on first visit when unset |

**Sim-bar label:** Simulación de progreso · **Controls:** **0% · 45% · 100%**

---

## 8. EDGE CASES

| Case | Behavior |
|------|----------|
| User has no malla assigned | Empty malla state + `TBD (needs confirmation)` |
| No cursos in a grupo | Empty catalog copy (§7.4) |
| Direct URL `mi-equipo.html` without reports | Redirect `inicio.html` |

---

## 9. DATA SOURCING

### 9.1 Production

| Data | Source |
|------|--------|
| Grupo catalogs | LMS `TBD (needs confirmation)` |
| Malla assignment by rol | LMS / HR `TBD (needs confirmation)` |
| Direct reports | Org chart `TBD (needs confirmation)` |

### 9.2 Prototype demo fixtures (HTML-only)

**Demo user:** María González · **Líder** · malla **Malla Líder — Ruta 2025**

**`CURRENT_USER` (Mi perfil summary):** RUT `10.234.567-8` · cargo *Jefa de capacitación y desarrollo* · Gerencia Corporativa · RR.HH. · Administración y soporte. **Avance general** = sim-bar progress (`progressPercent()` = Aprobado / 29).

**Totals:** 6 + 8 + 6 + 9 = **29** mandatory cursos. **Ideal sim:** **13 Aprobado** (4 Inducción + 3 Cursos normativos + 2 Complementaria + 4 Malla).

**Prototype-wide progress (logged-in user):** `APPROVED_BY_LEVEL`, `EN_PROCESO_BY_LEVEL`, and `REPROBADO_BY_LEVEL` keyed by sim-bar **0% / 45% / 100%**; `sanitizeProgressFixtures()` keeps sets disjoint. `getDashboardEstadoKey()` drives Inicio section donuts (adds **Bloqueado** vs **No iniciado**); `getCourseEstadoKey()` drives grupo/Malla cards, insignias, notifications, and profile avance. **Mi historial** lists only finalized rows (`historialCourseIds()` = **Aprobado** or **Reprobado**). **Mi equipo** table/modal use separate `EQUIPO_MEMBERS` per-report fixtures.

**Course card covers (16:9):** Temporary placeholders at `assets/images/courses/{course-id}.jpg` (see folder README). Loaded via `courseCoverUrl()` in `mi-formacion.js`. **Replace files in place** when client provides real cover art — same filenames, no code change. Production LMS cover source is `TBD (needs confirmation)`.

**Últimos vistos (sim-bar on Inicio):** `0%` → none; `45%` → IND-4, NOR-3, MLL-4, COM-2; `100%` → IND-6, NOR-8, MLL-9, COM-6.

**Mis favoritos (bookmarks):** `mf-bookmarks` in `localStorage`; demo seed on first visit: **NOR-3**, **COM-2**, **MLL-4**. Production source `TBD (needs confirmation)`.

**Mi equipo (`EQUIPO_MEMBERS` in `mi-formacion.js`):** six direct reports with RUT/DNI, gerencia, área, cargo, familia de cargo, and per-member `approved` curso IDs. **Avance general** = `round(approved.length / 29 × 100)` (same rule as Inicio for that user). Demo range: Pedro **14%** → Valentina **100%**.

#### Biblioteca (`biblioteca.html`) — optional resources (12 demo items)

| ID | Tab | Title | Type |
|----|-----|-------|------|
| BIB-1 | onboarding | Manual de onboarding | documento |
| BIB-4 | onboarding | Mensaje de bienvenida — CEO | video |
| BIB-5 | onboarding | Mapa de oficinas y servicios | imagen |
| BIB-2 | seguridad | Buenas prácticas de seguridad | video |
| BIB-3 | seguridad | Señalización de seguridad en planta | imagen |
| BIB-6 | seguridad | Protocolo de emergencias | documento |
| BIB-7 | liderazgo | Guía de feedback 1:1 | documento |
| BIB-8 | liderazgo | Comunicación asertiva para líderes | video |
| BIB-9 | liderazgo | Matriz de delegación | imagen |
| BIB-10 | herramientas | Manual de Microsoft Teams | documento |
| BIB-11 | herramientas | Primeros pasos en SAP | video |
| BIB-12 | herramientas | Atajos de teclado — productividad | imagen |

---

#### Grupo: Inducción (`induccion.html`) — 6 cursos, locks

**Categorías:** Bienvenida y onboarding · Cultura organizacional · Herramientas y sistemas

| ID | Title | Categoría | Prerequisite |
|----|-------|-----------|--------------|
| IND-1 | Bienvenida a la organización | Bienvenida y onboarding | — |
| IND-2 | Cultura y valores corporativos | Cultura organizacional | IND-1 |
| IND-3 | Uso de herramientas digitales | Herramientas y sistemas | IND-1 |
| IND-4 | Integración al equipo de trabajo | Cultura organizacional | IND-2 **and** IND-3 |
| IND-5 | Seguridad para nuevos ingresos | Herramientas y sistemas | IND-4 |
| IND-6 | Evaluación de inducción | Bienvenida y onboarding | IND-5 |

**Ideal sim Aprobado:** IND-1 through IND-4.

---

#### Grupo: Cursos normativos (`cursos-normativos.html`) — 8 cursos, locks

**Categorías:** Ética y compliance · Seguridad y salud · Privacidad y datos · Medio ambiente

| ID | Title | Categoría | Prerequisite |
|----|-------|-----------|--------------|
| NOR-1 | Código de ética y conducta | Ética y compliance | — |
| NOR-2 | Prevención de lavado de activos | Ética y compliance | NOR-1 |
| NOR-3 | Protección de datos personales | Privacidad y datos | NOR-1 |
| NOR-4 | Seguridad de la información | Seguridad y salud | NOR-2 **and** NOR-3 |
| NOR-5 | Prevención de riesgos laborales | Seguridad y salud | NOR-4 |
| NOR-6 | Gestión ambiental básica | Medio ambiente | NOR-4 |
| NOR-7 | Diversidad e inclusión | Ética y compliance | NOR-5 |
| NOR-8 | Reporte de incidentes | Seguridad y salud | NOR-6 |

**Ideal sim (45%):** **Aprobado** NOR-1–NOR-4 · **En proceso** NOR-5 · **Reprobado** NOR-6 (requiere NOR-4 aprobado) · **Bloqueados** NOR-7 (requiere NOR-5) y NOR-8 (requiere NOR-6 aprobado).

**Lock graph:** NOR-1 → NOR-2 ∥ NOR-3 → NOR-4 → NOR-5 ∥ NOR-6 → NOR-7 / NOR-8 (cadena vía NOR-6).

---

#### Grupo: Formación complementaria (`formacion-complementaria.html`) — 6 cursos, no locks

**Categorías:** Habilidades blandas · Desarrollo profesional · Idiomas · Bienestar

| ID | Title | Categoría |
|----|-------|-----------|
| COM-1 | Comunicación efectiva | Habilidades blandas |
| COM-2 | Trabajo en equipo | Habilidades blandas |
| COM-3 | Excel intermedio | Desarrollo profesional |
| COM-4 | Inglés técnico | Idiomas |
| COM-5 | Gestión del tiempo | Desarrollo profesional |
| COM-6 | Balance vida-trabajo | Bienestar |

**Ideal sim Aprobado:** COM-1, COM-2.

---

#### Malla: Malla Líder — Ruta 2025 (`mallas.html`) — assigned to demo user

**Internal grupos (tabs) — 9 cursos total**

```text
Fundamentos ──► Desarrollo ──► Liderazgo
                    │
                    └──► Evaluación   (parallel)
```

| Tab | ID | Title | Categoría (demo) | Prerequisite |
|-----|-----|-------|------------------|--------------|
| **Fundamentos** | MLL-1 | Liderazgo personal | Fundamentos | — |
| | MLL-2 | Comunicación asertiva | Fundamentos | MLL-1 |
| | MLL-3 | Gestión del cambio | Fundamentos | MLL-1 |
| | MLL-4 | Toma de decisiones | Fundamentos | MLL-2 **and** MLL-3 |
| **Desarrollo** | MLL-5 | Coaching para líderes | Desarrollo | tab unlock + — |
| | MLL-6 | Gestión de equipos remotos | Desarrollo | MLL-5 |
| **Liderazgo** | MLL-7 | Negociación avanzada | Liderazgo | tab unlock |
| | MLL-8 | Planificación estratégica | Liderazgo | tab unlock |
| **Evaluación** | MLL-9 | Evaluación final — Malla Líder | Evaluación | tab unlock |

**Ideal sim Aprobado:** MLL-1 through MLL-4 (Fundamentos complete; Desarrollo tab unlocked with pending items).

---

#### Pattern coverage checklist

| # | Pattern | Where |
|---|---------|--------|
| 1 | Curso = base card | All grupo pages + Mallas |
| 2 | Top-level grupo = sidebar + page | Inducción, Cursos normativos, Complementaria |
| 3 | Grupo with within-grupo locks | Inducción, Cursos normativos |
| 4 | Grupo with no locks | Formación complementaria |
| 5 | Malla assigned to user | Mallas header + fixtures |
| 6 | Malla internal grupos (tabs) | Mallas |
| 7 | Malla between-grupo sequential + parallel | Desarrollo → (Liderazgo ∥ Evaluación) |
| 8 | Within-grupo parallel + join | IND, NOR, MLL Fundamentos |
| 9 | Categoría independent of grupo | All pages |

---

## 10. PROTOTYPE & SCREEN MAP

| Screen | HTML file | Layout | UI components | Key data-testid |
|--------|-----------|--------|---------------|-----------------|
| Redirect | `index.html` | — | meta refresh | — |
| Inicio | `inicio.html` | sidebar | hero ring + recent carousel (course cards) \| `.mf-btn-secondary` quick links \| Heroicons \| course modal | `inicio-hero`, `inicio-recientes`, `recent-course-*`, `course-modal`, `inicio-hero-equipo`, `notifications-bell` |
| Inducción | `induccion.html` | sidebar | course card grid 3-col + filter box + pagination \| modal Ver más \| Heroicons | `induccion-desc`, `course-filters`, `course-grid`, `course-pagination`, `course-modal` |
| Cursos normativos | `cursos-normativos.html` | sidebar | same as Inducción | `normativos-desc`, `course-filters`, `course-grid`, `course-pagination` |
| Formación complementaria | `formacion-complementaria.html` | sidebar | course grid all unlocked + filter box + pagination | `complementaria-desc`, `course-filters`, `course-grid`, `course-pagination` |
| Mallas | `mallas.html` | sidebar | horizontal tabs + course grid \| grupo/curso lock | `mallas-header`, `mallas-tabs`, `course-grid` |
| Mi perfil | `mi-perfil.html` | sidebar | profile summary box + badge grid + filter box + table + pagination \| `.mf-btn-table` secondary row action \| status chips \| Heroicons | `perfil-profile`, `perfil-insignias`, `historial-filters`, `historial-table`, `historial-pagination` |
| Mi equipo | `mi-equipo.html` | sidebar | filter box + sortable table (RUT, org fields, avance bar) + pagination \| `.mf-btn-table` secondary row action \| modal profile + sortable/filterable curso table \| Heroicons | `equipo-filters`, `equipo-table`, `equipo-sort`, `equipo-pagination`, `equipo-modal`, `equipo-modal-profile`, `equipo-modal-filters`, `equipo-modal-table`, `EQUIPO_MEMBERS` |
| Biblioteca | `biblioteca.html` | sidebar | resource card grid + filter box + pagination \| type-colored icons (`--brand-blue` / `--brand-green` / `--brand-logo-yellow`) \| thematic tabs \| content modal \| Heroicons | `biblioteca-tabs`, `biblioteca-filters`, `resource-grid`, `biblioteca-pagination`, `resource-modal` |
| Mis favoritos | `mis-favoritos.html` | sidebar | dynamic course-card grid from `mf-bookmarks` + filter box (grupo/estado) + pagination \| `.course-bookmark-btn` on cards \| bookmark in course modal \| Heroicons | `favoritos-desc`, `bookmarks-grid`, `bookmarks-filters`, `bookmarks-pagination`, `course-modal` |

**Removed:** `formacion-base.html`

**Sidebar order:** Inicio → Inducción → Cursos normativos → Formación complementaria → Mallas → Biblioteca → Mis favoritos → (sep) → Mi perfil → Mi equipo*

**Stack:** `new-app-moodle` · **Brand:** `masconsultores` · **Icons:** Heroicons inline

---

## 11. REVISION LOG

| Version | Date | Summary |
|---------|------|---------|
| 1 | 2025-06-03 | Initial generic template import |
| 1 | 2025-06-03 | Gate 1: curso → grupo → malla model; fixtures; Mi equipo |
| 1 | 2025-06-03 | **Removed Formación base**; 3 top-level grupos (own pages) + Mallas independent; **Malla Líder — Ruta 2025** mock; 4 Inicio tiles |
| 1 | 2025-06-03 | Gate 2 UI approved; masconsultores; sim progress-only; modal/accordion patterns |
| 1 | 2025-06-03 | Gate 3: all §10 HTML screens built; `mi-formacion.js` prototype-wide progress sim |
| 1 | 2025-06-04 | Inicio hero: removed Biblioteca quick link (sidebar unchanged) |
| 1 | 2025-06-04 | Inicio: Siguiente paso replaced by Últimos vistos course-card carousel (`mf-recent-courses` localStorage) |
| 1 | 2025-06-04 | Últimos vistos: sim-bar drives 0%/45%/100% carousel; Ver más/Acceder match grupo course cards |
| 1 | 2025-06-04 | Inicio mission-control landing: hero ring + brand surface, enhanced tiles (icons + mini bars), quick links |
| 1 | 2025-06-03 | Sidebar rail nav: aligned Heroicons + `.heroicon` sizing across all §10 screens (match `inicio.html`) |
| 1 | 2025-06-03 | Sidebar icons: rail `[data-rail-icon]` CSS fix; simpler Heroicons (clipboard, plus-circle, library, users) |
| 1 | 2025-06-03 | Removed per-page instruction panels; sim-bar label **Simulación de progreso**; progress toggles as buttons |
| 1 | 2025-06-03 | Sidebar logo centered in `#railLogoBlock` |
| 1 | 2025-06-03 | Aligned rail/mobile shell on all §10 pages with `inicio.html` (`flex-col`, mobile drawer, navbar) |
| 1 | 2025-06-04 | Fixed desktop rail collapse toggle (`js/app.js`): width, labels, chevrons, `aria-expanded`; removed broken handler from `mi-formacion.js` |
| 1 | 2025-06-04 | Copy: categoría Inducción **Bienvenida y onboarding** (was "Bienvenida e onboarding") |
| 1 | 2025-06-04 | Biblioteca: icon-led resource cards (Documento/Video/Enlace), Ver preview modal, Descargar toast; distinct from course cards |
| 1 | 2025-06-04 | Biblioteca: Ver-only; content modal (doc/video/imagen); removed Enlace and Descargar |
| 1 | 2025-06-04 | Biblioteca: thematic tabs (Onboarding, Seguridad, Liderazgo, Herramientas); 12 mixed-type demo resources |
| 1 | 2025-06-04 | Biblioteca: resource icon colors by type (`--brand-primary` / `--brand-secondary` / `--brand-accent`) |
| 1 | 2025-06-04 | Re-applied kit `masconsultores` brand: logo purple `#833d8e` primary, full `--brand-logo-*` palette; `.mf-btn-primary` on all primary CTAs |
| 1 | 2025-06-04 | Sim bar: neutral gray (`#374151`) — decoupled from `--brand-primary` |
| 1 | 2025-06-04 | Biblioteca: generic page description and tab hints (category-based copy) |
| 1 | 2025-06-04 | Biblioteca: richer generic copy — catalog purpose, Ver action, tab/empty-state hints |
| 1 | 2025-06-04 | Biblioteca: trimmed page helper (removed Ver/inline viewer sentence) |
| 1 | 2025-06-04 | Biblioteca page helper: *Catálogo de material de consulta organizado por categorías.* |
| 1 | 2025-06-04 | Biblioteca: resource type icons/chips use logo palette (documento=blue, video=green, imagen=yellow) |
| 1 | 2025-06-04 | Grupo pages (Inducción, Normativos, Complementaria): section descriptions, boxed filters, live search/categoría/estado filter; estados Sin actividad / En proceso / Aprobado / Reprobado |
| 1 | 2025-06-04 | Grupo course grids: pagination (page size 6/12/24, default 12, Anterior/Siguiiente) on filtered results |
| 1 | 2025-06-04 | Course cards: thematic Unsplash stock covers (16:9) via `COURSE_COVERS` in `mi-formacion.js` |
| 1 | 2025-06-04 | Course covers: local placeholder JPEGs in `assets/images/courses/` (swap-by-filename for client art; fixed broken remote URLs) |
| 1 | 2025-06-04 | Biblioteca: search + tipo filter box (scoped to active tab); filter empty state |
| 1 | 2025-06-04 | Biblioteca: removed tab hint line below category tabs |
| 1 | 2025-06-04 | Biblioteca: pagination on filtered resource grid (6/12/24 per page, default 12) |
| 1 | 2025-06-04 | Mi equipo: boxed filters, live search/área, filter empty state, table row outline buttons, pagination (6/12/24) |
| 1 | 2025-06-04 | Mi perfil: page helper, boxed historial filters (buscar/categoría/estado), filter empty state, pagination (6/12/24) |
| 1 | 2025-06-04 | Mi equipo: table columns RUT/DNI, Nombre, Gerencia, Área, Cargo, Familia de cargo, Avance general bar; `EQUIPO_MEMBERS` fixture; modal uses per-member progress |
| 1 | 2025-06-04 | Mi equipo: search placeholder lists all text columns; filters **Gerencia** and **Familia de cargo** (dynamic selects from `EQUIPO_MEMBERS`) |
| 1 | 2025-06-04 | Mi equipo: sortable column headers (all except Acciones); default sort Nombre asc |
| 1 | 2025-06-04 | Mi equipo: centered column headers; table body cells remain left-aligned |
| 1 | 2025-06-04 | Mi equipo: **Ver cursos** row action uses `.mf-btn-primary` |
| 1 | 2025-06-04 | Mi equipo modal: profile box (avatar initials) + sortable/filterable/paginated curso table (ID, Curso, Categoría, Estado); replaced accordion panels |
| 1 | 2025-06-04 | Mi equipo modal: **Avance general** uses doughnut ring (Inicio hero SVG pattern) instead of progress bar |
| 1 | 2025-06-04 | Mi perfil: profile summary box (same as Mi equipo modal profile; `CURRENT_USER` + sim-bar avance doughnut) |
| 1 | 2025-06-04 | Mi perfil: historial section heading **Mi historial de formación** (was *Historial de formación obligatoria*) |
| 1 | 2025-06-04 | Mi perfil historial: columns ID, Curso, Categoría (grupo), Estado, Fecha finalización, Certificado (Descargar); categoría filter = grupo |
| 1 | 2025-06-04 | Prototype-wide button system in `css/styles.css`: `.mf-btn-primary`, `.mf-btn-secondary`, `.mf-btn-sm`, `.mf-btn-pagination`, `.mf-btn-icon`, `.mf-btn-link` applied on all §10 screens |
| 1 | 2025-06-04 | Mi perfil historial + Mi equipo table row actions aligned via `.mf-btn-table` (primary compact; left-aligned action cells) |
| 1 | 2025-06-04 | `.mf-btn-table` restyled as secondary (outline) for all table row actions |
| 1 | 2026-06-04 | Kit migrate: aligned product docs with kit template (kit commit `5e1f2be`) |
| 1 | 2026-06-04 | `prototype-assembler` re-run: `css/styles.css` four `@prototype-layer` sections (stack + layout-shell + brand + product); refreshed `js/app.js` and `assets/images/logo.svg`; removed root `layout-shell.css`; all screens link only `css/styles.css` |
| 1 | 2026-06-04 | Cross-page data alignment: historial renders all 29 mandatory cursos from shared sim fixtures; Estado filter matches grupo pages; `sanitizeProgressFixtures()`; §4.7 / §9.2 updated |
| 1 | 2026-06-04 | Mi historial: only finalized cursos (**Aprobado** / **Reprobado**); catalog empty state at 0%; Estado filter reduced to Todos / Aprobado / Reprobado |
| 1 | 2026-06-04 | Sim consistency: `isCourseEngaged()` — En proceso / Reprobado / Aprobado never locked; strip en-proceso from locked slots in fixtures; removed NOR-5 from 45% en-proceso (prereq NOR-4 not aprobado) |
| 1 | 2026-06-04 | Normativos 45% fixtures aligned to lock graph (NOR-4 aprobado, NOR-5 en proceso, NOR-6 reprobado); strip reprobado on locked slots; grupo progress on `cursos-normativos.html` |
| 1 | 2026-06-08 | Kit migrate: aligned product docs with kit template (kit commit `9905ac5`, ref `kit/kit-refactor`) |
| 1 | 2026-06-08 | Inicio congrats alert: body *Completaste todos tus cursos asignados.*; dismiss via icon-only close (no **Entendido** CTA) |
| 1 | 2026-06-08 | Inicio welcome subtitle (100%): *Completaste todos tus cursos asignados.* |
| 1 | 2026-06-08 | Inicio hero: removed secondary **Avance general** bar panel (ring % retained) |
| 1 | 2026-06-08 | Inicio **Tus rutas obligatorias**: summary tiles → section dashboards with progress headers + horizontal course-card strips per grupo/malla; **Ver todos** secondary CTAs |
| 1 | 2026-06-08 | Inicio **Tus rutas obligatorias**: section dashboards → per-section estado donut (SVG) + numeric legend (Aprobado / En proceso / Reprobado / Bloqueado / No iniciado); sim-bar driven via `getDashboardEstadoKey()` |
| 1 | 2026-06-08 | Inicio section title: *Tus rutas obligatorias* → *Estado de tu formación por sección* |
| 1 | 2026-06-08 | Inicio section dashboards: compact 2×2 cards (smaller donut, inline legend, `mf-btn-sm`); descriptions moved to `title` tooltip |
| 1 | 2026-06-08 | Mi perfil page helper: *cursos obligatorios completados* → *mi historial de cursos completados* (§7.7) |
| 1 | 2026-06-08 | Mi perfil profile summary: historial stats (**Finalizados**, **Aprobados**, **Reprobados**) as large numbers beside Avance general doughnut; `profileHistorialCounts()` on sim-bar (§4.7, §7.7) |
| 1 | 2026-06-08 | Mi perfil profile summary: stats first (short dividers between columns), then Avance general doughnut |
| 1 | 2026-06-08 | Mi perfil **Avance general**: doughnut → large **%** stat to match Finalizados / Aprobados / Reprobados (§4.7, §7.7) |
| 1 | 2026-06-08 | Inicio: removed **Estado de tu formación por sección** section dashboards (hero + Últimos vistos only); §4.2, §6, §7.1, §10 updated |
| 1 | 2026-06-08 | Inicio welcome subtitle (0%): generic welcome copy without listing grupos (§7.1) |
| 1 | 2026-06-08 | Inicio welcome subtitle (partial): *Sigue avanzando en tu formación.* — removed *obligatoria* (§7.1) |
| 1 | 2026-06-08 | Mi equipo modal profile: aligned with Mi perfil summary (Finalizados / Aprobados / Reprobados + Avance general % per member via `memberHistorialCounts()`; removed doughnut) |
| 1 | 2026-06-08 | Cursos normativos: removed inline **Progreso del grupo** subtitle (§4.4) |
| 1 | 2026-06-08 | Mallas: removed inline **Progreso de la malla** count (§4.6) |
| 1 | 2026-06-08 | Desktop rail collapse: generic nav label selectors + `app-rail-shell--collapsed` (regression after kit assembler refresh) |
| 1 | 2026-06-08 | Desktop rail collapse: persist collapsed state in `localStorage` (`mf-rail-collapsed`) across §10 page navigations |
| 1 | 2026-06-08 | **Mis favoritos:** bookmark toggle on course cards + Ver más modal; sidebar page `mis-favoritos.html` with filter/pagination grid; `mf-bookmarks` localStorage (§4.9, §5 R12, §6, §7.6.1, §9, §10) |
| 1 | 2026-06-08 | Copy: label **Mis guardados** → **Mis favoritos**; screen `mis-guardados.html` → `mis-favoritos.html` (§4.9, §7.6.1, §10) |
| 1 | 2026-06-08 | Copy: sentence case for sidebar labels and page titles — **Cursos normativos**, **Mi equipo**, **Mi formación** (§7.2, §10; all §10 screens + `mi-formacion.js` GRUPOS labels) |

---

## Appendix: Template customization (per client)

This PRD and prototype are **client-agnostic**. To deploy for a new organization:

1. Copy `prd.md` (and HTML/css/js/assets) to a new product repo or release.
2. Update Document Metadata **Client brand** to a kit entry in `templates/brands/{client}/` (or run `/create-brand`).
3. Re-run **`prototype-assembler`** — swaps logo, fonts, and `--brand-*` tokens only; flows and fixtures stay the same.
4. Adjust §9 production sources and demo copy as needed; keep grupo/malla structure unless the client scope differs.

**Demo brand for this repo:** `masconsultores` (`--brand-primary: #833d8e` logo purple; site magenta `#75238b` as `--brand-magenta`).
