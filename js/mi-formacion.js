/**
 * Mi formación — prototype-wide progress simulation (localStorage: mf-progress)
 * Values: "0" | "45" | "100"
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mf-progress';
  var CONGRATS_KEY = 'mf-congrats-seen';
  var RECENT_KEY = 'mf-recent-courses';
  var BOOKMARKS_KEY = 'mf-bookmarks';
  var RECENT_MAX = 8;

  /** Demo seed when bookmarks storage is unset (prototype first visit). */
  var BOOKMARKS_DEMO_SEED = ['NOR-3', 'COM-2', 'MLL-4'];

  var BOOKMARK_SVG_OUTLINE = '<svg class="heroicon heroicon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"/></svg>';
  var BOOKMARK_SVG_SOLID = '<svg class="heroicon heroicon-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clip-rule="evenodd"/></svg>';
  var DEMO_USER = 'María González';

  /** Logged-in demo user org profile (Mi perfil summary; sim-bar drives avance). */
  var CURRENT_USER = {
    nombre: DEMO_USER,
    rut: '10.234.567-8',
    cargo: 'Jefa de capacitación y desarrollo',
    gerencia: 'Gerencia Corporativa',
    area: 'RR.HH.',
    familiaCargo: 'Administración y soporte'
  };

  /** Sim-bar driven recents on Inicio (prototype); not tied to mf-recent-courses storage */
  var RECENT_BY_LEVEL = {
    '0': [],
    '45': ['IND-4', 'NOR-3', 'MLL-4', 'COM-3'],
    '100': ['IND-6', 'NOR-8', 'MLL-9', 'COM-6']
  };

  /** Achievement insignias earned per sim-bar level (prototype fixture; production rules TBD). */
  var INSIGNIAS_BY_LEVEL = {
    '0': [],
    '45': ['primer-paso', 'velocista', 'sobresaliente', 'explorador', 'maraton'],
    '100': ['primer-paso', 'velocista', 'sobresaliente', 'perfeccionista', 'constancia', 'explorador', 'maraton', 'al-dia']
  };

  var ASSIGNED_GRUPOS = [
    {
      slug: 'induccion',
      key: 'induccion',
      name: 'Inducción',
      description: 'Cursos de bienvenida e integración para nuevos colaboradores. Los cursos se desbloquean en secuencia dentro de este grupo.',
      locksEnabled: true,
      courseIds: ['IND-1', 'IND-2', 'IND-3', 'IND-4', 'IND-5', 'IND-6']
    },
    {
      slug: 'cursos-normativos',
      key: 'normativos',
      name: 'Cursos normativos',
      description: 'Cursos obligatorios de compliance, ética, seguridad y normativa corporativa. Debes completarlos según el orden de prerrequisitos.',
      locksEnabled: true,
      courseIds: ['NOR-1', 'NOR-2', 'NOR-3', 'NOR-4', 'NOR-5', 'NOR-6', 'NOR-7', 'NOR-8']
    },
    {
      slug: 'formacion-complementaria',
      key: 'complementaria',
      name: 'Formación complementaria',
      description: 'Cursos complementarios obligatorios sin bloqueos entre ellos. Puedes acceder a cualquier curso cuando lo necesites.',
      locksEnabled: false,
      courseIds: ['COM-1', 'COM-2', 'COM-3', 'COM-4', 'COM-5', 'COM-6']
    }
  ];

  function grupoPageUrl(slug) {
    return 'grupo.html?grupo=' + encodeURIComponent(slug);
  }

  function mallaPageUrl(slug) {
    return 'malla.html?malla=' + encodeURIComponent(slug);
  }

  var ASSIGNED_MALLAS = [
    {
      slug: 'programa-liderazgo',
      name: 'Programa de Liderazgo',
      description: 'Avanza por fases y completa los prerrequisitos de cada etapa.',
      phases: [
        { tab: 'fundamentos', label: 'Fundamentos', upstreamTab: null, courseIds: ['MLL-1', 'MLL-2', 'MLL-3', 'MLL-4'] },
        { tab: 'desarrollo', label: 'Desarrollo', upstreamTab: 'fundamentos', courseIds: ['MLL-5', 'MLL-6'] },
        { tab: 'liderazgo', label: 'Liderazgo', upstreamTab: 'desarrollo', courseIds: ['MLL-7', 'MLL-8'] },
        { tab: 'evaluacion', label: 'Evaluación', upstreamTab: 'desarrollo', courseIds: ['MLL-9'] }
      ]
    },
    {
      slug: 'gestion-proyectos',
      name: 'Gestión de proyectos',
      description: 'Metodología y herramientas para planificar, ejecutar y cerrar proyectos corporativos.',
      phases: [
        { tab: 'diagnostico', label: 'Diagnóstico', upstreamTab: null, courseIds: ['MGP-1', 'MGP-2'] },
        { tab: 'ejecucion', label: 'Ejecución', upstreamTab: 'diagnostico', courseIds: ['MGP-3', 'MGP-4'] },
        { tab: 'certificacion', label: 'Certificación', upstreamTab: 'ejecucion', courseIds: ['MGP-5'] }
      ]
    }
  ];

  var GRUPOS = {
    induccion: { total: 6, page: grupoPageUrl('induccion'), slug: 'induccion', label: 'Inducción' },
    normativos: { total: 8, page: grupoPageUrl('cursos-normativos'), slug: 'cursos-normativos', label: 'Cursos normativos' },
    complementaria: { total: 6, page: grupoPageUrl('formacion-complementaria'), slug: 'formacion-complementaria', label: 'Formación complementaria' },
    malla: { total: 14, page: mallaPageUrl('programa-liderazgo'), slug: 'programa-liderazgo', label: 'Programa de Liderazgo' }
  };

  function getAssignedGrupos() {
    return ASSIGNED_GRUPOS.slice();
  }

  function getAssignedGrupoBySlug(slug) {
    if (!slug) return null;
    return ASSIGNED_GRUPOS.find(function (g) { return g.slug === slug; }) || null;
  }

  function getAssignedGrupoByKey(key) {
    return ASSIGNED_GRUPOS.find(function (g) { return g.key === key; }) || null;
  }

  function getAssignedMallas() {
    return ASSIGNED_MALLAS.slice();
  }

  function getAssignedMallaBySlug(slug) {
    if (!slug) return null;
    return ASSIGNED_MALLAS.find(function (m) { return m.slug === slug; }) || null;
  }

  function isGrupoLocksEnabled(grupoKey) {
    var ag = getAssignedGrupoByKey(grupoKey);
    if (ag) return ag.locksEnabled;
    return grupoKey === 'malla';
  }

  /**
   * Prototype 16:9 covers — local placeholders in assets/images/courses/{id}.jpg
   * Replace files in place when client provides real cover art (see README in that folder).
   */
  var COURSE_COVER_DIR = 'assets/images/courses/';
  var COURSE_COVER_FALLBACK = COURSE_COVER_DIR + 'IND-1.jpg';

  function courseCoverUrl(id) {
    if (!id || !COURSES[id]) return COURSE_COVER_FALLBACK;
    return COURSE_COVER_DIR + id + '.jpg';
  }

  var COURSES = {
    'IND-1': { grupo: 'induccion', tab: null, title: 'Bienvenida a la organización', categoria: 'Bienvenida y onboarding', duration: '45 min', prereqs: [], desc: 'Introducción a la empresa, misión y primeros pasos como nuevo colaborador.' },
    'IND-2': { grupo: 'induccion', tab: null, title: 'Cultura y valores corporativos', categoria: 'Cultura organizacional', duration: '1 h', prereqs: ['IND-1'], desc: 'Valores, conducta esperada y cultura organizacional.' },
    'IND-3': { grupo: 'induccion', tab: null, title: 'Uso de herramientas digitales', categoria: 'Herramientas y sistemas', duration: '1,5 h', prereqs: ['IND-1'], desc: 'Plataformas internas, accesos y buenas prácticas digitales.' },
    'IND-4': { grupo: 'induccion', tab: null, title: 'Integración al equipo de trabajo', categoria: 'Cultura organizacional', duration: '1 h', prereqs: ['IND-2', 'IND-3'], desc: 'Trabajo en equipo y dinámicas de integración.' },
    'IND-5': { grupo: 'induccion', tab: null, title: 'Seguridad para nuevos ingresos', categoria: 'Herramientas y sistemas', duration: '45 min', prereqs: ['IND-4'], desc: 'Normas de seguridad aplicables a nuevos ingresos.' },
    'IND-6': { grupo: 'induccion', tab: null, title: 'Evaluación de inducción', categoria: 'Bienvenida y onboarding', duration: '30 min', prereqs: ['IND-5'], desc: 'Evaluación final del programa de inducción.' },

    'NOR-1': { grupo: 'normativos', tab: null, title: 'Código de ética y conducta', categoria: 'Ética y compliance', duration: '1 h', prereqs: [], desc: 'Marco ético y conducta profesional obligatoria.' },
    'NOR-2': { grupo: 'normativos', tab: null, title: 'Prevención de lavado de activos', categoria: 'Ética y compliance', duration: '1 h', prereqs: ['NOR-1'], desc: 'Prevención de lavado de activos y señales de alerta.' },
    'NOR-3': { grupo: 'normativos', tab: null, title: 'Protección de datos personales', categoria: 'Privacidad y datos', duration: '1 h', prereqs: ['NOR-1'], desc: 'Tratamiento de datos personales según normativa vigente.' },
    'NOR-4': { grupo: 'normativos', tab: null, title: 'Seguridad de la información', categoria: 'Seguridad y salud', duration: '1,5 h', prereqs: ['NOR-2', 'NOR-3'], desc: 'Buenas prácticas de seguridad de la información.' },
    'NOR-5': { grupo: 'normativos', tab: null, title: 'Prevención de riesgos laborales', categoria: 'Seguridad y salud', duration: '1 h', prereqs: ['NOR-4'], desc: 'Identificación y prevención de riesgos en el trabajo.' },
    'NOR-6': { grupo: 'normativos', tab: null, title: 'Gestión ambiental básica', categoria: 'Medio ambiente', duration: '45 min', prereqs: ['NOR-4'], desc: 'Principios de gestión ambiental en la organización.' },
    'NOR-7': { grupo: 'normativos', tab: null, title: 'Diversidad e inclusión', categoria: 'Ética y compliance', duration: '45 min', prereqs: ['NOR-5'], desc: 'Políticas de diversidad, equidad e inclusión.' },
    'NOR-8': { grupo: 'normativos', tab: null, title: 'Reporte de incidentes', categoria: 'Seguridad y salud', duration: '30 min', prereqs: ['NOR-6'], desc: 'Procedimiento de reporte de incidentes.' },

    'COM-1': { grupo: 'complementaria', tab: null, title: 'Comunicación efectiva', categoria: 'Habilidades blandas', duration: '1 h', prereqs: [], desc: 'Técnicas de comunicación interpersonal y profesional.', noLock: true },
    'COM-2': { grupo: 'complementaria', tab: null, title: 'Trabajo en equipo', categoria: 'Habilidades blandas', duration: '1 h', prereqs: [], desc: 'Colaboración y resolución de conflictos en equipos.', noLock: true },
    'COM-3': { grupo: 'complementaria', tab: null, title: 'Excel intermedio', categoria: 'Desarrollo profesional', duration: '2 h', prereqs: [], desc: 'Funciones intermedias de hojas de cálculo.', noLock: true },
    'COM-4': { grupo: 'complementaria', tab: null, title: 'Inglés técnico', categoria: 'Idiomas', duration: '2 h', prereqs: [], desc: 'Vocabulario técnico en inglés para el rol.', noLock: true },
    'COM-5': { grupo: 'complementaria', tab: null, title: 'Gestión del tiempo', categoria: 'Desarrollo profesional', duration: '1 h', prereqs: [], desc: 'Priorización y organización del trabajo.', noLock: true },
    'COM-6': { grupo: 'complementaria', tab: null, title: 'Balance vida-trabajo', categoria: 'Bienestar', duration: '45 min', prereqs: [], desc: 'Estrategias de equilibrio personal y laboral.', noLock: true },

    'MLL-1': { grupo: 'malla', mallaSlug: 'programa-liderazgo', tab: 'fundamentos', title: 'Liderazgo personal', categoria: 'Fundamentos', duration: '2 h', prereqs: [], desc: 'Autoconocimiento y estilo de liderazgo personal.' },
    'MLL-2': { grupo: 'malla', mallaSlug: 'programa-liderazgo', tab: 'fundamentos', title: 'Comunicación asertiva', categoria: 'Fundamentos', duration: '1,5 h', prereqs: ['MLL-1'], desc: 'Comunicación clara y asertiva para líderes.' },
    'MLL-3': { grupo: 'malla', mallaSlug: 'programa-liderazgo', tab: 'fundamentos', title: 'Gestión del cambio', categoria: 'Fundamentos', duration: '1,5 h', prereqs: ['MLL-1'], desc: 'Gestión del cambio en equipos y organizaciones.' },
    'MLL-4': { grupo: 'malla', mallaSlug: 'programa-liderazgo', tab: 'fundamentos', title: 'Toma de decisiones', categoria: 'Fundamentos', duration: '2 h', prereqs: ['MLL-2', 'MLL-3'], desc: 'Marco para decisiones efectivas en liderazgo.' },
    'MLL-5': { grupo: 'malla', mallaSlug: 'programa-liderazgo', tab: 'desarrollo', title: 'Coaching para líderes', categoria: 'Desarrollo', duration: '2 h', prereqs: [], desc: 'Técnicas de coaching aplicadas al liderazgo.' },
    'MLL-6': { grupo: 'malla', mallaSlug: 'programa-liderazgo', tab: 'desarrollo', title: 'Gestión de equipos remotos', categoria: 'Desarrollo', duration: '1,5 h', prereqs: ['MLL-5'], desc: 'Liderazgo de equipos distribuidos y remotos.' },
    'MLL-7': { grupo: 'malla', mallaSlug: 'programa-liderazgo', tab: 'liderazgo', title: 'Negociación avanzada', categoria: 'Liderazgo', duration: '2 h', prereqs: [], desc: 'Negociación estratégica para mandos medios.' },
    'MLL-8': { grupo: 'malla', mallaSlug: 'programa-liderazgo', tab: 'liderazgo', title: 'Planificación estratégica', categoria: 'Liderazgo', duration: '2,5 h', prereqs: [], desc: 'Planificación y ejecución estratégica.' },
    'MLL-9': { grupo: 'malla', mallaSlug: 'programa-liderazgo', tab: 'evaluacion', title: 'Evaluación final — Programa de Liderazgo', categoria: 'Evaluación', duration: '1 h', prereqs: [], desc: 'Evaluación integradora del Programa de Liderazgo.' },

    'MGP-1': { grupo: 'malla', mallaSlug: 'gestion-proyectos', tab: 'diagnostico', title: 'Fundamentos de gestión de proyectos', categoria: 'Diagnóstico', duration: '1,5 h', prereqs: [], desc: 'Conceptos base, roles y ciclo de vida de un proyecto.' },
    'MGP-2': { grupo: 'malla', mallaSlug: 'gestion-proyectos', tab: 'diagnostico', title: 'Identificación de stakeholders', categoria: 'Diagnóstico', duration: '1 h', prereqs: ['MGP-1'], desc: 'Mapa de partes interesadas y matriz de influencia.' },
    'MGP-3': { grupo: 'malla', mallaSlug: 'gestion-proyectos', tab: 'ejecucion', title: 'Planificación y cronograma', categoria: 'Ejecución', duration: '2 h', prereqs: [], desc: 'WBS, ruta crítica y seguimiento de avance.' },
    'MGP-4': { grupo: 'malla', mallaSlug: 'gestion-proyectos', tab: 'ejecucion', title: 'Gestión de riesgos en proyectos', categoria: 'Ejecución', duration: '1,5 h', prereqs: ['MGP-3'], desc: 'Identificación, análisis y respuesta a riesgos.' },
    'MGP-5': { grupo: 'malla', mallaSlug: 'gestion-proyectos', tab: 'certificacion', title: 'Evaluación — Gestión de proyectos', categoria: 'Certificación', duration: '1 h', prereqs: [], desc: 'Evaluación integradora de la ruta de gestión de proyectos.' }
  };

  var APPROVED_BY_LEVEL = {
    '0': [],
    '45': [
      'IND-1', 'IND-2', 'IND-3', 'IND-4',
      'NOR-1', 'NOR-2', 'NOR-3', 'NOR-4',
      'COM-1',
      'MLL-1', 'MLL-2', 'MLL-3', 'MLL-4',
      'MGP-1'
    ],
    '100': Object.keys(COURSES)
  };

  var EN_PROCESO_BY_LEVEL = {
    '0': ['IND-1', 'NOR-1', 'COM-1'],
    '45': ['IND-5', 'NOR-5', 'COM-3'],
    '100': []
  };

  var REPROBADO_BY_LEVEL = {
    '0': [],
    '45': ['NOR-6', 'COM-4'],
    '100': []
  };

  /** Keep sim fixtures disjoint: Aprobado > Reprobado > En proceso (prototype-wide source of truth). */
  function sanitizeProgressFixtures() {
    ['0', '45', '100'].forEach(function (level) {
      var approved = new Set(APPROVED_BY_LEVEL[level] || []);
      var reprobado = (REPROBADO_BY_LEVEL[level] || []).filter(function (id) {
        return !approved.has(id);
      });
      var reproSet = new Set(reprobado);
      var enProceso = (EN_PROCESO_BY_LEVEL[level] || []).filter(function (id) {
        return !approved.has(id) && !reproSet.has(id);
      });
      REPROBADO_BY_LEVEL[level] = reprobado;
      EN_PROCESO_BY_LEVEL[level] = enProceso;
    });
    stripEngagedFromLockedSlots();
  }

  /** Drop en-proceso/reprobado on cursos that would still be locked as Sin actividad (per sim level). */
  function stripEngagedFromLockedSlots() {
    ['0', '45', '100'].forEach(function (level) {
      var approved = new Set(APPROVED_BY_LEVEL[level] || []);
      function wouldBeLocked(id) {
        var c = COURSES[id];
        if (!c || c.noLock || approved.has(id)) return false;
        if (c.grupo === 'malla' && !wouldMallaTabUnlockAtLevel(c.mallaSlug, c.tab, level, approved)) return true;
        if (!c.prereqs || !c.prereqs.length) return false;
        return c.prereqs.some(function (p) { return !approved.has(p); });
      }
      EN_PROCESO_BY_LEVEL[level] = (EN_PROCESO_BY_LEVEL[level] || []).filter(function (id) {
        return !wouldBeLocked(id);
      });
      REPROBADO_BY_LEVEL[level] = (REPROBADO_BY_LEVEL[level] || []).filter(function (id) {
        return !wouldBeLocked(id) && !approved.has(id);
      });
    });
  }

  function getMallaPhaseUpstream(mallaSlug, tab) {
    var am = getAssignedMallaBySlug(mallaSlug);
    if (!am) return null;
    var phase = am.phases.find(function (p) { return p.tab === tab; });
    return phase && phase.upstreamTab ? phase.upstreamTab : null;
  }

  function getMallaPhaseLabel(mallaSlug, tab) {
    var am = getAssignedMallaBySlug(mallaSlug);
    if (!am) return tab;
    var phase = am.phases.find(function (p) { return p.tab === tab; });
    return phase ? phase.label : tab;
  }

  function wouldMallaTabUnlockAtLevel(mallaSlug, tab, level, approvedSet) {
    var upstream = getMallaPhaseUpstream(mallaSlug, tab);
    if (!upstream) return true;
    var ids = coursesInMallaTab(mallaSlug, upstream);
    return ids.length > 0 && ids.every(function (id) { return approvedSet.has(id); });
  }

  sanitizeProgressFixtures();

  var ESTADO_LABELS = {
    'sin-actividad': 'Sin actividad',
    'en-proceso': 'En proceso',
    aprobado: 'Aprobado',
    reprobado: 'Reprobado'
  };

  var grupoPagination = { page: 1, pageSize: 12 };

  var RESOURCE_ICON_SVG = {
    documento: '<svg class="heroicon heroicon-lg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>',
    video: '<svg class="heroicon heroicon-lg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>',
    imagen: '<svg class="heroicon heroicon-lg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 21.75 18.75V5.25A2.25 2.25 0 0 0 19.5 3H4.5A2.25 2.25 0 0 0 2.25 5.25v13.5A2.25 2.25 0 0 0 4.5 21Z"/></svg>'
  };

  var DEMO_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
  var DEMO_POSTER = 'https://placehold.co/1280x720/e4e4e7/64748b?text=';

  var RESOURCES = {
    'BIB-1': { tab: 'onboarding', type: 'documento', typeLabel: 'Documento', title: 'Manual de onboarding', meta: 'PDF · 24 páginas · 2,4 MB', documentPreview: 'https://placehold.co/720x960/f4f4f5/64748b?text=Manual+onboarding' },
    'BIB-2': { tab: 'seguridad', type: 'video', typeLabel: 'Video', title: 'Buenas prácticas de seguridad', meta: '12 min · MP4', videoSrc: DEMO_VIDEO, videoPoster: DEMO_POSTER + 'Seguridad' },
    'BIB-3': { tab: 'seguridad', type: 'imagen', typeLabel: 'Imagen', title: 'Señalización de seguridad en planta', meta: 'PNG · 1920×1080', imageSrc: 'https://placehold.co/1280x720/f4f4f5/64748b?text=Senalizacion' },
    'BIB-4': { tab: 'onboarding', type: 'video', typeLabel: 'Video', title: 'Mensaje de bienvenida — CEO', meta: '8 min · MP4', videoSrc: DEMO_VIDEO, videoPoster: DEMO_POSTER + 'Bienvenida' },
    'BIB-5': { tab: 'onboarding', type: 'imagen', typeLabel: 'Imagen', title: 'Mapa de oficinas y servicios', meta: 'PNG · 1600×900', imageSrc: 'https://placehold.co/1280x720/f4f4f5/64748b?text=Mapa+oficinas' },
    'BIB-6': { tab: 'seguridad', type: 'documento', typeLabel: 'Documento', title: 'Protocolo de emergencias', meta: 'PDF · 12 páginas', documentPreview: 'https://placehold.co/720x960/f4f4f5/64748b?text=Protocolo+emergencias' },
    'BIB-7': { tab: 'liderazgo', type: 'documento', typeLabel: 'Documento', title: 'Guía de feedback 1:1', meta: 'PDF · 8 páginas', documentPreview: 'https://placehold.co/720x960/f4f4f5/64748b?text=Feedback+1a1' },
    'BIB-8': { tab: 'liderazgo', type: 'video', typeLabel: 'Video', title: 'Comunicación asertiva para líderes', meta: '18 min · MP4', videoSrc: DEMO_VIDEO, videoPoster: DEMO_POSTER + 'Comunicacion' },
    'BIB-9': { tab: 'liderazgo', type: 'imagen', typeLabel: 'Imagen', title: 'Matriz de delegación', meta: 'PNG · 1200×800', imageSrc: 'https://placehold.co/1280x720/f4f4f5/64748b?text=Matriz+delegacion' },
    'BIB-10': { tab: 'herramientas', type: 'documento', typeLabel: 'Documento', title: 'Manual de Microsoft Teams', meta: 'PDF · 16 páginas', documentPreview: 'https://placehold.co/720x960/f4f4f5/64748b?text=Manual+Teams' },
    'BIB-11': { tab: 'herramientas', type: 'video', typeLabel: 'Video', title: 'Primeros pasos en SAP', meta: '22 min · MP4', videoSrc: DEMO_VIDEO, videoPoster: DEMO_POSTER + 'SAP' },
    'BIB-12': { tab: 'herramientas', type: 'imagen', typeLabel: 'Imagen', title: 'Atajos de teclado — productividad', meta: 'PNG · 1920×1080', imageSrc: 'https://placehold.co/1280x720/f4f4f5/64748b?text=Atajos+teclado' }
  };

  function renderResourceModalContent(r) {
    if (r.type === 'documento') {
      return '<div class="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">' +
        '<img src="' + r.documentPreview + '" alt="Vista del documento: ' + r.title + '" class="w-full h-auto max-h-[70vh] object-contain object-top bg-white">' +
        '</div>';
    }
    if (r.type === 'video') {
      return '<video class="w-full rounded-lg aspect-video bg-black" controls playsinline poster="' + r.videoPoster + '">' +
        '<source src="' + r.videoSrc + '" type="video/mp4">' +
        'Tu navegador no admite la reproducción de video.</video>';
    }
    if (r.type === 'imagen') {
      return '<img src="' + r.imageSrc + '" alt="' + r.title + '" class="w-full rounded-lg border border-gray-200 max-h-[70vh] object-contain bg-gray-50">';
    }
    return '';
  }

  function getLevel() {
    var v = localStorage.getItem(STORAGE_KEY);
    if (v === '0' || v === '45' || v === '100') return v;
    return '45';
  }

  function setLevel(level) {
    localStorage.setItem(STORAGE_KEY, level);
    if (level !== '100') {
      localStorage.removeItem(CONGRATS_KEY);
    }
    applyAll();
  }

  function getApprovedSet() {
    var list = APPROVED_BY_LEVEL[getLevel()] || [];
    return new Set(list);
  }

  function isApproved(id) {
    return getApprovedSet().has(id);
  }

  function coursesInGrupo(grupoKey) {
    return Object.keys(COURSES).filter(function (id) {
      return COURSES[id].grupo === grupoKey;
    });
  }

  function coursesInMallaTab(mallaSlug, tab) {
    return Object.keys(COURSES).filter(function (id) {
      var c = COURSES[id];
      return c.grupo === 'malla' && c.mallaSlug === mallaSlug && c.tab === tab;
    });
  }

  function isMallaTabComplete(mallaSlug, tab) {
    var ids = coursesInMallaTab(mallaSlug, tab);
    return ids.length > 0 && ids.every(function (id) { return isApproved(id); });
  }

  function isMallaTabUnlocked(mallaSlug, tab) {
    var upstream = getMallaPhaseUpstream(mallaSlug, tab);
    if (!upstream) return true;
    return isMallaTabComplete(mallaSlug, upstream);
  }

  function mallaCourseIds(slug) {
    var am = getAssignedMallaBySlug(slug);
    if (!am) return [];
    return am.phases.reduce(function (acc, phase) {
      return acc.concat(phase.courseIds);
    }, []);
  }

  function mallaComplete(slug) {
    var ids = mallaCourseIds(slug);
    return ids.length > 0 && ids.every(function (id) { return isApproved(id); });
  }

  function prereqTitles(prereqs) {
    return prereqs.map(function (id) {
      return COURSES[id] ? COURSES[id].title : id;
    });
  }

  /** User already started or finished — must not show prerequisite/tab lock on the card. */
  function isCourseEngaged(id) {
    var estado = getCourseEstadoKey(id);
    return estado === 'aprobado' || estado === 'en-proceso' || estado === 'reprobado';
  }

  function isCourseLocked(id) {
    var c = COURSES[id];
    if (!c) return false;
    if (c.grupo !== 'malla' && !isGrupoLocksEnabled(c.grupo)) return false;
    if (c.noLock) return false;
    if (isCourseEngaged(id)) return false;
    if (c.grupo === 'malla' && !isMallaTabUnlocked(c.mallaSlug, c.tab)) return true;
    if (!c.prereqs || !c.prereqs.length) return false;
    return c.prereqs.some(function (p) { return !isApproved(p); });
  }

  function countApprovedInGrupo(grupoKey) {
    return coursesInGrupo(grupoKey).filter(function (id) { return isApproved(id); }).length;
  }

  function totalMandatory() {
    return Object.keys(COURSES).length;
  }

  function totalApproved() {
    return getApprovedSet().size;
  }

  function progressPercent() {
    return Math.round((totalApproved() / totalMandatory()) * 100);
  }

  function grupoComplete(grupoKey) {
    var g = GRUPOS[grupoKey];
    return countApprovedInGrupo(grupoKey) >= g.total;
  }

  function welcomeSubtitle() {
    var level = getLevel();
    if (level === '100') return 'Completaste todos tus cursos asignados.';
    if (level === '0') return 'Te damos la bienvenida a tu espacio de formación.';
    return 'Sigue avanzando en tu formación.';
  }

  function getEnProcesoSet() {
    return new Set(EN_PROCESO_BY_LEVEL[getLevel()] || []);
  }

  function getReprobadoSet() {
    return new Set(REPROBADO_BY_LEVEL[getLevel()] || []);
  }

  function getCourseEstadoKey(id) {
    if (isApproved(id)) return 'aprobado';
    if (getReprobadoSet().has(id)) return 'reprobado';
    if (getEnProcesoSet().has(id)) return 'en-proceso';
    return 'sin-actividad';
  }

  function getGrupoSlugFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get('grupo');
    } catch (e) {
      return null;
    }
  }

  function getMallaSlugFromUrl() {
    try {
      return new URLSearchParams(window.location.search).get('malla');
    } catch (e) {
      return null;
    }
  }

  function getGrupoKeyForPage() {
    var page = document.body.getAttribute('data-mf-page');
    if (page === 'grupo') {
      var ag = getAssignedGrupoBySlug(getGrupoSlugFromUrl());
      return ag ? ag.key : null;
    }
    return null;
  }

  function statusLabel(id) {
    return ESTADO_LABELS[getCourseEstadoKey(id)] || 'Sin actividad';
  }

  function statusChipClass(id) {
    var base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
    var estado = getCourseEstadoKey(id);
    if (estado === 'aprobado') return base + ' bg-green-100 text-green-800';
    if (estado === 'reprobado') return base + ' bg-red-100 text-red-800';
    if (estado === 'en-proceso') return base + ' bg-amber-100 text-amber-800';
    return base + ' bg-gray-100 text-gray-700';
  }

  function tileChipClass(grupoKey) {
    return grupoComplete(grupoKey)
      ? 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800'
      : 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800';
  }

  function tileChipLabel(grupoKey) {
    return grupoComplete(grupoKey) ? 'Completado' : 'En curso';
  }

  function readRecentFromStorage() {
    try {
      var raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.filter(function (id) { return COURSES[id]; }).slice(0, RECENT_MAX);
    } catch (e) {
      return [];
    }
  }

  function getRecentIds() {
    var level = getLevel();
    return (RECENT_BY_LEVEL[level] || []).slice();
  }

  function recordRecentView(id) {
    if (!COURSES[id]) return;
    var list = readRecentFromStorage();
    list = list.filter(function (x) { return x !== id; });
    list.unshift(id);
    list = list.slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    if (qs('[data-mf-recent-track]')) updateRecentCarousel();
  }

  function courseGrupoLabel(id) {
    var c = COURSES[id];
    if (!c) return '';
    if (c.grupo === 'malla') {
      var am = getAssignedMallaBySlug(c.mallaSlug);
      return am ? am.name : GRUPOS.malla.label;
    }
    return GRUPOS[c.grupo] ? GRUPOS[c.grupo].label : '';
  }

  function courseGrupoPage(id) {
    var c = COURSES[id];
    if (!c) return 'inicio.html';
    if (c.grupo === 'malla' && c.mallaSlug) return mallaPageUrl(c.mallaSlug);
    return GRUPOS[c.grupo] ? GRUPOS[c.grupo].page : 'inicio.html';
  }

  function readBookmarks() {
    try {
      var raw = localStorage.getItem(BOOKMARKS_KEY);
      if (raw === null) {
        var seed = BOOKMARKS_DEMO_SEED.filter(function (id) { return COURSES[id]; });
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(seed));
        return seed;
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (id) { return COURSES[id]; });
    } catch (e) {
      return [];
    }
  }

  function writeBookmarks(ids) {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
  }

  function isBookmarked(id) {
    return readBookmarks().indexOf(id) >= 0;
  }

  function toggleBookmark(id) {
    if (!COURSES[id]) return;
    var list = readBookmarks();
    var idx = list.indexOf(id);
    var added;
    if (idx >= 0) {
      list.splice(idx, 1);
      added = false;
    } else {
      list.unshift(id);
      added = true;
    }
    writeBookmarks(list);
    updateBookmarkButtons();
    updateModalBookmark();
    if (qs('[data-mf-bookmarks-grid]')) applyBookmarksFilters(false);
    showPrototypeToast(added ? 'Curso guardado en Mis favoritos.' : 'Curso quitado de Mis favoritos.');
  }

  function injectBookmarkButton(card, id) {
    var cover = card.querySelector('.aspect-video');
    if (!cover || cover.querySelector('[data-mf-bookmark]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-mf-bookmark', id);
    btn.className = 'course-bookmark-btn mf-btn-icon absolute top-2 left-2 z-10';
    btn.setAttribute('aria-label', 'Guardar curso');
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = BOOKMARK_SVG_OUTLINE;
    cover.appendChild(btn);
  }

  function updateBookmarkButtons() {
    qsa('[data-mf-bookmark]').forEach(function (btn) {
      var id = btn.getAttribute('data-mf-bookmark');
      if (!id) return;
      var on = isBookmarked(id);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Quitar de favoritos' : 'Guardar curso');
      btn.classList.toggle('course-bookmark-btn--active', on);
      btn.innerHTML = on ? BOOKMARK_SVG_SOLID : BOOKMARK_SVG_OUTLINE;
    });
  }

  function updateModalBookmark() {
    var btn = qs('[data-mf-modal-bookmark]');
    if (!btn) return;
    var id = modalCourseId || btn.getAttribute('data-mf-bookmark');
    if (!id) return;
    btn.setAttribute('data-mf-bookmark', id);
    var on = isBookmarked(id);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Quitar de favoritos' : 'Guardar curso');
    btn.classList.toggle('course-bookmark-btn--active', on);
    btn.innerHTML = on ? BOOKMARK_SVG_SOLID : BOOKMARK_SVG_OUTLINE;
  }

  var bookmarksPagination = { page: 1, pageSize: 12 };

  function renderBookmarkCourseCard(id) {
    var c = COURSES[id];
    if (!c) return '';
    var lockSvg = '<svg class="heroicon heroicon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>';
    return '<article data-mf-course="' + id + '" class="rounded-lg border border-gray-200 bg-white overflow-hidden flex flex-col">' +
      '<div class="aspect-video bg-gray-200 relative">' +
      '<img src="' + courseCoverUrl(id) + '" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover">' +
      '<span data-mf-lock-badge class="hidden absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-gray-900/85 text-white text-xs px-2 py-1">' + lockSvg + ' Bloqueado</span></div>' +
      '<div class="p-4 flex flex-col flex-1">' +
      '<p class="text-xs font-medium text-gray-500 truncate mb-1">' + courseGrupoLabel(id) + '</p>' +
      '<div class="flex flex-wrap gap-2 mb-2">' +
      '<span class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">' + c.categoria + '</span>' +
      '<span data-mf-status-chip class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">Pendiente</span></div>' +
      '<h3 class="font-medium text-gray-900">' + c.title + '</h3>' +
      '<p class="text-sm text-gray-500 mt-1">' + c.duration + '</p>' +
      '<div class="mt-auto pt-4 flex gap-2">' +
      '<button type="button" data-mf-ver-mas data-mf-modal-course="' + id + '" class="mf-btn-secondary flex-1 w-full">Ver más</button>' +
      '<button type="button" data-mf-acceder class="mf-btn-primary flex-1 w-full">Acceder</button>' +
      '</div></div></article>';
  }

  function bookmarkMatchesFilters(id) {
    var c = COURSES[id];
    if (!c) return false;
    var searchEl = qs('[data-mf-bookmarks-search]');
    var grupoEl = qs('[data-mf-bookmarks-filter-grupo]');
    var estadoEl = qs('[data-mf-bookmarks-filter-estado]');
    var query = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var grupo = grupoEl ? grupoEl.value : '';
    var estado = estadoEl ? estadoEl.value : '';
    if (query && c.title.toLowerCase().indexOf(query) === -1) return false;
    if (grupo && c.grupo !== grupo) return false;
    if (estado && getCourseEstadoKey(id) !== estado) return false;
    return true;
  }

  function updateBookmarksPaginationUI(matchedCount, totalPages) {
    var info = qs('[data-mf-bookmarks-page-info]');
    if (info) setText(info, 'Página ' + bookmarksPagination.page + ' de ' + totalPages);
    var prev = qs('[data-mf-bookmarks-page-prev]');
    var next = qs('[data-mf-bookmarks-page-next]');
    if (prev) prev.disabled = bookmarksPagination.page <= 1;
    if (next) next.disabled = bookmarksPagination.page >= totalPages || matchedCount === 0;
    var paginator = qs('[data-mf-bookmarks-pagination]');
    if (paginator) paginator.classList.toggle('hidden', matchedCount === 0);
  }

  function applyBookmarksFilters(resetPage) {
    var grid = qs('[data-mf-bookmarks-grid]');
    if (!grid) return;

    var catalogEmpty = qs('[data-mf-bookmarks-catalog-empty]');
    var filterEmpty = qs('[data-mf-bookmarks-filter-empty]');
    var filtersToolbar = qs('[data-mf-bookmarks-filters]');
    var allIds = readBookmarks();

    if (!allIds.length) {
      grid.innerHTML = '';
      grid.classList.add('hidden');
      if (catalogEmpty) catalogEmpty.classList.remove('hidden');
      if (filterEmpty) filterEmpty.classList.add('hidden');
      if (filtersToolbar) filtersToolbar.classList.add('hidden');
      var paginator = qs('[data-mf-bookmarks-pagination]');
      if (paginator) paginator.classList.add('hidden');
      return;
    }

    if (catalogEmpty) catalogEmpty.classList.add('hidden');
    if (filtersToolbar) filtersToolbar.classList.remove('hidden');

    if (resetPage) bookmarksPagination.page = 1;

    var pageSizeEl = qs('[data-mf-bookmarks-page-size]');
    if (pageSizeEl) {
      bookmarksPagination.pageSize = parseInt(pageSizeEl.value, 10) || 12;
    }

    var matched = allIds.filter(bookmarkMatchesFilters);
    var totalPages = Math.max(1, Math.ceil(matched.length / bookmarksPagination.pageSize));
    if (bookmarksPagination.page > totalPages) bookmarksPagination.page = totalPages;
    if (bookmarksPagination.page < 1) bookmarksPagination.page = 1;

    var start = (bookmarksPagination.page - 1) * bookmarksPagination.pageSize;
    var pageIds = matched.slice(start, start + bookmarksPagination.pageSize);

    grid.innerHTML = pageIds.map(renderBookmarkCourseCard).join('');
    grid.classList.toggle('hidden', matched.length === 0);

    var hasSearchFilters = false;
    var searchEl = qs('[data-mf-bookmarks-search]');
    var grupoEl = qs('[data-mf-bookmarks-filter-grupo]');
    var estadoEl = qs('[data-mf-bookmarks-filter-estado]');
    if (searchEl && searchEl.value.trim()) hasSearchFilters = true;
    if (grupoEl && grupoEl.value) hasSearchFilters = true;
    if (estadoEl && estadoEl.value) hasSearchFilters = true;

    var showFilterEmpty = matched.length === 0 && hasSearchFilters;
    if (filterEmpty) filterEmpty.classList.toggle('hidden', !showFilterEmpty);

    updateCourseCards();
    updateBookmarkButtons();
    updateBookmarksPaginationUI(matched.length, totalPages);
  }

  function bindBookmarksFilters() {
    var toolbar = qs('[data-mf-bookmarks-filters]');
    if (!toolbar) return;

    var pageSizeEl = qs('[data-mf-bookmarks-page-size]');
    if (pageSizeEl) {
      bookmarksPagination.pageSize = parseInt(pageSizeEl.value, 10) || 12;
    }

    function onFilterChange() {
      applyBookmarksFilters(true);
    }

    var search = qs('[data-mf-bookmarks-search]');
    var grupo = qs('[data-mf-bookmarks-filter-grupo]');
    var estado = qs('[data-mf-bookmarks-filter-estado]');
    if (search) search.addEventListener('input', onFilterChange);
    if (grupo) grupo.addEventListener('change', onFilterChange);
    if (estado) estado.addEventListener('change', onFilterChange);
    if (pageSizeEl) pageSizeEl.addEventListener('change', onFilterChange);

    var prev = qs('[data-mf-bookmarks-page-prev]');
    var next = qs('[data-mf-bookmarks-page-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        if (bookmarksPagination.page > 1) {
          bookmarksPagination.page -= 1;
          applyBookmarksFilters(false);
        }
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        bookmarksPagination.page += 1;
        applyBookmarksFilters(false);
      });
    }

    qsa('[data-mf-bookmarks-filter-clear]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (search) search.value = '';
        if (grupo) grupo.value = '';
        if (estado) estado.value = '';
        applyBookmarksFilters(true);
        if (search) search.focus();
      });
    });

    applyBookmarksFilters(true);
  }

  function renderRecentCourseCard(id) {
    var c = COURSES[id];
    if (!c) return '';
    var lockSvg = '<svg class="heroicon heroicon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>';
    return '<article data-mf-course="' + id + '" data-testid="recent-course-' + id + '" class="inicio-recent-card rounded-lg border border-gray-200 bg-white overflow-hidden flex flex-col">' +
      '<div class="aspect-video bg-gray-200 relative">' +
      '<img src="' + courseCoverUrl(id) + '" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover">' +
      '<span data-mf-lock-badge class="hidden absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-gray-900/85 text-white text-xs px-2 py-1">' + lockSvg + ' Bloqueado</span></div>' +
      '<div class="p-4 flex flex-col flex-1 min-h-0">' +
      '<p class="text-xs font-medium text-gray-500 truncate">' + courseGrupoLabel(id) + '</p>' +
      '<div class="flex flex-wrap gap-2 mt-1 mb-2">' +
      '<span class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">' + c.categoria + '</span>' +
      '<span data-mf-status-chip class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">Pendiente</span></div>' +
      '<h3 class="font-medium text-gray-900 line-clamp-2 leading-snug">' + c.title + '</h3>' +
      '<p class="text-sm text-gray-500 mt-1">' + c.duration + '</p>' +
      '<div class="mt-auto pt-4 flex gap-2">' +
      '<button type="button" data-mf-ver-mas data-mf-modal-course="' + id + '" class="mf-btn-secondary flex-1 w-full">Ver más</button>' +
      '<button type="button" data-mf-acceder class="mf-btn-primary flex-1 w-full">Acceder</button>' +
      '</div></div></article>';
  }

  function updateRecentCarousel() {
    var track = qs('[data-mf-recent-track]');
    var empty = qs('[data-mf-recent-empty]');
    if (!track) return;
    var ids = getRecentIds();
    if (!ids.length) {
      track.innerHTML = '';
      track.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
      updateRecentNavButtons(track);
      return;
    }
    track.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    track.innerHTML = ids.map(renderRecentCourseCard).join('');
    updateCourseCards();
    updateRecentNavButtons(track);
  }

  function updateRecentNavButtons(track) {
    var prev = qs('[data-mf-recent-prev]');
    var next = qs('[data-mf-recent-next]');
    if (!track || !prev || !next) return;
    var hasOverflow = track.scrollWidth > track.clientWidth + 2;
    prev.disabled = !hasOverflow;
    next.disabled = !hasOverflow;
  }

  function bindRecentCarousel() {
    var track = qs('[data-mf-recent-track]');
    if (!track) return;
    var step = 272;
    var prev = qs('[data-mf-recent-prev]');
    var next = qs('[data-mf-recent-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        track.scrollBy({ left: -step, behavior: 'smooth' });
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        track.scrollBy({ left: step, behavior: 'smooth' });
      });
    }
    track.addEventListener('scroll', function () {
      updateRecentNavButtons(track);
    });
    window.addEventListener('resize', function () {
      updateRecentNavButtons(track);
    });
  }

  var CAROUSEL_CHEV_LEFT = '<svg class="heroicon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>';
  var CAROUSEL_CHEV_RIGHT = '<svg class="heroicon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>';
  var LOCK_SVG_SM = '<svg class="heroicon heroicon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>';

  function renderCarouselCourseCard(id) {
    var c = COURSES[id];
    if (!c) return '';
    return '<article data-mf-course="' + id + '" data-testid="grupo-carousel-' + id + '" class="inicio-recent-card rounded-lg border border-gray-200 bg-white overflow-hidden flex flex-col">' +
      '<div class="aspect-video bg-gray-200 relative">' +
      '<img src="' + courseCoverUrl(id) + '" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover">' +
      '<span data-mf-lock-badge class="hidden absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-gray-900/85 text-white text-xs px-2 py-1">' + LOCK_SVG_SM + ' Bloqueado</span></div>' +
      '<div class="p-4 flex flex-col flex-1 min-h-0">' +
      '<div class="flex flex-wrap gap-2 mb-2">' +
      '<span class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">' + c.categoria + '</span>' +
      '<span data-mf-status-chip class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">Pendiente</span></div>' +
      '<h3 class="font-medium text-gray-900 line-clamp-2 leading-snug">' + c.title + '</h3>' +
      '<p class="text-sm text-gray-500 mt-1">' + c.duration + '</p>' +
      '<div class="mt-auto pt-4 flex gap-2">' +
      '<button type="button" data-mf-ver-mas data-mf-modal-course="' + id + '" class="mf-btn-secondary flex-1 w-full">Ver más</button>' +
      '<button type="button" data-mf-acceder class="mf-btn-primary flex-1 w-full">Acceder</button>' +
      '</div></div></article>';
  }

  function renderGrupoGridCourseCard(id) {
    var c = COURSES[id];
    if (!c) return '';
    return '<article data-mf-course="' + id + '" class="rounded-lg border border-gray-200 bg-white overflow-hidden flex flex-col">' +
      '<div class="aspect-video bg-gray-200 relative">' +
      '<img src="' + courseCoverUrl(id) + '" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover">' +
      '<span data-mf-lock-badge class="hidden absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-gray-900/85 text-white text-xs px-2 py-1">' + LOCK_SVG_SM + ' Bloqueado</span></div>' +
      '<div class="p-4 flex flex-col flex-1">' +
      '<div class="flex flex-wrap gap-2 mb-2">' +
      '<span class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">' + c.categoria + '</span>' +
      '<span data-mf-status-chip class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">Pendiente</span></div>' +
      '<h3 class="font-medium text-gray-900">' + c.title + '</h3>' +
      '<p class="text-sm text-gray-500 mt-1">' + c.duration + '</p>' +
      '<div class="mt-auto pt-4 flex gap-2">' +
      '<button type="button" data-mf-ver-mas data-mf-modal-course="' + id + '" class="mf-btn-secondary flex-1 w-full">Ver más</button>' +
      '<button type="button" data-mf-acceder class="mf-btn-primary flex-1 w-full">Acceder</button>' +
      '</div></div></article>';
  }

  function updateGrupoCarouselNavButtons(track, slug) {
    var section = track && track.closest('[data-mf-grupo-section]');
    if (!section) return;
    var prev = section.querySelector('[data-mf-grupo-carousel-prev]');
    var next = section.querySelector('[data-mf-grupo-carousel-next]');
    if (!prev || !next) return;
    var hasOverflow = track.scrollWidth > track.clientWidth + 2;
    prev.disabled = !hasOverflow;
    next.disabled = !hasOverflow;
  }

  var misCursosCarouselResizeBound = false;

  function bindMisCursosCarousels() {
    var container = qs('[data-mf-mis-cursos-sections]');
    if (!container) return;
    var step = 272;
    qsa('[data-mf-grupo-section]', container).forEach(function (section) {
      var track = section.querySelector('[data-mf-grupo-track]');
      var prev = section.querySelector('[data-mf-grupo-carousel-prev]');
      var next = section.querySelector('[data-mf-grupo-carousel-next]');
      if (!track) return;
      if (prev) {
        prev.addEventListener('click', function () {
          track.scrollBy({ left: -step, behavior: 'smooth' });
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          track.scrollBy({ left: step, behavior: 'smooth' });
        });
      }
      track.addEventListener('scroll', function () {
        updateGrupoCarouselNavButtons(track);
      });
    });
    if (!misCursosCarouselResizeBound) {
      window.addEventListener('resize', function () {
        var c = qs('[data-mf-mis-cursos-sections]');
        if (!c) return;
        qsa('[data-mf-grupo-track]', c).forEach(function (track) {
          updateGrupoCarouselNavButtons(track);
        });
      });
      misCursosCarouselResizeBound = true;
    }
  }

  function renderMisCursosSections() {
    var container = qs('[data-mf-mis-cursos-sections]');
    var empty = qs('[data-mf-mis-cursos-empty]');
    if (!container) return;
    var grupos = getAssignedGrupos();
    if (!grupos.length) {
      container.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      return;
    }
    if (empty) empty.classList.add('hidden');
    container.innerHTML = grupos.map(function (ag) {
      var cards = ag.courseIds.map(renderCarouselCourseCard).join('');
      return '<section data-mf-grupo-section="' + ag.slug + '" data-testid="mis-cursos-section-' + ag.slug + '" class="mf-carousel-section mis-cursos-section mb-6 rounded-lg border p-6">' +
        '<div class="flex flex-wrap items-start justify-between gap-3">' +
        '<div class="min-w-0">' +
        '<h2 class="text-lg font-semibold text-gray-900" style="font-family: var(--brand-font-heading)">' + ag.name + '</h2></div>' +
        '<div class="flex items-center gap-2 shrink-0">' +
        '<a href="' + grupoPageUrl(ag.slug) + '" class="mf-btn-secondary">Ver todos</a>' +
        '<button type="button" data-mf-grupo-carousel-prev class="mf-btn-icon" aria-label="Desplazar cursos anteriores">' + CAROUSEL_CHEV_LEFT + '</button>' +
        '<button type="button" data-mf-grupo-carousel-next class="mf-btn-icon" aria-label="Desplazar cursos siguientes">' + CAROUSEL_CHEV_RIGHT + '</button>' +
        '</div></div>' +
        '<div data-mf-grupo-track="' + ag.slug + '" class="inicio-recent-track mt-4 flex gap-4 overflow-x-auto pb-2 scroll-smooth" tabindex="0" role="region" aria-label="Cursos de ' + ag.name + '">' + cards + '</div>' +
        '</section>';
    }).join('');
    bindMisCursosCarousels();
    qsa('[data-mf-grupo-track]', container).forEach(function (track) {
      updateGrupoCarouselNavButtons(track);
    });
  }

  function renderGrupoPageContent(ag) {
    document.title = ag.name + ' — Mi formación';
    var title = qs('[data-mf-grupo-title]');
    var desc = qs('[data-mf-grupo-desc]');
    var crumb = qs('[data-mf-grupo-breadcrumb-name]');
    if (title) setText(title, ag.name);
    if (desc) setText(desc, ag.description);
    if (crumb) setText(crumb, ag.name);
    var grid = qs('[data-testid="course-grid"]');
    if (grid) {
      grid.innerHTML = ag.courseIds.map(renderGrupoGridCourseCard).join('');
    }
  }

  function initGrupoPage() {
    if (document.body.getAttribute('data-mf-page') !== 'grupo') return true;
    var ag = getAssignedGrupoBySlug(getGrupoSlugFromUrl());
    if (!ag) {
      window.location.replace('mis-cursos.html');
      return false;
    }
    renderGrupoPageContent(ag);
    return true;
  }

  var ACCORDION_CHEV_SVG = '<svg data-mf-accordion-chevron class="heroicon heroicon-sm shrink-0 text-gray-400 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"/></svg>';

  function renderMallaCompactRow(id, tabUnlocked) {
    var c = COURSES[id];
    if (!c) return '';
    if (!tabUnlocked) {
      return '<div class="mis-mallas-compact-row mis-mallas-compact-row--locked flex items-center gap-2 py-2 border-b border-gray-100 last:border-0" data-mf-course="' + id + '">' +
        '<span class="flex-1 min-w-0 text-sm text-gray-400 truncate">' + c.title + '</span></div>';
    }
    return '<div class="mis-mallas-compact-row flex flex-wrap items-center gap-2 py-2 border-b border-gray-100 last:border-0" data-mf-course="' + id + '">' +
      '<span class="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate">' + c.title + '</span>' +
      '<span data-mf-status-chip class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 shrink-0">Pendiente</span>' +
      '<button type="button" data-mf-ver-mas data-mf-modal-course="' + id + '" class="mf-btn-secondary mf-btn-sm shrink-0">Ver más</button>' +
      '<button type="button" data-mf-acceder class="mf-btn-primary mf-btn-sm shrink-0">Acceder</button></div>';
  }

  function mallaAccordionPanelId(mallaSlug, tab) {
    return 'mf-malla-accordion-' + mallaSlug + '-' + tab;
  }

  function toggleMallaAccordion(trigger) {
    if (!trigger) return;
    var expanded = trigger.getAttribute('aria-expanded') === 'true';
    var panelId = trigger.getAttribute('aria-controls');
    var panel = panelId ? document.getElementById(panelId) : null;
    trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    if (panel) panel.classList.toggle('hidden', expanded);
    var chev = trigger.querySelector('[data-mf-accordion-chevron]');
    if (chev) chev.classList.toggle('mf-accordion-chevron--open', !expanded);
  }

  function renderMisMallasPhaseBlock(phase, mallaSlug) {
    var tabUnlocked = isMallaTabUnlocked(mallaSlug, phase.tab);
    var approved = countApprovedInMallaTab(mallaSlug, phase.tab);
    var total = phase.courseIds.length;
    var panelId = mallaAccordionPanelId(mallaSlug, phase.tab);
    var lockIcon = tabUnlocked ? '' : '<span data-mf-accordion-lock class="inline-flex items-center text-gray-400" title="Fase bloqueada">' + LOCK_SVG_SM + '</span>';
    var rows = phase.courseIds.map(function (id) {
      return renderMallaCompactRow(id, tabUnlocked);
    }).join('');
    return '<div class="mf-accordion mis-mallas-accordion rounded-lg border border-gray-200 bg-white overflow-hidden" data-mf-malla-phase="' + phase.tab + '">' +
      '<button type="button" data-mf-accordion-trigger class="mf-accordion-trigger w-full flex flex-wrap items-center gap-2 px-4 py-3 text-left text-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-inset" aria-expanded="false" aria-controls="' + panelId + '">' +
      '<span class="inline-flex h-2 w-2 rounded-full shrink-0 ' + (tabUnlocked ? 'bg-[var(--brand-primary)]' : 'bg-gray-300') + '" aria-hidden="true"></span>' +
      '<span class="font-semibold text-gray-900">' + phase.label + '</span>' +
      '<span data-mf-accordion-count class="text-gray-500">' + approved + ' de ' + total + ' aprobados</span>' +
      lockIcon +
      '<span class="ml-auto">' + ACCORDION_CHEV_SVG + '</span>' +
      '</button>' +
      '<div id="' + panelId + '" class="mf-accordion-panel hidden border-t border-gray-200 px-4 py-2 mis-mallas-phase-courses" role="region" aria-label="' + phase.label + '">' + rows + '</div></div>';
  }

  function renderMisMallasSections() {
    var container = qs('[data-mf-mis-mallas-sections]');
    var empty = qs('[data-mf-mis-mallas-empty]');
    if (!container) return;
    var mallas = getAssignedMallas();
    if (!mallas.length) {
      container.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      return;
    }
    if (empty) empty.classList.add('hidden');
    container.innerHTML = mallas.map(function (am) {
      var phases = am.phases.map(function (phase) {
        return renderMisMallasPhaseBlock(phase, am.slug);
      }).join('');
      return '<section data-mf-malla-section="' + am.slug + '" data-testid="mis-mallas-section-' + am.slug + '" class="mis-mallas-section rounded-lg border border-gray-200 bg-white p-4 sm:p-6">' +
        '<div class="flex flex-wrap items-start justify-between gap-3 mb-4">' +
        '<div class="min-w-0">' +
        '<h2 class="text-lg font-semibold text-gray-900" style="font-family: var(--brand-font-heading)">' + am.name + '</h2>' +
        '<p class="text-sm text-gray-500 mt-0.5">' + am.description + '</p></div>' +
        '<div class="flex flex-wrap items-center gap-2 shrink-0">' +
        '<a href="' + mallaPageUrl(am.slug) + '" class="mf-btn-secondary">Ver más</a></div></div>' +
        '<div class="mis-mallas-accordions flex flex-col gap-2" data-testid="mis-mallas-accordions-' + am.slug + '">' + phases + '</div></section>';
    }).join('');
  }

  function renderMallaGridCourseCard(id, phaseLabel) {
    var c = COURSES[id];
    if (!c) return '';
    return '<article data-mf-course="' + id + '" class="rounded-lg border border-gray-200 bg-white overflow-hidden flex flex-col">' +
      '<div class="aspect-video bg-gray-200 relative">' +
      '<img src="' + courseCoverUrl(id) + '" alt="" loading="lazy" decoding="async" class="w-full h-full object-cover">' +
      '<span data-mf-lock-badge class="hidden absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-gray-900/85 text-white text-xs px-2 py-1">' + LOCK_SVG_SM + ' Bloqueado</span></div>' +
      '<div class="p-4 flex flex-col flex-1">' +
      '<div class="flex flex-wrap gap-2 mb-2">' +
      '<span class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">' + phaseLabel + '</span>' +
      '<span data-mf-status-chip class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">Pendiente</span></div>' +
      '<h3 class="font-medium text-gray-900">' + c.title + '</h3>' +
      '<p class="text-sm text-gray-500 mt-1">' + c.duration + '</p>' +
      '<div class="mt-auto pt-4 flex gap-2">' +
      '<button type="button" data-mf-ver-mas data-mf-modal-course="' + id + '" class="mf-btn-secondary flex-1 w-full">Ver más</button>' +
      '<button type="button" data-mf-acceder class="mf-btn-primary flex-1 w-full">Acceder</button>' +
      '</div></div></article>';
  }

  function renderMallaPageContent(am) {
    document.title = am.name + ' — Mi formación';
    var title = qs('[data-mf-malla-title]');
    var desc = qs('[data-mf-malla-desc]');
    var crumb = qs('[data-mf-malla-breadcrumb-name]');
    if (title) setText(title, am.name);
    if (desc) setText(desc, am.description);
    if (crumb) setText(crumb, am.name);

    var tabsEl = qs('[data-mf-malla-tabs]');
    var panelsEl = qs('[data-mf-malla-panels]');
    if (!tabsEl || !panelsEl) return;

    var lockSvg = '<svg data-mf-tab-lock class="hidden malla-tab-lock-icon heroicon heroicon-sm shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>';
    tabsEl.setAttribute('role', 'tablist');
    tabsEl.className = 'flex flex-wrap gap-1 border-b border-gray-200 mb-6';
    tabsEl.innerHTML = am.phases.map(function (phase, idx) {
      var active = idx === 0;
      return '<button type="button" data-mf-malla-tab="' + phase.tab + '" role="tab" aria-selected="' + (active ? 'true' : 'false') + '" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 ' +
        (active ? 'border-gray-900 text-gray-900 malla-tab-active' : 'border-transparent text-gray-500') + '">' +
        '<span>' + phase.label + '</span>' + lockSvg + '</button>';
    }).join('');

    panelsEl.innerHTML = am.phases.map(function (phase, idx) {
      var cards = phase.courseIds.map(function (id) {
        return renderMallaGridCourseCard(id, phase.label);
      }).join('');
      return '<div data-mf-malla-panel="' + phase.tab + '" class="' + (idx === 0 ? '' : 'hidden ') + 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="course-grid">' + cards + '</div>';
    }).join('');
  }

  function initMallaPage() {
    if (document.body.getAttribute('data-mf-page') !== 'malla') return true;
    var am = getAssignedMallaBySlug(getMallaSlugFromUrl());
    if (!am) {
      window.location.replace('mis-mallas.html');
      return false;
    }
    renderMallaPageContent(am);
    return true;
  }

  function pendingNotifications() {
    if (getLevel() === '100') return [];
    var items = [];
    Object.keys(COURSES).forEach(function (id) {
      var c = COURSES[id];
      if (c.grupo === 'complementaria' && c.noLock) {
        if (!isApproved(id)) {
          items.push({ id: id, title: c.title, page: GRUPOS.complementaria.page, grupo: GRUPOS.complementaria.label });
        }
        return;
      }
      if (!isApproved(id) && !isCourseLocked(id)) {
        var page = c.grupo === 'malla' ? mallaPageUrl(c.mallaSlug) : GRUPOS[c.grupo].page;
        var grupo = courseGrupoLabel(id);
        items.push({ id: id, title: c.title, page: page, grupo: grupo });
      }
    });
    return items.slice(0, 8);
  }

  function lockMessage(id) {
    var c = COURSES[id];
    if (!c) return '';
    if (c.grupo === 'malla' && !isMallaTabUnlocked(c.mallaSlug, c.tab)) {
      var up = getMallaPhaseUpstream(c.mallaSlug, c.tab);
      return 'Completa todos los cursos de ' + getMallaPhaseLabel(c.mallaSlug, up) + ' para desbloquear esta sección.';
    }
    if (c.prereqs && c.prereqs.length) {
      return 'Completa ' + prereqTitles(c.prereqs).join(' y ') + ' para desbloquear este curso.';
    }
    return 'Completa los prerrequisitos para desbloquear este curso.';
  }

  /* ── DOM updates ─────────────────────────────────────────────────────── */

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function setText(el, text) {
    if (el) el.textContent = text;
  }

  function updateSimButtons() {
    var level = getLevel();
    qsa('[data-mf-progress]').forEach(function (btn) {
      var active = btn.getAttribute('data-mf-progress') === level;
      btn.classList.toggle('sim-bar-btn--active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function updateNavActive() {
    var page = document.body.getAttribute('data-mf-page');
    if (!page) return;
    var map = {
      inicio: ['navInicio', 'mobNavInicio'],
      'mis-cursos': ['navCursos', 'mobNavCursos'],
      grupo: ['navCursos', 'mobNavCursos'],
      'mis-mallas': ['navMallas', 'mobNavMallas'],
      malla: ['navMallas', 'mobNavMallas'],
      biblioteca: ['navBiblioteca', 'mobNavBiblioteca'],
      favoritos: ['navGuardados', 'mobNavGuardados'],
      perfil: ['navPerfil', 'mobNavPerfil'],
      equipo: ['navEquipo', 'mobNavEquipo']
    };
    var activeIds = map[page] || [];
    qsa('[data-mf-nav]').forEach(function (link) {
      var on = activeIds.indexOf(link.id) >= 0;
      link.classList.toggle('mf-nav-active', on);
      link.classList.toggle('text-muted-foreground', !on);
      if (on) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function updateUserDisplay() {
    qsa('[data-mf-user-name]').forEach(function (el) { setText(el, DEMO_USER); });
  }

  function updateProgressRing() {
    var ring = qs('[data-mf-progress-ring]');
    if (!ring) return;
    var pct = progressPercent();
    var circumference = 2 * Math.PI * 42;
    ring.style.strokeDashoffset = String(circumference * (1 - pct / 100));
  }

  var DASHBOARD_RING_R = 38;
  var DASHBOARD_RING_STROKE = 10;
  var DASHBOARD_ESTADO_ORDER = ['aprobado', 'en-proceso', 'reprobado', 'bloqueado', 'no-iniciado'];
  var DASHBOARD_ESTADO_LABELS = {
    aprobado: 'Aprobado',
    'en-proceso': 'En proceso',
    reprobado: 'Reprobado',
    bloqueado: 'Bloqueado',
    'no-iniciado': 'No iniciado'
  };
  var DASHBOARD_ESTADO_COLORS = {
    aprobado: '#22c55e',
    'en-proceso': '#f59e0b',
    reprobado: '#ef4444',
    bloqueado: '#4b5563',
    'no-iniciado': '#d1d5db'
  };

  function getDashboardEstadoKey(id) {
    if (isApproved(id)) return 'aprobado';
    if (getReprobadoSet().has(id)) return 'reprobado';
    if (getEnProcesoSet().has(id)) return 'en-proceso';
    if (isCourseLocked(id)) return 'bloqueado';
    return 'no-iniciado';
  }

  function countEstadosInGrupo(grupoKey) {
    var counts = { aprobado: 0, 'en-proceso': 0, reprobado: 0, bloqueado: 0, 'no-iniciado': 0 };
    coursesInGrupo(grupoKey).forEach(function (id) {
      counts[getDashboardEstadoKey(id)]++;
    });
    return counts;
  }

  function buildDashboardDonutSvg(counts) {
    var total = DASHBOARD_ESTADO_ORDER.reduce(function (s, k) { return s + (counts[k] || 0); }, 0);
    var r = DASHBOARD_RING_R;
    var sw = DASHBOARD_RING_STROKE;
    var circ = 2 * Math.PI * r;
    var bg = '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="#f4f4f5" stroke-width="' + sw + '"/>';
    if (!total) return bg;
    var cum = 0;
    return bg + DASHBOARD_ESTADO_ORDER.map(function (key) {
      var n = counts[key] || 0;
      if (!n) return '';
      var len = (n / total) * circ;
      var dash = len.toFixed(2) + ' ' + (circ - len).toFixed(2);
      var off = (-cum).toFixed(2);
      cum += len;
      return '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + DASHBOARD_ESTADO_COLORS[key] + '" stroke-width="' + sw + '" stroke-dasharray="' + dash + '" stroke-dashoffset="' + off + '"/>';
    }).join('');
  }

  function buildDashboardLegendHtml(counts) {
    return DASHBOARD_ESTADO_ORDER.map(function (key) {
      var n = counts[key] || 0;
      return '<li class="flex items-center justify-between gap-1.5 text-xs">' +
        '<span class="flex items-center gap-1 min-w-0">' +
        '<span class="inicio-dashboard-swatch" style="background-color:' + DASHBOARD_ESTADO_COLORS[key] + '" aria-hidden="true"></span>' +
        '<span class="text-gray-600 truncate">' + DASHBOARD_ESTADO_LABELS[key] + '</span></span>' +
        '<span class="font-medium text-gray-900 tabular-nums shrink-0">' + n + '</span></li>';
    }).join('');
  }

  function dashboardAriaLabel(grupoKey, counts) {
    var g = GRUPOS[grupoKey];
    var parts = DASHBOARD_ESTADO_ORDER
      .filter(function (k) { return (counts[k] || 0) > 0; })
      .map(function (k) { return counts[k] + ' ' + DASHBOARD_ESTADO_LABELS[k].toLowerCase(); });
    return g.label + ': ' + (parts.length ? parts.join(', ') : 'sin cursos') + ' de ' + g.total + ' cursos asignados';
  }

  function updateSectionDashboards() {
    ['induccion', 'normativos', 'complementaria', 'malla'].forEach(function (gk) {
      var chart = qs('[data-mf-dashboard-chart="' + gk + '"]');
      if (!chart && !qs('[data-mf-dashboard-legend="' + gk + '"]')) return;
      var counts = countEstadosInGrupo(gk);
      var g = GRUPOS[gk];
      var approved = countApprovedInGrupo(gk);
      var pct = g.total ? Math.round((approved / g.total) * 100) : 0;
      if (chart) chart.innerHTML = buildDashboardDonutSvg(counts);
      var legend = qs('[data-mf-dashboard-legend="' + gk + '"]');
      if (legend) legend.innerHTML = buildDashboardLegendHtml(counts);
      var pctEl = qs('[data-mf-dashboard-pct="' + gk + '"]');
      if (pctEl) setText(pctEl, pct + '%');
      var chip = qs('[data-mf-dashboard-chip="' + gk + '"]');
      if (chip) {
        chip.className = tileChipClass(gk);
        setText(chip, tileChipLabel(gk));
      }
      var approvedEl = qs('[data-mf-dashboard-approved="' + gk + '"]');
      if (approvedEl) setText(approvedEl, String(approved));
      var totalEl = qs('[data-mf-dashboard-total="' + gk + '"]');
      if (totalEl) setText(totalEl, String(g.total));
      var figcaption = qs('[data-mf-dashboard-figcaption="' + gk + '"]');
      if (figcaption) setText(figcaption, dashboardAriaLabel(gk, counts));
    });
  }

  function updateWelcome() {
    var sub = qs('[data-mf-welcome-subtitle]');
    if (sub) sub.textContent = welcomeSubtitle();
    var pct = qs('[data-mf-overall-pct]');
    if (pct) setText(pct, progressPercent() + '%');
    var bar = qs('[data-mf-overall-bar]');
    if (bar) bar.style.width = progressPercent() + '%';
    updateProgressRing();
    var count = qs('[data-mf-overall-count]');
    if (count) setText(count, totalApproved() + ' de ' + totalMandatory() + ' ítems obligatorios');

    updateSectionDashboards();
    updateCongrats();
  }

  function countApprovedInMallaTab(mallaSlug, tab) {
    return coursesInMallaTab(mallaSlug, tab).filter(function (id) { return isApproved(id); }).length;
  }

  function updateCongrats() {
    var alert = qs('[data-mf-congrats]');
    if (!alert) return;
    if (getLevel() !== '100') {
      alert.classList.add('hidden');
      return;
    }
    if (localStorage.getItem(CONGRATS_KEY) === '1') {
      alert.classList.add('hidden');
      return;
    }
    alert.classList.remove('hidden');
  }

  function dismissCongrats() {
    localStorage.setItem(CONGRATS_KEY, '1');
    var alert = qs('[data-mf-congrats]');
    if (alert) alert.classList.add('hidden');
  }

  function updateGrupoProgress(attr) {
    var el = qs('[data-mf-grupo-progress="' + attr + '"]');
    if (!el) return;
    var gk = attr;
    var g = GRUPOS[gk];
    if (g) setText(el, countApprovedInGrupo(gk) + ' de ' + g.total);
  }

  function updateCourseCards() {
    qsa('[data-mf-course]').forEach(function (card) {
      var id = card.getAttribute('data-mf-course');
      var c = COURSES[id];
      if (!c) return;
      var locked = isCourseLocked(id);
      var approved = isApproved(id);

      card.classList.toggle('course-card-locked', locked);
      card.setAttribute('aria-disabled', locked ? 'true' : 'false');

      var badge = card.querySelector('[data-mf-lock-badge]');
      if (badge) badge.classList.toggle('hidden', !locked);

      var chip = card.querySelector('[data-mf-status-chip]');
      if (chip) {
        chip.className = statusChipClass(id);
        setText(chip, statusLabel(id));
      }

      card.setAttribute('data-mf-estado', getCourseEstadoKey(id));
      if (c.categoria) card.setAttribute('data-mf-categoria', c.categoria);

      var acceder = card.querySelector('[data-mf-acceder]');
      if (acceder) {
        acceder.disabled = locked;
        acceder.classList.toggle('opacity-50', locked);
        acceder.classList.toggle('cursor-not-allowed', locked);
        acceder.setAttribute('title', locked ? lockMessage(id) : '');
      }

      var verMas = card.querySelector('[data-mf-ver-mas]');
      if (verMas) {
        verMas.setAttribute('data-mf-modal-course', id);
      }

      var coverImg = card.querySelector('.aspect-video img');
      if (coverImg) {
        var coverSrc = courseCoverUrl(id);
        if (coverImg.getAttribute('src') !== coverSrc) coverImg.setAttribute('src', coverSrc);
        coverImg.setAttribute('loading', 'lazy');
        coverImg.setAttribute('decoding', 'async');
      }

      injectBookmarkButton(card, id);
    });
    updateBookmarkButtons();
  }

  function updateMallaTabs() {
    var mallaSlug = getMallaSlugFromUrl();
    if (!mallaSlug || !qs('[data-mf-malla-tabs]')) return;
    var am = getAssignedMallaBySlug(mallaSlug);
    if (!am) return;
    var defaultTab = am.phases[0] ? am.phases[0].tab : '';
    var activeTab = document.querySelector('[data-mf-malla-tab].malla-tab-active');
    var activeId = activeTab ? activeTab.getAttribute('data-mf-malla-tab') : defaultTab;

    qsa('[data-mf-malla-tab]').forEach(function (btn) {
      var tab = btn.getAttribute('data-mf-malla-tab');
      var unlocked = isMallaTabUnlocked(mallaSlug, tab);
      var lockIcon = btn.querySelector('[data-mf-tab-lock]');
      if (lockIcon) lockIcon.classList.toggle('hidden', unlocked);
      btn.disabled = false;
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
      btn.setAttribute('aria-disabled', 'false');
    });

    switchMallaTab(activeId, true);
  }

  function switchMallaTab(tabId, skipFocus) {
    qsa('[data-mf-malla-tab]').forEach(function (btn) {
      var t = btn.getAttribute('data-mf-malla-tab');
      var on = t === tabId;
      btn.classList.toggle('border-gray-900', on);
      btn.classList.toggle('text-gray-900', on);
      btn.classList.toggle('border-transparent', !on);
      btn.classList.toggle('text-gray-500', !on);
      btn.classList.toggle('malla-tab-active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    qsa('[data-mf-malla-panel]').forEach(function (panel) {
      var show = panel.getAttribute('data-mf-malla-panel') === tabId;
      panel.classList.toggle('hidden', !show);
    });
    updateCourseCards();
  }

  function updateNotifications() {
    var badge = qs('[data-mf-notif-badge]');
    var list = qs('[data-mf-notif-list]');
    var empty = qs('[data-mf-notif-empty]');
    var items = pendingNotifications();

    if (badge) {
      if (items.length === 0) {
        badge.classList.add('hidden');
        setText(badge, '0');
      } else {
        badge.classList.remove('hidden');
        setText(badge, String(items.length));
      }
    }

    if (list) {
      if (items.length === 0) {
        list.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
      } else {
        if (empty) empty.classList.add('hidden');
        list.innerHTML = items.map(function (it) {
          return '<a href="' + it.page + '" class="block px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 rounded-md mx-1">' +
            '<span class="font-medium">' + it.title + '</span>' +
            '<span class="block text-xs text-gray-500">' + it.grupo + '</span></a>';
        }).join('');
      }
    }
  }

  function getEarnedInsignias() {
    return new Set(INSIGNIAS_BY_LEVEL[getLevel()] || []);
  }

  function updateInsignias() {
    var earned = getEarnedInsignias();
    qsa('[data-mf-insignia]').forEach(function (el) {
      var key = el.getAttribute('data-mf-insignia');
      var done = earned.has(key);
      el.classList.toggle('opacity-40', !done);
      el.classList.toggle('grayscale', !done);
      var lock = el.querySelector('[data-mf-insignia-lock]');
      if (lock) lock.classList.toggle('hidden', done);
      el.classList.toggle('mf-insignia-card--earned', done);
    });
  }

  function applyAll() {
    updateSimButtons();
    updateNavActive();
    updateUserDisplay();
    renderEquipoTable();
    updateWelcome();
    updateGrupoProgress('induccion');
    updateGrupoProgress('normativos');
    updateGrupoProgress('complementaria');
    updateGrupoProgress('malla');
    updateCourseCards();
    if (qs('[data-mf-malla-tabs]')) updateMallaTabs();
    updateNotifications();
    updateInsignias();
    renderPerfilProfile();
    renderHistorialTable();
    updateRecentCarousel();
    renderMisCursosSections();
    renderMisMallasSections();
    updateCourseCards();
    qsa('[data-mf-grupo-track]').forEach(function (track) {
      updateGrupoCarouselNavButtons(track);
    });
    applyGrupoCourseFilters(true);
    applyEquipoFilters(true);
    if (modalCourseId) populateCourseModal(modalCourseId);
  }

  /* ── Modals ──────────────────────────────────────────────────────────── */

  var modalTrigger = null;

  var modalCourseId = null;
  var resourceModalTrigger = null;

  function openResourceModal(id) {
    var r = RESOURCES[id];
    var modal = document.getElementById('resourceModal');
    if (!r || !modal) return;
    qs('#resourceModalTitle', modal) && setText(qs('#resourceModalTitle', modal), r.title);
    var typeEl = qs('[data-mf-resource-modal-type]', modal);
    var metaEl = qs('[data-mf-resource-modal-meta]', modal);
    var contentEl = qs('[data-mf-resource-modal-content]', modal);
    if (typeEl) setText(typeEl, r.typeLabel);
    if (metaEl) setText(metaEl, r.meta);
    if (contentEl) {
      contentEl.innerHTML = renderResourceModalContent(r);
      contentEl.setAttribute('aria-label', 'Contenido: ' + r.title);
    }
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    modal.focus();
  }

  function closeResourceModal() {
    var modal = document.getElementById('resourceModal');
    if (!modal) return;
    var contentEl = qs('[data-mf-resource-modal-content]', modal);
    if (contentEl) {
      var video = contentEl.querySelector('video');
      if (video) video.pause();
      contentEl.innerHTML = '';
    }
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (resourceModalTrigger) resourceModalTrigger.focus();
  }

  function populateGrupoCategoryFilter(grupoKey) {
    var select = qs('[data-mf-course-filter-categoria]');
    if (!select) return;
    var cats = {};
    coursesInGrupo(grupoKey).forEach(function (id) {
      if (COURSES[id]) cats[COURSES[id].categoria] = true;
    });
    var sorted = Object.keys(cats).sort(function (a, b) {
      return a.localeCompare(b, 'es');
    });
    select.innerHTML = '<option value="">Todas</option>' + sorted.map(function (cat) {
      return '<option value="' + cat.replace(/"/g, '&quot;') + '">' + cat + '</option>';
    }).join('');
  }

  function courseMatchesGrupoFilters(card, grupoKey) {
    var id = card.getAttribute('data-mf-course');
    var c = COURSES[id];
    if (!c || c.grupo !== grupoKey) return true;

    var searchEl = qs('[data-mf-course-search]');
    var catEl = qs('[data-mf-course-filter-categoria]');
    var estadoEl = qs('[data-mf-course-filter-estado]');
    var query = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var cat = catEl ? catEl.value : '';
    var estado = estadoEl ? estadoEl.value : '';

    if (query && c.title.toLowerCase().indexOf(query) === -1) return false;
    if (cat && c.categoria !== cat) return false;
    if (estado && getCourseEstadoKey(id) !== estado) return false;
    return true;
  }

  function updateGrupoPaginationUI(matchedCount, totalPages) {
    var info = qs('[data-mf-course-page-info]');
    if (info) setText(info, 'Página ' + grupoPagination.page + ' de ' + totalPages);

    var prev = qs('[data-mf-course-page-prev]');
    var next = qs('[data-mf-course-page-next]');
    if (prev) prev.disabled = grupoPagination.page <= 1;
    if (next) next.disabled = grupoPagination.page >= totalPages || matchedCount === 0;

    var paginator = qs('[data-mf-course-pagination]');
    if (paginator) paginator.classList.toggle('hidden', matchedCount === 0);
  }

  function applyGrupoCourseFilters(resetPage) {
    var grid = qs('[data-testid="course-grid"]');
    var grupoKey = getGrupoKeyForPage();
    if (!grid || !grupoKey) return;

    if (resetPage) grupoPagination.page = 1;

    var pageSizeEl = qs('[data-mf-course-page-size]');
    if (pageSizeEl) {
      grupoPagination.pageSize = parseInt(pageSizeEl.value, 10) || 12;
    }

    var cards = qsa('[data-mf-course]', grid);
    var matched = [];
    cards.forEach(function (card) {
      if (courseMatchesGrupoFilters(card, grupoKey)) matched.push(card);
    });

    var totalPages = Math.max(1, Math.ceil(matched.length / grupoPagination.pageSize));
    if (grupoPagination.page > totalPages) grupoPagination.page = totalPages;
    if (grupoPagination.page < 1) grupoPagination.page = 1;

    var start = (grupoPagination.page - 1) * grupoPagination.pageSize;
    var end = start + grupoPagination.pageSize;

    cards.forEach(function (card) {
      var idx = matched.indexOf(card);
      var onPage = idx >= 0 && idx >= start && idx < end;
      card.classList.toggle('hidden', !onPage);
    });

    var empty = qs('[data-mf-course-filter-empty]');
    if (empty) empty.classList.toggle('hidden', matched.length > 0);
    grid.classList.toggle('hidden', matched.length === 0);

    updateGrupoPaginationUI(matched.length, totalPages);
  }

  function bindGrupoFilters() {
    var toolbar = qs('[data-mf-course-filters]');
    var grupoKey = getGrupoKeyForPage();
    if (!toolbar || !grupoKey) return;

    populateGrupoCategoryFilter(grupoKey);

    var pageSizeEl = qs('[data-mf-course-page-size]');
    if (pageSizeEl) {
      grupoPagination.pageSize = parseInt(pageSizeEl.value, 10) || 12;
    }

    function onFilterChange() {
      applyGrupoCourseFilters(true);
    }

    var search = qs('[data-mf-course-search]');
    var cat = qs('[data-mf-course-filter-categoria]');
    var estado = qs('[data-mf-course-filter-estado]');

    if (search) search.addEventListener('input', onFilterChange);
    if (cat) cat.addEventListener('change', onFilterChange);
    if (estado) estado.addEventListener('change', onFilterChange);
    if (pageSizeEl) pageSizeEl.addEventListener('change', onFilterChange);

    var prev = qs('[data-mf-course-page-prev]');
    var next = qs('[data-mf-course-page-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        if (grupoPagination.page > 1) {
          grupoPagination.page -= 1;
          applyGrupoCourseFilters(false);
        }
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        grupoPagination.page += 1;
        applyGrupoCourseFilters(false);
      });
    }

    qsa('[data-mf-course-filter-clear]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (search) search.value = '';
        if (cat) cat.value = '';
        if (estado) estado.value = '';
        applyGrupoCourseFilters(true);
        if (search) search.focus();
      });
    });
  }

  var bibliotecaTabFilter = '';
  var bibliotecaPagination = { page: 1, pageSize: 12 };
  var equipoPagination = { page: 1, pageSize: 6 };
  var equipoSort = { key: 'nombre', dir: 'asc' };

  var EQUIPO_SORT_ATTR = {
    rut: 'data-mf-rut',
    nombre: 'data-mf-member',
    gerencia: 'data-mf-gerencia',
    area: 'data-mf-area',
    cargo: 'data-mf-cargo',
    familia: 'data-mf-familia'
  };

  /** Demo direct reports — avance general = Aprobado count / 29 (same rule as Inicio, per user). */
  var EQUIPO_MEMBERS = [
    {
      id: 'carlos-ruiz',
      rut: '12.345.678-9',
      nombre: 'Carlos Ruiz',
      gerencia: 'Gerencia de Operaciones',
      area: 'Operaciones',
      cargo: 'Analista de procesos',
      familiaCargo: 'Operaciones y logística',
      ultimaConexion: '10/06/2026, 09:15',
      approved: ['IND-1', 'IND-2', 'IND-3', 'IND-4', 'NOR-1', 'NOR-2', 'COM-1', 'MLL-1', 'MLL-2'],
      enProceso: ['IND-5', 'NOR-3', 'MLL-3'],
      reprobado: ['NOR-4']
    },
    {
      id: 'ana-martinez',
      rut: '14.567.890-1',
      nombre: 'Ana Martínez',
      gerencia: 'Gerencia Comercial',
      area: 'Comercial',
      cargo: 'Ejecutiva de ventas',
      familiaCargo: 'Comercial y marketing',
      ultimaConexion: '09/06/2026, 16:42',
      approved: ['IND-1', 'IND-2', 'IND-3', 'IND-4', 'IND-5', 'IND-6', 'NOR-1', 'NOR-2', 'NOR-3', 'NOR-4', 'NOR-5', 'COM-1', 'COM-2', 'COM-3', 'MLL-1', 'MLL-2', 'MLL-3', 'MLL-4', 'MLL-5'],
      enProceso: ['NOR-6', 'MLL-6']
    },
    {
      id: 'pedro-soto',
      rut: '16.789.012-3',
      nombre: 'Pedro Soto',
      gerencia: 'Gerencia de Operaciones',
      area: 'Operaciones',
      cargo: 'Supervisor de planta',
      familiaCargo: 'Operaciones y logística',
      ultimaConexion: '05/06/2026, 11:08',
      approved: ['IND-1', 'IND-2', 'NOR-1', 'MLL-1'],
      enProceso: ['IND-3', 'NOR-2'],
      reprobado: ['IND-4']
    },
    {
      id: 'laura-fuentes',
      rut: '18.901.234-5',
      nombre: 'Laura Fuentes',
      gerencia: 'Gerencia Corporativa',
      area: 'RR.HH.',
      cargo: 'Analista de recursos humanos',
      familiaCargo: 'Administración y soporte',
      ultimaConexion: '11/06/2026, 08:03',
      approved: ['IND-1', 'IND-2', 'IND-3', 'IND-4', 'IND-5', 'NOR-1', 'NOR-2', 'NOR-3', 'NOR-4', 'COM-1', 'COM-2', 'MLL-1', 'MLL-2', 'MLL-3', 'MLL-4'],
      enProceso: ['NOR-5', 'MLL-5']
    },
    {
      id: 'diego-morales',
      rut: '20.123.456-7',
      nombre: 'Diego Morales',
      gerencia: 'Gerencia de Tecnología',
      area: 'TI',
      cargo: 'Desarrollador de software',
      familiaCargo: 'Tecnología e innovación',
      ultimaConexion: '02/06/2026, 19:27',
      approved: ['IND-1', 'IND-2', 'IND-3', 'NOR-1', 'NOR-2', 'NOR-3', 'COM-1', 'COM-2', 'MLL-1', 'MLL-2', 'MLL-3'],
      enProceso: ['IND-4', 'MLL-4'],
      reprobado: ['NOR-4']
    },
    {
      id: 'valentina-rojas',
      rut: '22.345.678-9',
      nombre: 'Valentina Rojas',
      gerencia: 'Gerencia Comercial',
      area: 'Comercial',
      cargo: 'Jefa de equipo comercial',
      familiaCargo: 'Comercial y marketing',
      ultimaConexion: '08/06/2026, 13:51',
      approved: Object.keys(COURSES)
    }
  ];

  function equipoMemberById(id) {
    return EQUIPO_MEMBERS.find(function (m) { return m.id === id; }) || null;
  }

  function memberProgressPercent(member) {
    if (!member || !member.approved) return 0;
    return Math.round((member.approved.length / totalMandatory()) * 100);
  }

  function memberAvanceBarHtml(pct) {
    return '<div class="flex items-center gap-2 min-w-[8.5rem]">' +
      '<div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Avance general ' + pct + '%">' +
      '<div data-mf-equipo-avance-bar class="inicio-progress-fill h-full rounded-full transition-all" style="width:' + pct + '%"></div></div>' +
      '<span data-mf-equipo-avance-pct class="text-xs font-medium text-gray-700 tabular-nums w-10 text-right shrink-0">' + pct + '%</span></div>';
  }

  function renderProfileSummary(container, profile) {
    if (!container || !profile) return;
    var avatar = qs('[data-mf-profile-avatar]', container);
    var nameEl = qs('[data-mf-profile-name]', container);
    var rutEl = qs('[data-mf-profile-rut]', container);
    var cargoEl = qs('[data-mf-profile-cargo]', container);
    var orgEl = qs('[data-mf-profile-org]', container);
    if (avatar) {
      avatar.src = memberAvatarUrl(profile);
      avatar.alt = 'Foto de ' + profile.nombre;
    }
    if (nameEl) setText(nameEl, profile.nombre);
    if (rutEl) setText(rutEl, profile.rut);
    if (cargoEl) setText(cargoEl, profile.cargo);
    if (orgEl) {
      setText(orgEl, profile.gerencia + ' · ' + profile.area + ' · ' + profile.familiaCargo);
    }
    var ultimaEl = qs('[data-mf-profile-ultima-conexion]', container);
    if (ultimaEl) {
      setText(ultimaEl, profile.ultimaConexion ? 'Última conexión: ' + profile.ultimaConexion : '');
    }
  }

  function renderProfileStats(container, counts, pct) {
    if (!container) return;
    var avancePctEl = qs('[data-mf-profile-avance-pct]', container);
    if (avancePctEl) setText(avancePctEl, pct + '%');
    var finalEl = qs('[data-mf-profile-stat-finalizados]', container);
    var aprobEl = qs('[data-mf-profile-stat-aprobados]', container);
    var reprobEl = qs('[data-mf-profile-stat-reprobados]', container);
    if (finalEl) setText(finalEl, String(counts.finalizados));
    if (aprobEl) setText(aprobEl, String(counts.aprobados));
    if (reprobEl) setText(reprobEl, String(counts.reprobados));
    var statsList = qs('[data-mf-profile-stats]', container);
    if (statsList) {
      statsList.setAttribute('aria-label',
        'Resumen de cursos finalizados: ' + counts.finalizados + ' finalizados, ' +
        counts.aprobados + ' aprobados, ' + counts.reprobados + ' reprobados');
    }
  }

  function profileHistorialCounts() {
    var ids = historialCourseIds();
    var aprobados = 0;
    var reprobados = 0;
    ids.forEach(function (id) {
      var key = getCourseEstadoKey(id);
      if (key === 'aprobado') aprobados++;
      else if (key === 'reprobado') reprobados++;
    });
    return { finalizados: ids.length, aprobados: aprobados, reprobados: reprobados };
  }

  function memberHistorialCounts(member) {
    if (!member) return { finalizados: 0, aprobados: 0, reprobados: 0 };
    var aprobados = (member.approved || []).length;
    var reprobados = (member.reprobado || []).length;
    return { finalizados: aprobados + reprobados, aprobados: aprobados, reprobados: reprobados };
  }

  function renderPerfilProfile() {
    var container = qs('[data-mf-perfil-profile]');
    if (!container) return;
    var pct = progressPercent();
    renderProfileSummary(container, CURRENT_USER);
    renderProfileStats(container, profileHistorialCounts(), pct);
  }

  function renderEquipoTable() {
    var tbody = qs('[data-mf-equipo-tbody]');
    if (!tbody) return;

    tbody.innerHTML = EQUIPO_MEMBERS.map(function (m) {
      var pct = memberProgressPercent(m);
      return '<tr data-mf-equipo-row data-mf-member-id="' + m.id + '" data-mf-member="' + m.nombre + '" data-mf-rut="' + m.rut + '" data-mf-area="' + m.area + '" data-mf-gerencia="' + m.gerencia + '" data-mf-cargo="' + m.cargo + '" data-mf-familia="' + m.familiaCargo + '" data-mf-equipo-avance="' + pct + '">' +
        '<td class="px-4 py-3 text-left text-gray-600 whitespace-nowrap tabular-nums">' + m.rut + '</td>' +
        '<td class="px-4 py-3 text-left font-medium text-gray-900">' + m.nombre + '</td>' +
        '<td class="px-4 py-3 text-left text-gray-600">' + m.gerencia + '</td>' +
        '<td class="px-4 py-3 text-left text-gray-600">' + m.area + '</td>' +
        '<td class="px-4 py-3 text-left text-gray-600">' + m.cargo + '</td>' +
        '<td class="px-4 py-3 text-left text-gray-600">' + m.familiaCargo + '</td>' +
        '<td class="px-4 py-3 text-left">' + memberAvanceBarHtml(pct) + '</td>' +
        '<td class="px-4 py-3 text-left"><button type="button" data-mf-equipo-ver class="mf-btn-table">Ver cursos</button></td>' +
        '</tr>';
    }).join('');
    reorderEquipoTableRows();
    updateEquipoSortHeaders();
  }

  function equipoSortValue(row, key) {
    if (key === 'avance') return parseInt(row.getAttribute('data-mf-equipo-avance'), 10) || 0;
    var attr = EQUIPO_SORT_ATTR[key];
    return attr ? (row.getAttribute(attr) || '').toLowerCase() : '';
  }

  function compareEquipoRows(a, b) {
    var va = equipoSortValue(a, equipoSort.key);
    var vb = equipoSortValue(b, equipoSort.key);
    var cmp = equipoSort.key === 'avance'
      ? va - vb
      : String(va).localeCompare(String(vb), 'es', { sensitivity: 'base' });
    return equipoSort.dir === 'asc' ? cmp : -cmp;
  }

  function sortEquipoRowList(rows) {
    return rows.slice().sort(compareEquipoRows);
  }

  function reorderEquipoTableRows() {
    var tbody = qs('[data-mf-equipo-tbody]');
    if (!tbody) return;
    var rows = qsa('[data-mf-equipo-row]', tbody);
    sortEquipoRowList(rows).forEach(function (row) {
      tbody.appendChild(row);
    });
  }

  function updateEquipoSortHeaders() {
    qsa('[data-mf-equipo-sort]').forEach(function (btn) {
      var key = btn.getAttribute('data-mf-equipo-sort');
      var active = key === equipoSort.key;
      var th = btn.closest('th');
      if (th) {
        th.setAttribute('aria-sort', active ? (equipoSort.dir === 'asc' ? 'ascending' : 'descending') : 'none');
      }
      btn.classList.toggle('mf-table-sort-btn--active', active);
      btn.setAttribute('aria-pressed', String(active));
      var iconUp = btn.querySelector('[data-mf-equipo-sort-up]');
      var iconDown = btn.querySelector('[data-mf-equipo-sort-down]');
      if (iconUp) {
        iconUp.classList.toggle('hidden', active && equipoSort.dir !== 'asc');
        iconUp.classList.toggle('opacity-40', !active || equipoSort.dir !== 'asc');
      }
      if (iconDown) {
        iconDown.classList.toggle('hidden', active && equipoSort.dir !== 'desc');
        iconDown.classList.toggle('opacity-40', !active || equipoSort.dir !== 'desc');
      }
    });
  }

  function setEquipoSort(key) {
    if (equipoSort.key === key) {
      equipoSort.dir = equipoSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      equipoSort.key = key;
      equipoSort.dir = key === 'avance' ? 'desc' : 'asc';
    }
    reorderEquipoTableRows();
    updateEquipoSortHeaders();
    applyEquipoFilters(true);
  }

  function populateEquipoFilterSelect(selectAttr, memberField) {
    var select = qs(selectAttr);
    if (!select) return;
    var current = select.value;
    var seen = {};
    var values = [];
    EQUIPO_MEMBERS.forEach(function (m) {
      var val = m[memberField] || '';
      if (val && !seen[val]) {
        seen[val] = true;
        values.push(val);
      }
    });
    values.sort();
    select.innerHTML = '<option value="">Todas</option>';
    values.forEach(function (val) {
      var opt = document.createElement('option');
      opt.value = val;
      opt.textContent = val;
      select.appendChild(opt);
    });
    if (current && seen[current]) select.value = current;
  }

  function populateEquipoFilterSelects() {
    populateEquipoFilterSelect('[data-mf-equipo-filter-gerencia]', 'gerencia');
    populateEquipoFilterSelect('[data-mf-equipo-filter-area]', 'area');
    populateEquipoFilterSelect('[data-mf-equipo-filter-familia]', 'familiaCargo');
  }

  function equipoRowMatchesFilters(row) {
    var name = (row.getAttribute('data-mf-member') || '').toLowerCase();
    var rut = (row.getAttribute('data-mf-rut') || '').toLowerCase();
    var area = row.getAttribute('data-mf-area') || '';
    var gerencia = row.getAttribute('data-mf-gerencia') || '';
    var cargo = (row.getAttribute('data-mf-cargo') || '').toLowerCase();
    var familia = row.getAttribute('data-mf-familia') || '';
    var searchEl = qs('[data-mf-equipo-search]');
    var areaEl = qs('[data-mf-equipo-filter-area]');
    var gerenciaEl = qs('[data-mf-equipo-filter-gerencia]');
    var familiaEl = qs('[data-mf-equipo-filter-familia]');
    var query = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var areaFilter = areaEl ? areaEl.value : '';
    var gerenciaFilter = gerenciaEl ? gerenciaEl.value : '';
    var familiaFilter = familiaEl ? familiaEl.value : '';

    if (query) {
      var haystack = [name, rut, gerencia.toLowerCase(), area.toLowerCase(), cargo, familia.toLowerCase()].join(' ');
      if (haystack.indexOf(query) === -1) return false;
    }
    if (gerenciaFilter && gerencia !== gerenciaFilter) return false;
    if (areaFilter && area !== areaFilter) return false;
    if (familiaFilter && familia !== familiaFilter) return false;
    return true;
  }

  function equipoHasActiveFilters() {
    var searchEl = qs('[data-mf-equipo-search]');
    var areaEl = qs('[data-mf-equipo-filter-area]');
    var gerenciaEl = qs('[data-mf-equipo-filter-gerencia]');
    var familiaEl = qs('[data-mf-equipo-filter-familia]');
    return (searchEl && searchEl.value.trim()) ||
      (areaEl && areaEl.value) ||
      (gerenciaEl && gerenciaEl.value) ||
      (familiaEl && familiaEl.value);
  }

  function updateEquipoPaginationUI(matchedCount, totalPages) {
    var info = qs('[data-mf-equipo-page-info]');
    if (info) setText(info, 'Página ' + equipoPagination.page + ' de ' + totalPages);

    var prev = qs('[data-mf-equipo-page-prev]');
    var next = qs('[data-mf-equipo-page-next]');
    if (prev) prev.disabled = equipoPagination.page <= 1;
    if (next) next.disabled = equipoPagination.page >= totalPages || matchedCount === 0;

    var paginator = qs('[data-mf-equipo-pagination]');
    if (paginator) paginator.classList.toggle('hidden', matchedCount === 0);
  }

  function applyEquipoFilters(resetPage) {
    var toolbar = qs('[data-mf-equipo-filters]');
    if (!toolbar) return;

    var rows = qsa('[data-mf-equipo-row]');
    var tableWrap = qs('[data-mf-equipo-table-wrap]');
    var filterEmpty = qs('[data-mf-equipo-filter-empty]');

    if (resetPage) equipoPagination.page = 1;

    var pageSizeEl = qs('[data-mf-equipo-page-size]');
    if (pageSizeEl) {
      equipoPagination.pageSize = parseInt(pageSizeEl.value, 10) || 6;
    }

    var matched = sortEquipoRowList(rows.filter(equipoRowMatchesFilters));
    matched.forEach(function (row) {
      if (row.parentNode) row.parentNode.appendChild(row);
    });
    var totalPages = Math.max(1, Math.ceil(matched.length / equipoPagination.pageSize));
    if (equipoPagination.page > totalPages) equipoPagination.page = totalPages;
    if (equipoPagination.page < 1) equipoPagination.page = 1;

    var start = (equipoPagination.page - 1) * equipoPagination.pageSize;
    var end = start + equipoPagination.pageSize;

    rows.forEach(function (row) {
      var idx = matched.indexOf(row);
      var onPage = idx >= 0 && idx >= start && idx < end;
      row.classList.toggle('hidden', !onPage);
    });

    var showFilterEmpty = matched.length === 0 && equipoHasActiveFilters();

    if (tableWrap) tableWrap.classList.toggle('hidden', matched.length === 0);
    if (filterEmpty) filterEmpty.classList.toggle('hidden', !showFilterEmpty);
    updateEquipoPaginationUI(matched.length, totalPages);
  }

  function bindEquipoFilters() {
    var toolbar = qs('[data-mf-equipo-filters]');
    if (!toolbar) return;

    populateEquipoFilterSelects();

    function onFilterChange() {
      applyEquipoFilters(true);
    }

    var pageSizeEl = qs('[data-mf-equipo-page-size]');
    if (pageSizeEl) {
      equipoPagination.pageSize = parseInt(pageSizeEl.value, 10) || 6;
    }

    var search = qs('[data-mf-equipo-search]');
    var gerencia = qs('[data-mf-equipo-filter-gerencia]');
    var area = qs('[data-mf-equipo-filter-area]');
    var familia = qs('[data-mf-equipo-filter-familia]');
    if (search) search.addEventListener('input', onFilterChange);
    if (gerencia) gerencia.addEventListener('change', onFilterChange);
    if (area) area.addEventListener('change', onFilterChange);
    if (familia) familia.addEventListener('change', onFilterChange);
    if (pageSizeEl) pageSizeEl.addEventListener('change', onFilterChange);

    var prev = qs('[data-mf-equipo-page-prev]');
    var next = qs('[data-mf-equipo-page-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        if (equipoPagination.page > 1) {
          equipoPagination.page -= 1;
          applyEquipoFilters(false);
        }
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        equipoPagination.page += 1;
        applyEquipoFilters(false);
      });
    }

    qsa('[data-mf-equipo-filter-clear]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (search) search.value = '';
        if (gerencia) gerencia.value = '';
        if (area) area.value = '';
        if (familia) familia.value = '';
        applyEquipoFilters(true);
        if (search) search.focus();
      });
    });

    qsa('[data-mf-equipo-sort]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setEquipoSort(btn.getAttribute('data-mf-equipo-sort'));
      });
    });

    updateEquipoSortHeaders();
    applyEquipoFilters(true);
  }

  var historialPagination = { page: 1, pageSize: 6 };

  var HISTORIAL_GRUPO_ORDER = ['induccion', 'normativos', 'complementaria', 'malla'];

  /** Demo completion dates when curso is Aprobado (aligned with grupo card estado via sim-bar). */
  var HISTORIAL_FECHA_BY_ID = {
    'IND-1': '12/01/2025', 'IND-2': '14/01/2025', 'IND-3': '15/01/2025', 'IND-4': '17/01/2025',
    'IND-5': '20/01/2025', 'IND-6': '22/01/2025',
    'NOR-1': '18/01/2025', 'NOR-2': '19/01/2025', 'NOR-3': '20/01/2025', 'NOR-4': '24/01/2025',
    'NOR-5': '27/01/2025', 'NOR-6': '28/01/2025', 'NOR-7': '30/01/2025', 'NOR-8': '31/01/2025',
    'COM-1': '22/01/2025', 'COM-2': '23/01/2025', 'COM-3': '25/01/2025', 'COM-4': '26/01/2025',
    'COM-5': '29/01/2025', 'COM-6': '30/01/2025',
    'MLL-1': '05/02/2025', 'MLL-2': '06/02/2025', 'MLL-3': '07/02/2025', 'MLL-4': '10/02/2025',
    'MLL-5': '12/02/2025', 'MLL-6': '14/02/2025', 'MLL-7': '17/02/2025', 'MLL-8': '19/02/2025',
    'MLL-9': '21/02/2025'
  };

  function allMandatoryCourseIds() {
    var ids = [];
    HISTORIAL_GRUPO_ORDER.forEach(function (grupoKey) {
      ids = ids.concat(
        coursesInGrupo(grupoKey).slice().sort(function (a, b) {
          return a.localeCompare(b, 'es', { numeric: true });
        })
      );
    });
    return ids;
  }

  function isHistorialFinalized(id) {
    var key = getCourseEstadoKey(id);
    return key === 'aprobado' || key === 'reprobado';
  }

  /** Mi historial: only courses with a final outcome (not Sin actividad / En proceso). */
  function historialCourseIds() {
    return allMandatoryCourseIds().filter(isHistorialFinalized);
  }

  function historialFechaDisplay(id) {
    if (!isHistorialFinalized(id)) return '—';
    return HISTORIAL_FECHA_BY_ID[id] || '—';
  }

  function historialCertificadoCell(id) {
    var c = COURSES[id];
    if (!c || !isApproved(id)) {
      return '<span class="text-sm text-gray-400">—</span>';
    }
    return '<button type="button" data-mf-historial-certificado class="mf-btn-table" aria-label="Descargar certificado de ' +
      c.title.replace(/"/g, '&quot;') + '">Descargar</button>';
  }

  function buildHistorialRow(id) {
    var c = COURSES[id];
    if (!c) return '';
    var grupo = grupoLabelForCourse(id);
    var estadoKey = getCourseEstadoKey(id);
    return '<tr data-mf-historial-row data-mf-historial-id="' + id + '" data-mf-historial-curso="' + c.title + '" data-mf-historial-grupo="' + grupo + '" data-mf-historial-estado="' + estadoKey + '">' +
      '<td class="px-4 py-3 text-left text-gray-600 whitespace-nowrap tabular-nums font-medium">' + id + '</td>' +
      '<td class="px-4 py-3 text-left font-medium text-gray-900">' + c.title + '</td>' +
      '<td class="px-4 py-3 text-left text-gray-600">' + grupo + '</td>' +
      '<td class="px-4 py-3 text-left"><span class="' + statusChipClass(id) + '">' + statusLabel(id) + '</span></td>' +
      '<td class="px-4 py-3 text-left text-gray-500 whitespace-nowrap">' + historialFechaDisplay(id) + '</td>' +
      '<td class="px-4 py-3 text-left">' + historialCertificadoCell(id) + '</td>' +
      '</tr>';
  }

  function renderHistorialTable() {
    var tbody = qs('[data-mf-historial-tbody]');
    if (!tbody) return;
    tbody.innerHTML = historialCourseIds().map(buildHistorialRow).join('');
    populateHistorialCategoryFilter();
    applyHistorialFilters(true);
  }

  function showPrototypeToast(message) {
    var existing = document.getElementById('mfPrototypeToast');
    if (existing) existing.remove();
    var el = document.createElement('div');
    el.id = 'mfPrototypeToast';
    el.setAttribute('role', 'status');
    el.className = 'fixed bottom-14 left-1/2 -translate-x-1/2 z-[70] max-w-sm rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-lg';
    el.textContent = message;
    document.body.appendChild(el);
    window.setTimeout(function () { el.remove(); }, 3200);
  }

  function populateHistorialCategoryFilter() {
    var select = qs('[data-mf-historial-filter-categoria]');
    if (!select) return;
    var seen = {};
    var categories = [];
    qsa('[data-mf-historial-row]').forEach(function (row) {
      var cat = row.getAttribute('data-mf-historial-grupo') || '';
      if (cat && !seen[cat]) {
        seen[cat] = true;
        categories.push(cat);
      }
    });
    categories.sort();
    var current = select.value;
    select.innerHTML = '<option value="">Todas</option>';
    categories.forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
    if (current && seen[current]) select.value = current;
  }

  function historialRowMatchesFilters(row) {
    var id = (row.getAttribute('data-mf-historial-id') || '').toLowerCase();
    var curso = (row.getAttribute('data-mf-historial-curso') || '').toLowerCase();
    var grupo = row.getAttribute('data-mf-historial-grupo') || '';
    var estado = row.getAttribute('data-mf-historial-estado') || '';
    var searchEl = qs('[data-mf-historial-search]');
    var catEl = qs('[data-mf-historial-filter-categoria]');
    var estadoEl = qs('[data-mf-historial-filter-estado]');
    var query = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var catFilter = catEl ? catEl.value : '';
    var estadoFilter = estadoEl ? estadoEl.value : '';

    if (query && id.indexOf(query) === -1 && curso.indexOf(query) === -1) return false;
    if (catFilter && grupo !== catFilter) return false;
    if (estadoFilter && estado !== estadoFilter) return false;
    return true;
  }

  function updateHistorialPaginationUI(matchedCount, totalPages) {
    var info = qs('[data-mf-historial-page-info]');
    if (info) setText(info, 'Página ' + historialPagination.page + ' de ' + totalPages);

    var prev = qs('[data-mf-historial-page-prev]');
    var next = qs('[data-mf-historial-page-next]');
    if (prev) prev.disabled = historialPagination.page <= 1;
    if (next) next.disabled = historialPagination.page >= totalPages || matchedCount === 0;

    var paginator = qs('[data-mf-historial-pagination]');
    if (paginator) paginator.classList.toggle('hidden', matchedCount === 0);
  }

  function applyHistorialFilters(resetPage) {
    var toolbar = qs('[data-mf-historial-filters]');
    if (!toolbar) return;

    var rows = qsa('[data-mf-historial-row]');
    var tableWrap = qs('[data-mf-historial-table-wrap]');
    var filterEmpty = qs('[data-mf-historial-filter-empty]');
    var catalogEmpty = qs('[data-mf-historial-catalog-empty]');
    var paginator = qs('[data-mf-historial-pagination]');
    var catalogEmptyState = rows.length === 0;

    if (toolbar) toolbar.classList.toggle('hidden', catalogEmptyState);
    if (catalogEmpty) catalogEmpty.classList.toggle('hidden', !catalogEmptyState);
    if (paginator) paginator.classList.toggle('hidden', catalogEmptyState);

    if (resetPage) historialPagination.page = 1;

    var pageSizeEl = qs('[data-mf-historial-page-size]');
    if (pageSizeEl) {
      historialPagination.pageSize = parseInt(pageSizeEl.value, 10) || 6;
    }

    var matched = rows.filter(historialRowMatchesFilters);
    var totalPages = Math.max(1, Math.ceil(matched.length / historialPagination.pageSize));
    if (historialPagination.page > totalPages) historialPagination.page = totalPages;
    if (historialPagination.page < 1) historialPagination.page = 1;

    var start = (historialPagination.page - 1) * historialPagination.pageSize;
    var end = start + historialPagination.pageSize;

    rows.forEach(function (row) {
      var idx = matched.indexOf(row);
      var onPage = idx >= 0 && idx >= start && idx < end;
      row.classList.toggle('hidden', !onPage);
    });

    var searchEl = qs('[data-mf-historial-search]');
    var catEl = qs('[data-mf-historial-filter-categoria]');
    var estadoEl = qs('[data-mf-historial-filter-estado]');
    var hasSearchFilters =
      (searchEl && searchEl.value.trim()) ||
      (catEl && catEl.value) ||
      (estadoEl && estadoEl.value);
    var showFilterEmpty = matched.length === 0 && hasSearchFilters;

    if (tableWrap) tableWrap.classList.toggle('hidden', catalogEmptyState || matched.length === 0);
    if (filterEmpty) filterEmpty.classList.toggle('hidden', catalogEmptyState || !showFilterEmpty);
    updateHistorialPaginationUI(matched.length, totalPages);
  }

  function bindHistorialFilters() {
    var toolbar = qs('[data-mf-historial-filters]');
    if (!toolbar) return;

    function onFilterChange() {
      applyHistorialFilters(true);
    }

    var pageSizeEl = qs('[data-mf-historial-page-size]');
    if (pageSizeEl) {
      historialPagination.pageSize = parseInt(pageSizeEl.value, 10) || 6;
    }

    var search = qs('[data-mf-historial-search]');
    var cat = qs('[data-mf-historial-filter-categoria]');
    var estado = qs('[data-mf-historial-filter-estado]');
    if (search) search.addEventListener('input', onFilterChange);
    if (cat) cat.addEventListener('change', onFilterChange);
    if (estado) estado.addEventListener('change', onFilterChange);
    if (pageSizeEl) pageSizeEl.addEventListener('change', onFilterChange);

    var prev = qs('[data-mf-historial-page-prev]');
    var next = qs('[data-mf-historial-page-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        if (historialPagination.page > 1) {
          historialPagination.page -= 1;
          applyHistorialFilters(false);
        }
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        historialPagination.page += 1;
        applyHistorialFilters(false);
      });
    }

    qsa('[data-mf-historial-filter-clear]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (search) search.value = '';
        if (cat) cat.value = '';
        if (estado) estado.value = '';
        applyHistorialFilters(true);
      });
    });
  }

  function resourceInBibliotecaTab(card, tabFilter) {
    var tabId = card.getAttribute('data-mf-resource-tab') || '';
    return !tabFilter || tabId === tabFilter;
  }

  function resourceMatchesBibliotecaSearchFilters(card) {
    var id = card.getAttribute('data-mf-resource');
    var r = RESOURCES[id];
    var title = r ? r.title : (qs('h3', card) ? qs('h3', card).textContent : '');
    var type = r ? r.type : (card.getAttribute('data-mf-resource-type') || '');

    var searchEl = qs('[data-mf-biblioteca-search]');
    var tipoEl = qs('[data-mf-biblioteca-filter-tipo]');
    var query = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var tipo = tipoEl ? tipoEl.value : '';

    if (query && title.toLowerCase().indexOf(query) === -1) return false;
    if (tipo && type !== tipo) return false;
    return true;
  }

  function updateBibliotecaPaginationUI(matchedCount, totalPages) {
    var info = qs('[data-mf-biblioteca-page-info]');
    if (info) setText(info, 'Página ' + bibliotecaPagination.page + ' de ' + totalPages);

    var prev = qs('[data-mf-biblioteca-page-prev]');
    var next = qs('[data-mf-biblioteca-page-next]');
    if (prev) prev.disabled = bibliotecaPagination.page <= 1;
    if (next) next.disabled = bibliotecaPagination.page >= totalPages || matchedCount === 0;

    var paginator = qs('[data-mf-biblioteca-pagination]');
    if (paginator) paginator.classList.toggle('hidden', matchedCount === 0);
  }

  function applyBibliotecaFilters(resetPage) {
    var cards = qsa('[data-mf-resource]');
    var grid = document.querySelector('[data-testid="resource-grid"]');
    var tabEmpty = document.querySelector('[data-mf-biblioteca-empty]');
    var filterEmpty = document.querySelector('[data-mf-biblioteca-filter-empty]');
    var tabFilter = bibliotecaTabFilter;
    var inTab = 0;
    var matched = [];

    if (resetPage) bibliotecaPagination.page = 1;

    var pageSizeEl = qs('[data-mf-biblioteca-page-size]');
    if (pageSizeEl) {
      bibliotecaPagination.pageSize = parseInt(pageSizeEl.value, 10) || 12;
    }

    cards.forEach(function (card) {
      var matchesTab = resourceInBibliotecaTab(card, tabFilter);
      if (matchesTab) inTab += 1;
      if (matchesTab && resourceMatchesBibliotecaSearchFilters(card)) matched.push(card);
    });

    var totalPages = Math.max(1, Math.ceil(matched.length / bibliotecaPagination.pageSize));
    if (bibliotecaPagination.page > totalPages) bibliotecaPagination.page = totalPages;
    if (bibliotecaPagination.page < 1) bibliotecaPagination.page = 1;

    var start = (bibliotecaPagination.page - 1) * bibliotecaPagination.pageSize;
    var end = start + bibliotecaPagination.pageSize;

    cards.forEach(function (card) {
      var idx = matched.indexOf(card);
      var onPage = idx >= 0 && idx >= start && idx < end;
      card.classList.toggle('hidden', !onPage);
    });

    var hasSearchFilters = false;
    var searchEl = qs('[data-mf-biblioteca-search]');
    var tipoEl = qs('[data-mf-biblioteca-filter-tipo]');
    if (searchEl && searchEl.value.trim()) hasSearchFilters = true;
    if (tipoEl && tipoEl.value) hasSearchFilters = true;

    var showTabEmpty = inTab === 0;
    var showFilterEmpty = inTab > 0 && matched.length === 0 && hasSearchFilters;
    var hideGrid = matched.length === 0;

    if (grid) grid.classList.toggle('hidden', hideGrid);
    if (tabEmpty) tabEmpty.classList.toggle('hidden', !showTabEmpty);
    if (filterEmpty) filterEmpty.classList.toggle('hidden', !showFilterEmpty);
    updateBibliotecaPaginationUI(matched.length, totalPages);
  }

  function bindBibliotecaFilters() {
    var toolbar = qs('[data-mf-biblioteca-filters]');
    if (!toolbar) return;

    function onFilterChange() {
      applyBibliotecaFilters(true);
    }

    var pageSizeEl = qs('[data-mf-biblioteca-page-size]');
    if (pageSizeEl) {
      bibliotecaPagination.pageSize = parseInt(pageSizeEl.value, 10) || 12;
    }

    var search = qs('[data-mf-biblioteca-search]');
    var tipo = qs('[data-mf-biblioteca-filter-tipo]');
    if (search) search.addEventListener('input', onFilterChange);
    if (tipo) tipo.addEventListener('change', onFilterChange);
    if (pageSizeEl) pageSizeEl.addEventListener('change', onFilterChange);

    var prev = qs('[data-mf-biblioteca-page-prev]');
    var next = qs('[data-mf-biblioteca-page-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        if (bibliotecaPagination.page > 1) {
          bibliotecaPagination.page -= 1;
          applyBibliotecaFilters(false);
        }
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        bibliotecaPagination.page += 1;
        applyBibliotecaFilters(false);
      });
    }

    qsa('[data-mf-biblioteca-filter-clear]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (search) search.value = '';
        if (tipo) tipo.value = '';
        applyBibliotecaFilters(true);
        if (search) search.focus();
      });
    });
  }

  function bindBibliotecaTabs() {
    var tablist = document.querySelector('[data-testid="biblioteca-tabs"]');
    if (!tablist) return;
    var tabs = tablist.querySelectorAll('[data-mf-tab-filter]');
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        bibliotecaTabFilter = tab.getAttribute('data-mf-tab-filter') || '';
        tabs.forEach(function (t) {
          var active = t === tab;
          t.setAttribute('aria-selected', String(active));
          t.classList.toggle('border-gray-900', active);
          t.classList.toggle('text-gray-900', active);
          t.classList.toggle('border-transparent', !active);
          t.classList.toggle('text-gray-500', !active);
        });
        applyBibliotecaFilters(true);
      });
    });
    var showAll = document.querySelector('[data-mf-biblioteca-show-all]');
    if (showAll) {
      showAll.addEventListener('click', function () {
        var allTab = tablist.querySelector('[data-mf-tab-filter=""]');
        if (allTab) allTab.click();
      });
    }
    applyBibliotecaFilters();
  }

  var MODAL_CLOCK_SVG = '<svg class="heroicon heroicon-sm shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>';
  var MODAL_X_SVG = '<svg class="heroicon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>';

  function modalDismissButton(closeAttr, extraClass) {
    return '<button type="button" ' + closeAttr + ' class="mf-modal-close mf-btn-icon' + (extraClass ? ' ' + extraClass : '') + '" aria-label="Cerrar">' + MODAL_X_SVG + '</button>';
  }

  function courseModalMarkup() {
    return '<div id="courseModal" data-testid="course-modal" class="course-modal hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="courseModalTitle" tabindex="-1" aria-hidden="true">' +
      '<div data-mf-modal-backdrop class="absolute inset-0 bg-black/50"></div>' +
      '<div class="relative z-10 flex min-h-full items-center justify-center p-4 pointer-events-none">' +
      '<div class="course-modal-panel pointer-events-auto w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">' +
      '<div class="course-modal-cover aspect-video relative bg-gray-200">' +
      '<img data-mf-modal-cover src="" alt="" class="h-full w-full object-cover">' +
      '<span data-mf-modal-lock-badge class="hidden absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-gray-900/85 px-2.5 py-1 text-xs font-medium text-white">' +
      LOCK_SVG_SM + ' Bloqueado</span>' +
      '<button type="button" data-mf-modal-bookmark class="course-bookmark-btn course-modal-bookmark mf-btn-icon absolute left-3 top-3 z-10" aria-label="Guardar curso" aria-pressed="false"></button>' +
      modalDismissButton('data-mf-modal-close', 'course-modal-close absolute right-3 top-3 z-20') +
      '</div>' +
      '<div class="course-modal-body p-5">' +
      '<p data-mf-modal-grupo class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500"></p>' +
      '<div class="mb-3 flex flex-wrap items-center gap-2">' +
      '<span data-mf-modal-categoria class="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"></span>' +
      '<span data-mf-modal-status class="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">Pendiente</span>' +
      '</div>' +
      '<h2 id="courseModalTitle" class="text-xl font-semibold leading-snug text-gray-900"></h2>' +
      '<p class="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500">' + MODAL_CLOCK_SVG +
      '<span data-mf-modal-duration></span></p>' +
      '<p data-mf-modal-desc class="mt-4 border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-600"></p>' +
      '<div data-mf-modal-prereqs class="hidden mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">' +
      '<span class="shrink-0 pt-0.5 text-amber-700" aria-hidden="true">' + LOCK_SVG_SM + '</span>' +
      '<p data-mf-modal-prereqs-text class="min-w-0"></p></div>' +
      '<div class="mt-6">' +
      '<button type="button" data-mf-modal-acceder class="mf-btn-primary w-full">Acceder</button>' +
      '</div></div></div></div></div>';
  }

  function mountCourseModal() {
    var existing = document.getElementById('courseModal');
    if (existing) existing.outerHTML = courseModalMarkup();
    else document.body.insertAdjacentHTML('beforeend', courseModalMarkup());
  }

  function populateCourseModal(id) {
    var c = COURSES[id];
    var modal = document.getElementById('courseModal');
    if (!c || !modal) return;
    var locked = isCourseLocked(id);
    var cover = qs('[data-mf-modal-cover]', modal);
    if (cover) {
      cover.src = courseCoverUrl(id);
      cover.alt = '';
    }
    var lockBadge = qs('[data-mf-modal-lock-badge]', modal);
    if (lockBadge) lockBadge.classList.toggle('hidden', !locked);
    var grupoEl = qs('[data-mf-modal-grupo]', modal);
    if (grupoEl) setText(grupoEl, courseGrupoLabel(id));
    var cat = qs('[data-mf-modal-categoria]', modal);
    if (cat) setText(cat, c.categoria);
    var status = qs('[data-mf-modal-status]', modal);
    if (status) {
      status.className = statusChipClass(id);
      setText(status, statusLabel(id));
    }
    qs('#courseModalTitle', modal) && setText(qs('#courseModalTitle', modal), c.title);
    var dur = qs('[data-mf-modal-duration]', modal);
    if (dur) setText(dur, c.duration);
    var desc = qs('[data-mf-modal-desc]', modal);
    if (desc) setText(desc, c.desc);
    var pre = qs('[data-mf-modal-prereqs]', modal);
    var preText = qs('[data-mf-modal-prereqs-text]', modal);
    if (pre && preText) {
      if (locked && (c.prereqs.length || (c.grupo === 'malla' && !isMallaTabUnlocked(c.mallaSlug, c.tab)))) {
        pre.classList.remove('hidden');
        setText(preText, lockMessage(id));
      } else {
        pre.classList.add('hidden');
        setText(preText, '');
      }
    }
    modal.classList.toggle('course-modal--locked', locked);
    var acc = qs('[data-mf-modal-acceder]', modal);
    if (acc) {
      acc.disabled = locked;
      acc.classList.toggle('opacity-50', locked);
      acc.classList.toggle('cursor-not-allowed', locked);
      acc.setAttribute('title', locked ? lockMessage(id) : '');
    }
    updateModalBookmark();
  }

  function openCourseModal(id) {
    if (!COURSES[id] || !document.getElementById('courseModal')) return;
    modalCourseId = id;
    recordRecentView(id);
    populateCourseModal(id);
    var modal = document.getElementById('courseModal');
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    modal.focus();
  }

  function closeCourseModal() {
    var modal = document.getElementById('courseModal');
    if (!modal) return;
    modalCourseId = null;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (modalTrigger) modalTrigger.focus();
  }

  var EQUIPO_MODAL_COURSE_IDS = Object.keys(COURSES);

  var equipoModalMemberId = null;
  var equipoModalPagination = { page: 1, pageSize: 6 };
  var equipoModalSort = { key: 'curso', dir: 'asc' };

  var EQUIPO_MODAL_SORT_ATTR = {
    id: 'data-mf-equipo-modal-id',
    curso: 'data-mf-equipo-modal-curso',
    categoria: 'data-mf-equipo-modal-categoria',
    estado: 'data-mf-equipo-modal-estado'
  };

  var MEMBER_ESTADO_LABELS = {
    aprobado: 'Aprobado',
    'en-proceso': 'En proceso',
    pendiente: 'Pendiente',
    reprobado: 'Reprobado'
  };

  function memberInitials(nombre) {
    var parts = (nombre || '').trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return (parts[0] || '?').slice(0, 2).toUpperCase();
  }

  function memberAvatarUrl(member) {
    var initials = member ? memberInitials(member.nombre) : '?';
    return 'https://placehold.co/80x80/e4e4e7/71717a?text=' + encodeURIComponent(initials);
  }

  function grupoLabelForCourse(id) {
    var c = COURSES[id];
    if (!c) return '';
    var g = GRUPOS[c.grupo];
    return g ? g.label : '';
  }

  function isMemberApproved(member, id) {
    return member && member.approved && member.approved.indexOf(id) >= 0;
  }

  function memberCourseEstadoKey(member, id) {
    if (!member) return 'pendiente';
    if (isMemberApproved(member, id)) return 'aprobado';
    if (member.reprobado && member.reprobado.indexOf(id) >= 0) return 'reprobado';
    if (member.enProceso && member.enProceso.indexOf(id) >= 0) return 'en-proceso';
    return 'pendiente';
  }

  function memberStatusChipHtml(estadoKey) {
    var label = MEMBER_ESTADO_LABELS[estadoKey] || 'Pendiente';
    var base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';
    var cls = base + ' bg-gray-100 text-gray-700';
    if (estadoKey === 'aprobado') cls = base + ' bg-green-100 text-green-800';
    else if (estadoKey === 'reprobado') cls = base + ' bg-red-100 text-red-800';
    else if (estadoKey === 'en-proceso') cls = base + ' bg-amber-100 text-amber-800';
    return '<span class="' + cls + '">' + label + '</span>';
  }

  function renderEquipoModalProfile(member) {
    var modal = document.getElementById('equipoModal');
    if (!modal) return;
    var container = qs('[data-mf-equipo-modal-profile]', modal);
    if (!member) {
      var nameEl = container && qs('[data-mf-profile-name]', container);
      if (nameEl) setText(nameEl, 'Colaborador');
      return;
    }
    var pct = memberProgressPercent(member);
    renderProfileSummary(container, member);
    renderProfileStats(container, memberHistorialCounts(member), pct);
  }

  function buildEquipoModalCourseRow(member, id) {
    var c = COURSES[id];
    if (!c) return '';
    var categoria = grupoLabelForCourse(id);
    var estadoKey = memberCourseEstadoKey(member, id);
    return '<tr data-mf-equipo-modal-row data-mf-equipo-modal-id="' + id + '" data-mf-equipo-modal-curso="' + c.title + '" data-mf-equipo-modal-categoria="' + categoria + '" data-mf-equipo-modal-estado="' + estadoKey + '">' +
      '<td class="px-4 py-3 text-left text-gray-600 whitespace-nowrap tabular-nums font-medium">' + id + '</td>' +
      '<td class="px-4 py-3 text-left text-gray-900">' + c.title + '</td>' +
      '<td class="px-4 py-3 text-left text-gray-600">' + categoria + '</td>' +
      '<td class="px-4 py-3 text-center">' + memberStatusChipHtml(estadoKey) + '</td>' +
      '</tr>';
  }

  function renderEquipoModalTable(member) {
    var modal = document.getElementById('equipoModal');
    if (!modal) return;
    var tbody = qs('[data-mf-equipo-modal-tbody]', modal);
    if (!tbody) return;
    tbody.innerHTML = EQUIPO_MODAL_COURSE_IDS.map(function (id) {
      return buildEquipoModalCourseRow(member, id);
    }).join('');
    reorderEquipoModalRows();
    updateEquipoModalSortHeaders();
    applyEquipoModalFilters(true);
  }

  function equipoModalSortValue(row, key) {
    var attr = EQUIPO_MODAL_SORT_ATTR[key];
    return attr ? (row.getAttribute(attr) || '').toLowerCase() : '';
  }

  function compareEquipoModalRows(a, b) {
    var va = equipoModalSortValue(a, equipoModalSort.key);
    var vb = equipoModalSortValue(b, equipoModalSort.key);
    var cmp = String(va).localeCompare(String(vb), 'es', { sensitivity: 'base' });
    return equipoModalSort.dir === 'asc' ? cmp : -cmp;
  }

  function sortEquipoModalRowList(rows) {
    return rows.slice().sort(compareEquipoModalRows);
  }

  function reorderEquipoModalRows() {
    var modal = document.getElementById('equipoModal');
    if (!modal) return;
    var tbody = qs('[data-mf-equipo-modal-tbody]', modal);
    if (!tbody) return;
    var rows = qsa('[data-mf-equipo-modal-row]', tbody);
    sortEquipoModalRowList(rows).forEach(function (row) {
      tbody.appendChild(row);
    });
  }

  function updateEquipoModalSortHeaders() {
    var modal = document.getElementById('equipoModal');
    if (!modal) return;
    qsa('[data-mf-equipo-modal-sort]', modal).forEach(function (btn) {
      var key = btn.getAttribute('data-mf-equipo-modal-sort');
      var active = key === equipoModalSort.key;
      var th = btn.closest('th');
      if (th) {
        th.setAttribute('aria-sort', active ? (equipoModalSort.dir === 'asc' ? 'ascending' : 'descending') : 'none');
      }
      btn.classList.toggle('mf-table-sort-btn--active', active);
      btn.setAttribute('aria-pressed', String(active));
      var iconUp = btn.querySelector('[data-mf-equipo-modal-sort-up]');
      var iconDown = btn.querySelector('[data-mf-equipo-modal-sort-down]');
      if (iconUp) {
        iconUp.classList.toggle('hidden', active && equipoModalSort.dir !== 'asc');
        iconUp.classList.toggle('opacity-40', !active || equipoModalSort.dir !== 'asc');
      }
      if (iconDown) {
        iconDown.classList.toggle('hidden', active && equipoModalSort.dir !== 'desc');
        iconDown.classList.toggle('opacity-40', !active || equipoModalSort.dir !== 'desc');
      }
    });
  }

  function setEquipoModalSort(key) {
    if (equipoModalSort.key === key) {
      equipoModalSort.dir = equipoModalSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      equipoModalSort.key = key;
      equipoModalSort.dir = 'asc';
    }
    reorderEquipoModalRows();
    updateEquipoModalSortHeaders();
    applyEquipoModalFilters(true);
  }

  function equipoModalRowMatchesFilters(row) {
    var id = (row.getAttribute('data-mf-equipo-modal-id') || '').toLowerCase();
    var curso = (row.getAttribute('data-mf-equipo-modal-curso') || '').toLowerCase();
    var categoria = row.getAttribute('data-mf-equipo-modal-categoria') || '';
    var estado = row.getAttribute('data-mf-equipo-modal-estado') || '';
    var modal = document.getElementById('equipoModal');
    if (!modal) return true;
    var searchEl = qs('[data-mf-equipo-modal-search]', modal);
    var catEl = qs('[data-mf-equipo-modal-filter-categoria]', modal);
    var estadoEl = qs('[data-mf-equipo-modal-filter-estado]', modal);
    var query = searchEl ? searchEl.value.trim().toLowerCase() : '';
    var catFilter = catEl ? catEl.value : '';
    var estadoFilter = estadoEl ? estadoEl.value : '';

    if (query && id.indexOf(query) === -1 && curso.indexOf(query) === -1) return false;
    if (catFilter && categoria !== catFilter) return false;
    if (estadoFilter && estado !== estadoFilter) return false;
    return true;
  }

  function equipoModalHasActiveFilters() {
    var modal = document.getElementById('equipoModal');
    if (!modal) return false;
    var searchEl = qs('[data-mf-equipo-modal-search]', modal);
    var catEl = qs('[data-mf-equipo-modal-filter-categoria]', modal);
    var estadoEl = qs('[data-mf-equipo-modal-filter-estado]', modal);
    return (searchEl && searchEl.value.trim()) ||
      (catEl && catEl.value) ||
      (estadoEl && estadoEl.value);
  }

  function resetEquipoModalFilters() {
    var modal = document.getElementById('equipoModal');
    if (!modal) return;
    var searchEl = qs('[data-mf-equipo-modal-search]', modal);
    var catEl = qs('[data-mf-equipo-modal-filter-categoria]', modal);
    var estadoEl = qs('[data-mf-equipo-modal-filter-estado]', modal);
    if (searchEl) searchEl.value = '';
    if (catEl) catEl.value = '';
    if (estadoEl) estadoEl.value = '';
  }

  function updateEquipoModalPaginationUI(matchedCount, totalPages) {
    var modal = document.getElementById('equipoModal');
    if (!modal) return;
    var info = qs('[data-mf-equipo-modal-page-info]', modal);
    if (info) setText(info, 'Página ' + equipoModalPagination.page + ' de ' + totalPages);

    var prev = qs('[data-mf-equipo-modal-page-prev]', modal);
    var next = qs('[data-mf-equipo-modal-page-next]', modal);
    if (prev) prev.disabled = equipoModalPagination.page <= 1;
    if (next) next.disabled = equipoModalPagination.page >= totalPages || matchedCount === 0;

    var paginator = qs('[data-mf-equipo-modal-pagination]', modal);
    if (paginator) paginator.classList.toggle('hidden', matchedCount === 0);
  }

  function applyEquipoModalFilters(resetPage) {
    var modal = document.getElementById('equipoModal');
    if (!modal) return;

    var rows = qsa('[data-mf-equipo-modal-row]', modal);
    var tableWrap = qs('[data-mf-equipo-modal-table-wrap]', modal);
    var filterEmpty = qs('[data-mf-equipo-modal-filter-empty]', modal);

    if (resetPage) equipoModalPagination.page = 1;

    var pageSizeEl = qs('[data-mf-equipo-modal-page-size]', modal);
    if (pageSizeEl) {
      equipoModalPagination.pageSize = parseInt(pageSizeEl.value, 10) || 6;
    }

    var matched = sortEquipoModalRowList(rows.filter(equipoModalRowMatchesFilters));
    matched.forEach(function (row) {
      if (row.parentNode) row.parentNode.appendChild(row);
    });

    var totalPages = Math.max(1, Math.ceil(matched.length / equipoModalPagination.pageSize));
    if (equipoModalPagination.page > totalPages) equipoModalPagination.page = totalPages;
    if (equipoModalPagination.page < 1) equipoModalPagination.page = 1;

    var start = (equipoModalPagination.page - 1) * equipoModalPagination.pageSize;
    var end = start + equipoModalPagination.pageSize;

    rows.forEach(function (row) {
      var idx = matched.indexOf(row);
      var onPage = idx >= 0 && idx >= start && idx < end;
      row.classList.toggle('hidden', !onPage);
    });

    var showFilterEmpty = matched.length === 0 && equipoModalHasActiveFilters();

    if (tableWrap) tableWrap.classList.toggle('hidden', matched.length === 0);
    if (filterEmpty) filterEmpty.classList.toggle('hidden', !showFilterEmpty);
    updateEquipoModalPaginationUI(matched.length, totalPages);
  }

  function bindEquipoModalFilters() {
    var modal = document.getElementById('equipoModal');
    if (!modal) return;

    function onFilterChange() {
      applyEquipoModalFilters(true);
    }

    var search = qs('[data-mf-equipo-modal-search]', modal);
    var categoria = qs('[data-mf-equipo-modal-filter-categoria]', modal);
    var estado = qs('[data-mf-equipo-modal-filter-estado]', modal);
    var pageSizeEl = qs('[data-mf-equipo-modal-page-size]', modal);

    if (search) search.addEventListener('input', onFilterChange);
    if (categoria) categoria.addEventListener('change', onFilterChange);
    if (estado) estado.addEventListener('change', onFilterChange);
    if (pageSizeEl) pageSizeEl.addEventListener('change', onFilterChange);

    var prev = qs('[data-mf-equipo-modal-page-prev]', modal);
    var next = qs('[data-mf-equipo-modal-page-next]', modal);
    if (prev) {
      prev.addEventListener('click', function () {
        if (equipoModalPagination.page > 1) {
          equipoModalPagination.page -= 1;
          applyEquipoModalFilters(false);
        }
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        equipoModalPagination.page += 1;
        applyEquipoModalFilters(false);
      });
    }

    qsa('[data-mf-equipo-modal-filter-clear]', modal).forEach(function (btn) {
      btn.addEventListener('click', function () {
        resetEquipoModalFilters();
        applyEquipoModalFilters(true);
        if (search) search.focus();
      });
    });

    qsa('[data-mf-equipo-modal-sort]', modal).forEach(function (btn) {
      btn.addEventListener('click', function () {
        setEquipoModalSort(btn.getAttribute('data-mf-equipo-modal-sort'));
      });
    });
  }

  function openEquipoModal(memberId) {
    var modal = document.getElementById('equipoModal');
    if (!modal) return;
    var member = equipoMemberById(memberId);
    equipoModalMemberId = memberId;
    equipoModalSort = { key: 'curso', dir: 'asc' };
    equipoModalPagination = { page: 1, pageSize: 6 };

    var memberName = member ? member.nombre : 'Colaborador';
    var title = qs('[data-mf-equipo-modal-title]', modal);
    if (title) setText(title, 'Cursos de ' + memberName);

    resetEquipoModalFilters();
    var pageSizeEl = qs('[data-mf-equipo-modal-page-size]', modal);
    if (pageSizeEl) pageSizeEl.value = '6';

    renderEquipoModalProfile(member);
    renderEquipoModalTable(member);

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    modal.focus();
  }

  function closeEquipoModal() {
    var modal = document.getElementById('equipoModal');
    if (!modal) return;
    equipoModalMemberId = null;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  function toggleNotifMenu() {
    var d = document.getElementById('notifDropdown');
    var btn = document.getElementById('notifBtn');
    if (!d) return;
    var open = d.classList.contains('hidden');
    d.classList.toggle('hidden', !open);
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  /* ── Events ──────────────────────────────────────────────────────────── */

  function bindSimBar() {
    qsa('[data-mf-progress]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLevel(btn.getAttribute('data-mf-progress'));
      });
    });
  }

  function bindGlobal() {
    document.addEventListener('click', function (e) {
      var notifWrap = document.getElementById('notifWrapper');
      var notifDrop = document.getElementById('notifDropdown');
      if (notifWrap && notifDrop && !notifWrap.contains(e.target)) {
        notifDrop.classList.add('hidden');
        var nb = document.getElementById('notifBtn');
        if (nb) nb.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', function (e) {
      var ver = e.target.closest('[data-mf-ver-mas]');
      if (ver) {
        e.preventDefault();
        modalTrigger = ver;
        var card = ver.closest('[data-mf-course]');
        var id = ver.getAttribute('data-mf-modal-course') || (card && card.getAttribute('data-mf-course'));
        if (id) openCourseModal(id);
      }
      var accLink = e.target.closest('[data-mf-acceder]');
      if (accLink && !accLink.disabled) {
        var accCard = accLink.closest('[data-mf-course]');
        var accId = accCard && accCard.getAttribute('data-mf-course');
        if (accId) {
          recordRecentView(accId);
          if (accLink.tagName === 'BUTTON' && !isCourseLocked(accId)) {
            e.preventDefault();
            window.location.href = courseGrupoPage(accId);
          }
        }
      }
      var modalAcc = e.target.closest('[data-mf-modal-acceder]');
      if (modalAcc && modalCourseId) {
        recordRecentView(modalCourseId);
        if (!isCourseLocked(modalCourseId)) {
          window.location.href = courseGrupoPage(modalCourseId);
        }
      }
      var resVer = e.target.closest('[data-mf-resource-ver]');
      if (resVer) {
        e.preventDefault();
        resourceModalTrigger = resVer;
        var resId = resVer.getAttribute('data-mf-resource-id') || (resVer.closest('[data-mf-resource]') && resVer.closest('[data-mf-resource]').getAttribute('data-mf-resource'));
        if (resId) openResourceModal(resId);
      }
      if (e.target.closest('[data-mf-resource-modal-close]')) {
        closeResourceModal();
      }
      if (e.target.closest('[data-mf-modal-close]')) {
        closeCourseModal();
        closeEquipoModal();
      }
      if (e.target.closest('[data-mf-congrats-dismiss]')) {
        dismissCongrats();
      }
      if (e.target.closest('[data-mf-equipo-ver]')) {
        e.preventDefault();
        var row = e.target.closest('[data-mf-equipo-row]');
        var memberId = row ? row.getAttribute('data-mf-member-id') : '';
        openEquipoModal(memberId);
      }
      var bookmarkBtn = e.target.closest('[data-mf-bookmark]');
      if (bookmarkBtn) {
        e.preventDefault();
        e.stopPropagation();
        var bid = bookmarkBtn.getAttribute('data-mf-bookmark');
        if (bid) toggleBookmark(bid);
      }
      var histCert = e.target.closest('[data-mf-historial-certificado]');
      if (histCert) {
        e.preventDefault();
        var histRow = histCert.closest('[data-mf-historial-row]');
        var histId = histRow ? histRow.getAttribute('data-mf-historial-id') : '';
        var histCurso = histRow ? histRow.getAttribute('data-mf-historial-curso') : '';
        showPrototypeToast(
          'Descarga de certificado iniciada' +
            (histId ? ' (' + histId + ')' : '') +
            (histCurso ? ': ' + histCurso + '.' : '.') +
            ' En producción: archivo desde el LMS.'
        );
      }
    });

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-mf-accordion-trigger]');
      if (trigger) toggleMallaAccordion(trigger);
    });

    qsa('[data-mf-malla-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchMallaTab(btn.getAttribute('data-mf-malla-tab'));
      });
    });

    var congratsDismiss = qs('[data-mf-congrats-dismiss]');
    if (congratsDismiss) {
      congratsDismiss.addEventListener('click', dismissCongrats);
    }
  }

  window.toggleNotifMenu = toggleNotifMenu;
  window.mfCloseCourseModal = closeCourseModal;
  window.mfCloseEquipoModal = closeEquipoModal;
  window.mfCloseResourceModal = closeResourceModal;

  document.addEventListener('DOMContentLoaded', function () {
    mountCourseModal();
    if (!initGrupoPage()) return;
    if (!initMallaPage()) return;
    bindSimBar();
    bindGlobal();
    bindRecentCarousel();
    bindMisCursosCarousels();
    bindBibliotecaTabs();
    bindBibliotecaFilters();
    bindGrupoFilters();
    bindEquipoFilters();
    bindEquipoModalFilters();
    bindHistorialFilters();
    bindBookmarksFilters();
    applyAll();
  });
})();
