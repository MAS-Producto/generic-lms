/**
 * new-app-moodle — Prototype JS
 * Stack: Tailwind CSS CDN + Heroicons (inline SVG — https://heroicons.com/)
 *
 * This file is copied to js/app.js in the product root by prototype-assembler.
 * Contains: Tailwind mobile menu, user dropdown, desktop sidebar collapse.
 *
 * Icons: paste outline SVG from Heroicons into HTML (no runtime library).
 *   <svg class="heroicon" xmlns="http://www.w3.org/2000/svg" fill="none"
 *        viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
 *     <path stroke-linecap="round" stroke-linejoin="round" d="…"/>
 *   </svg>
 * Sizes: .heroicon (20px), .heroicon-sm (16px), .heroicon-lg (24px) in css/styles.css.
 */

/* ── Mobile menu ──────────────────────────────────────────────────────────── */
function openMobileMenu() {
  var sidebar = document.getElementById('mobileSidebar');
  var overlay = document.getElementById('mobileMenuOverlay');
  if (sidebar) sidebar.classList.remove('translate-x-[-100%]');
  if (overlay) overlay.classList.remove('hidden');
}
function closeMobileMenu() {
  var sidebar = document.getElementById('mobileSidebar');
  var overlay = document.getElementById('mobileMenuOverlay');
  if (sidebar) sidebar.classList.add('translate-x-[-100%]');
  if (overlay) overlay.classList.add('hidden');
}

/* ── Top nav mobile collapse (layout-dashboard) ─────────────────────────── */
function toggleTopNav() {
  var panel = document.getElementById('topNavMobile');
  var btn = document.getElementById('topNavToggle');
  if (!panel) return;
  var open = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !open);
  if (btn) btn.setAttribute('aria-expanded', String(open));
}

/* ── User dropdown ────────────────────────────────────────────────────────── */
function toggleUserMenu() {
  var d = document.getElementById('userMenuDropdown');
  var btn = document.getElementById('userMenuBtn');
  var chev = document.getElementById('userMenuChevron');
  if (!d) return;
  var open = !d.classList.contains('hidden');
  d.classList.toggle('hidden', open);
  if (btn) btn.setAttribute('aria-expanded', String(!open));
  if (chev) chev.classList.toggle('rotate-180', !open);
}
document.addEventListener('click', function (e) {
  var w = document.getElementById('userMenuWrapper');
  var d = document.getElementById('userMenuDropdown');
  var btn = document.getElementById('userMenuBtn');
  var chev = document.getElementById('userMenuChevron');
  if (w && !w.contains(e.target) && d) {
    d.classList.add('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    if (chev) chev.classList.remove('rotate-180');
  }
});

/* ── Desktop sidebar collapse ─────────────────────────────────────────────── */
(function () {
  var btn = document.getElementById('railSidebarToggle');
  var shell = document.getElementById('appRailShell');
  var aside = document.getElementById('railAside');
  var logoBlock = document.getElementById('railLogoBlock');
  if (!btn || !aside) return;

  var labelIds = ['railCapDash', 'railCapProj', 'railCapSet'];
  var icons = aside.querySelectorAll('[data-rail-icon]');
  var navLinks = aside.querySelectorAll('[data-rail-nav]');
  var nav = aside.querySelector('nav');
  var expanded = true;

  function setExpanded(isExpanded) {
    expanded = isExpanded;
    if (shell) {
      if (isExpanded) shell.style.removeProperty('--rail-sidebar-width');
      else shell.style.setProperty('--rail-sidebar-width', '4rem');
    }
    labelIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('hidden', !isExpanded);
    });
    icons.forEach(function (el) {
      var icon = el.querySelector('.app-icon, .heroicon, svg');
      if (icon) {
        icon.classList.toggle('app-icon-lg', !isExpanded);
        icon.classList.toggle('w-6', !isExpanded);
        icon.classList.toggle('h-6', !isExpanded);
        icon.classList.toggle('w-5', isExpanded);
        icon.classList.toggle('h-5', isExpanded);
      }
    });
    navLinks.forEach(function (el) {
      el.classList.toggle('justify-start', isExpanded);
      el.classList.toggle('justify-center', !isExpanded);
      el.classList.toggle('px-2', isExpanded);
      el.classList.toggle('px-1', !isExpanded);
    });
    if (nav) {
      nav.classList.toggle('items-center', !isExpanded);
      nav.classList.toggle('p-3', isExpanded);
      nav.classList.toggle('px-1', !isExpanded);
      nav.classList.toggle('py-2', !isExpanded);
    }
    if (logoBlock) {
      logoBlock.classList.toggle('px-4', isExpanded);
      logoBlock.classList.toggle('px-1', !isExpanded);
    }
    var chL = document.getElementById('railChevLeft');
    var chR = document.getElementById('railChevRight');
    if (chL) chL.classList.toggle('hidden', !isExpanded);
    if (chR) chR.classList.toggle('hidden', isExpanded);
    btn.setAttribute('aria-expanded', String(isExpanded));
  }

  btn.addEventListener('click', function () {
    setExpanded(!expanded);
  });

  setExpanded(true);
})();

/* ── Vanilla JS feature stubs ─────────────────────────────────────────────
   Add prototype feature interactions below using vanilla JS.
   ──────────────────────────────────────────────────────────────────────── */
