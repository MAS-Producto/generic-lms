/**
 * Mi Formación — prototype-wide progress simulation (localStorage: mf-progress)
 * Values: "0" | "45" | "100"
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mf-progress';
  var CONGRATS_KEY = 'mf-congrats-seen';
  var RECENT_KEY = 'mf-recent-courses';
  var RECENT_MAX = 8;
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

  var GRUPOS = {
    induccion: { total: 6, page: 'induccion.html', label: 'Inducción' },
    normativos: { total: 8, page: 'cursos-normativos.html', label: 'Cursos Normativos' },
    complementaria: { total: 6, page: 'formacion-complementaria.html', label: 'Formación complementaria' },
    malla: { total: 9, page: 'mallas.html', label: 'Mallas' }
  };

  var MALLA_TABS = ['fundamentos', 'desarrollo', 'liderazgo', 'evaluacion'];

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

    'MLL-1': { grupo: 'malla', tab: 'fundamentos', title: 'Liderazgo personal', categoria: 'Fundamentos', duration: '2 h', prereqs: [], desc: 'Autoconocimiento y estilo de liderazgo personal.' },
    'MLL-2': { grupo: 'malla', tab: 'fundamentos', title: 'Comunicación asertiva', categoria: 'Fundamentos', duration: '1,5 h', prereqs: ['MLL-1'], desc: 'Comunicación clara y asertiva para líderes.' },
    'MLL-3': { grupo: 'malla', tab: 'fundamentos', title: 'Gestión del cambio', categoria: 'Fundamentos', duration: '1,5 h', prereqs: ['MLL-1'], desc: 'Gestión del cambio en equipos y organizaciones.' },
    'MLL-4': { grupo: 'malla', tab: 'fundamentos', title: 'Toma de decisiones', categoria: 'Fundamentos', duration: '2 h', prereqs: ['MLL-2', 'MLL-3'], desc: 'Marco para decisiones efectivas en liderazgo.' },
    'MLL-5': { grupo: 'malla', tab: 'desarrollo', title: 'Coaching para líderes', categoria: 'Desarrollo', duration: '2 h', prereqs: [], desc: 'Técnicas de coaching aplicadas al liderazgo.' },
    'MLL-6': { grupo: 'malla', tab: 'desarrollo', title: 'Gestión de equipos remotos', categoria: 'Desarrollo', duration: '1,5 h', prereqs: ['MLL-5'], desc: 'Liderazgo de equipos distribuidos y remotos.' },
    'MLL-7': { grupo: 'malla', tab: 'liderazgo', title: 'Negociación avanzada', categoria: 'Liderazgo', duration: '2 h', prereqs: [], desc: 'Negociación estratégica para mandos medios.' },
    'MLL-8': { grupo: 'malla', tab: 'liderazgo', title: 'Planificación estratégica', categoria: 'Liderazgo', duration: '2,5 h', prereqs: [], desc: 'Planificación y ejecución estratégica.' },
    'MLL-9': { grupo: 'malla', tab: 'evaluacion', title: 'Evaluación final — Malla Líder', categoria: 'Evaluación', duration: '1 h', prereqs: [], desc: 'Evaluación integradora de la Malla Líder — Ruta 2025.' }
  };

  var APPROVED_BY_LEVEL = {
    '0': [],
    '45': [
      'IND-1', 'IND-2', 'IND-3', 'IND-4',
      'NOR-1', 'NOR-2', 'NOR-3', 'NOR-4',
      'COM-1',
      'MLL-1', 'MLL-2', 'MLL-3', 'MLL-4'
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
        if (c.grupo === 'malla' && !wouldMallaTabUnlockAtLevel(c.tab, level, approved)) return true;
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

  function wouldMallaTabUnlockAtLevel(tab, level, approvedSet) {
    if (tab === 'fundamentos') return true;
    var upstream = MALLA_TAB_UPSTREAM[tab];
    if (!upstream) return true;
    var ids = coursesInMallaTab(upstream);
    return ids.length > 0 && ids.every(function (id) { return approvedSet.has(id); });
  }

  sanitizeProgressFixtures();

  var ESTADO_LABELS = {
    'sin-actividad': 'Sin actividad',
    'en-proceso': 'En proceso',
    aprobado: 'Aprobado',
    reprobado: 'Reprobado'
  };

  var MALLA_TAB_UPSTREAM = {
    desarrollo: 'fundamentos',
    liderazgo: 'desarrollo',
    evaluacion: 'desarrollo'
  };

  var MALLA_TAB_LABELS = {
    fundamentos: 'Fundamentos',
    desarrollo: 'Desarrollo',
    liderazgo: 'Liderazgo',
    evaluacion: 'Evaluación'
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

  function coursesInMallaTab(tab) {
    return Object.keys(COURSES).filter(function (id) {
      var c = COURSES[id];
      return c.grupo === 'malla' && c.tab === tab;
    });
  }

  function isTabComplete(tab) {
    var ids = coursesInMallaTab(tab);
    return ids.length > 0 && ids.every(function (id) { return isApproved(id); });
  }

  function isMallaTabUnlocked(tab) {
    if (tab === 'fundamentos') return true;
    var upstream = MALLA_TAB_UPSTREAM[tab];
    if (!upstream) return true;
    return isTabComplete(upstream);
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
    if (c.noLock) return false;
    if (isCourseEngaged(id)) return false;
    if (c.grupo === 'malla' && !isMallaTabUnlocked(c.tab)) return true;
    if (!c.prereqs || !c.prereqs.length) return false;
    return c.prereqs.some(function (p) { return !isApproved(p); });
  }

  function countApprovedInGrupo(grupoKey) {
    return coursesInGrupo(grupoKey).filter(function (id) { return isApproved(id); }).length;
  }

  function totalMandatory() {
    return 29;
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
    if (level === '100') return 'Completaste tu formación obligatoria.';
    if (level === '0') return 'Bienvenido a tu espacio de formación. Completa Inducción, Cursos Normativos, Formación complementaria y tu Malla para cumplir tu ruta obligatoria.';
    return 'Continúa tu formación obligatoria.';
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

  function getGrupoKeyForPage() {
    var page = document.body.getAttribute('data-mf-page');
    var map = { induccion: 'induccion', normativos: 'normativos', complementaria: 'complementaria' };
    return map[page] || null;
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
    if (c.grupo === 'malla') return GRUPOS.malla.label;
    return GRUPOS[c.grupo] ? GRUPOS[c.grupo].label : '';
  }

  function courseGrupoPage(id) {
    var c = COURSES[id];
    if (!c) return 'inicio.html';
    if (c.grupo === 'malla') return GRUPOS.malla.page;
    return GRUPOS[c.grupo] ? GRUPOS[c.grupo].page : 'inicio.html';
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
        var page = c.grupo === 'malla' ? GRUPOS.malla.page : GRUPOS[c.grupo].page;
        var grupo = c.grupo === 'malla' ? GRUPOS.malla.label : GRUPOS[c.grupo].label;
        items.push({ id: id, title: c.title, page: page, grupo: grupo });
      }
    });
    return items.slice(0, 8);
  }

  function lockMessage(id) {
    var c = COURSES[id];
    if (!c) return '';
    if (c.grupo === 'malla' && !isMallaTabUnlocked(c.tab)) {
      var up = MALLA_TAB_UPSTREAM[c.tab];
      return 'Completa todos los cursos de ' + (MALLA_TAB_LABELS[up] || up) + ' para desbloquear esta sección.';
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
      induccion: ['navInduccion', 'mobNavInduccion'],
      normativos: ['navNormativos', 'mobNavNormativos'],
      complementaria: ['navComplementaria', 'mobNavComplementaria'],
      mallas: ['navMallas', 'mobNavMallas'],
      biblioteca: ['navBiblioteca', 'mobNavBiblioteca'],
      perfil: ['navPerfil', 'mobNavPerfil'],
      equipo: ['navEquipo', 'mobNavEquipo']
    };
    var activeIds = map[page] || [];
    qsa('[data-mf-nav]').forEach(function (link) {
      var on = activeIds.indexOf(link.id) >= 0;
      link.classList.toggle('bg-sidebar-accent', on);
      link.classList.toggle('text-sidebar-foreground', on);
      link.classList.toggle('font-medium', on);
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

  function updateTileBars() {
    ['induccion', 'normativos', 'complementaria', 'malla'].forEach(function (gk) {
      var bar = qs('[data-mf-tile-bar="' + gk + '"]');
      if (!bar) return;
      var g = GRUPOS[gk];
      var pct = g.total ? Math.round((countApprovedInGrupo(gk) / g.total) * 100) : 0;
      bar.style.width = pct + '%';
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

    ['induccion', 'normativos', 'complementaria', 'malla'].forEach(function (gk) {
      var tileCount = qs('[data-mf-tile-count="' + gk + '"]');
      if (tileCount) {
        var g = GRUPOS[gk];
        setText(tileCount, countApprovedInGrupo(gk) + ' de ' + g.total);
      }
      var tileChip = qs('[data-mf-tile-chip="' + gk + '"]');
      if (tileChip) {
        tileChip.className = tileChipClass(gk);
        setText(tileChip, tileChipLabel(gk));
      }
    });

    updateTileBars();
    updateMallaTileRows();
    updateCongrats();
  }

  function updateMallaTileRows() {
    var container = qs('[data-mf-malla-tile-rows]');
    if (!container) return;
    var rows = MALLA_TABS.map(function (tab) {
      var done = countApprovedInMallaTab(tab);
      var total = coursesInMallaTab(tab).length;
      var label = MALLA_TAB_LABELS[tab];
      return '<div class="flex justify-between text-sm py-1"><span class="text-gray-600">' + label + '</span><span class="font-medium text-gray-900">' + done + ' de ' + total + '</span></div>';
    }).join('');
    container.innerHTML = rows;
  }

  function countApprovedInMallaTab(tab) {
    return coursesInMallaTab(tab).filter(function (id) { return isApproved(id); }).length;
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
    });
  }

  function updateMallaTabs() {
    var activeTab = document.querySelector('[data-mf-malla-tab].malla-tab-active');
    var activeId = activeTab ? activeTab.getAttribute('data-mf-malla-tab') : 'fundamentos';

    qsa('[data-mf-malla-tab]').forEach(function (btn) {
      var tab = btn.getAttribute('data-mf-malla-tab');
      var unlocked = isMallaTabUnlocked(tab);
      var lockIcon = btn.querySelector('[data-mf-tab-lock]');
      if (lockIcon) lockIcon.classList.toggle('hidden', unlocked);
      btn.disabled = !unlocked;
      btn.classList.toggle('opacity-50', !unlocked);
      btn.classList.toggle('cursor-not-allowed', !unlocked);
      btn.setAttribute('aria-disabled', unlocked ? 'false' : 'true');
      if (!unlocked && tab === activeId) {
        activeId = 'fundamentos';
      }
    });

    if (!isMallaTabUnlocked(activeId)) activeId = 'fundamentos';
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

  function updateInsignias() {
    qsa('[data-mf-insignia]').forEach(function (el) {
      var gk = el.getAttribute('data-mf-insignia');
      var done = grupoComplete(gk);
      el.classList.toggle('opacity-40', !done);
      el.classList.toggle('grayscale', !done);
      var lock = el.querySelector('[data-mf-insignia-lock]');
      if (lock) lock.classList.toggle('hidden', done);
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
    updateMallaTabs();
    updateNotifications();
    updateInsignias();
    renderPerfilProfile();
    renderHistorialTable();
    updateRecentCarousel();
    applyGrupoCourseFilters(true);
    applyEquipoFilters(true);
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

  var MEMBER_PROGRESS_RING_R = 42;
  var MEMBER_PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * MEMBER_PROGRESS_RING_R;

  function memberAvanceBarHtml(pct) {
    return '<div class="flex items-center gap-2 min-w-[8.5rem]">' +
      '<div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Avance general ' + pct + '%">' +
      '<div data-mf-equipo-avance-bar class="inicio-progress-fill h-full rounded-full transition-all" style="width:' + pct + '%"></div></div>' +
      '<span data-mf-equipo-avance-pct class="text-xs font-medium text-gray-700 tabular-nums w-10 text-right shrink-0">' + pct + '%</span></div>';
  }

  function profileAvanceDoughnutHtml(pct) {
    var offset = MEMBER_PROGRESS_RING_CIRCUMFERENCE * (1 - pct / 100);
    return '<div class="relative w-[4.5rem] h-[4.5rem]" role="img" aria-label="Avance general ' + pct + '%">' +
      '<svg class="w-full h-full -rotate-90" viewBox="0 0 100 100" focusable="false" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="' + MEMBER_PROGRESS_RING_R + '" fill="none" stroke="#e4e4e7" stroke-width="8"></circle>' +
      '<circle data-mf-profile-progress-ring cx="50" cy="50" r="' + MEMBER_PROGRESS_RING_R + '" fill="none" stroke="var(--brand-primary)" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + MEMBER_PROGRESS_RING_CIRCUMFERENCE.toFixed(2) + '" stroke-dashoffset="' + offset.toFixed(2) + '"></circle>' +
      '</svg>' +
      '<span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900 tabular-nums">' + pct + '%</span>' +
      '</div>';
  }

  function renderProfileSummary(container, profile, pct) {
    if (!container || !profile) return;
    var avatar = qs('[data-mf-profile-avatar]', container);
    var nameEl = qs('[data-mf-profile-name]', container);
    var rutEl = qs('[data-mf-profile-rut]', container);
    var cargoEl = qs('[data-mf-profile-cargo]', container);
    var orgEl = qs('[data-mf-profile-org]', container);
    var avanceEl = qs('[data-mf-profile-avance]', container);
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
    if (avanceEl) {
      avanceEl.innerHTML = profileAvanceDoughnutHtml(pct);
    }
  }

  function renderPerfilProfile() {
    var container = qs('[data-mf-perfil-profile]');
    if (!container) return;
    renderProfileSummary(container, CURRENT_USER, progressPercent());
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

  function openCourseModal(id) {
    var c = COURSES[id];
    var modal = document.getElementById('courseModal');
    if (!c || !modal) return;
    modalCourseId = id;
    recordRecentView(id);
    var locked = isCourseLocked(id);
    qs('#courseModalTitle', modal) && setText(qs('#courseModalTitle', modal), c.title);
    var cat = qs('[data-mf-modal-categoria]', modal);
    var dur = qs('[data-mf-modal-duration]', modal);
    var desc = qs('[data-mf-modal-desc]', modal);
    var pre = qs('[data-mf-modal-prereqs]', modal);
    if (cat) setText(cat, c.categoria);
    if (dur) setText(dur, c.duration);
    if (desc) setText(desc, c.desc);
    if (pre) {
      if (locked && (c.prereqs.length || (c.grupo === 'malla' && !isMallaTabUnlocked(c.tab)))) {
        pre.classList.remove('hidden');
        setText(pre, lockMessage(id));
      } else {
        pre.classList.add('hidden');
        setText(pre, '');
      }
    }
    var acc = qs('[data-mf-modal-acceder]', modal);
    if (acc) {
      acc.disabled = locked;
      acc.classList.toggle('opacity-50', locked);
      acc.classList.toggle('cursor-not-allowed', locked);
    }
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
    renderProfileSummary(container, member, memberProgressPercent(member));
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
      if (e.target.closest('[data-mf-resource-modal-close]') || e.target.closest('[data-mf-resource-modal-backdrop]')) {
        closeResourceModal();
      }
      if (e.target.closest('[data-mf-modal-close]') || e.target.closest('[data-mf-modal-backdrop]')) {
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

    qsa('[data-mf-malla-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
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
    bindSimBar();
    bindGlobal();
    bindRecentCarousel();
    bindBibliotecaTabs();
    bindBibliotecaFilters();
    bindGrupoFilters();
    bindEquipoFilters();
    bindEquipoModalFilters();
    bindHistorialFilters();
    applyAll();
  });
})();
