/**
 * mds-diag.js — Moore Digital Solutions Runtime Diagnostic Layer
 *
 * PURPOSE
 * -------
 * Structured, filterable console output covering every failure class
 * encountered during SPA deployments on AWS Amplify/CloudFront:
 *   - Stale browser/CDN cache (wrong JS bundle loaded)
 *   - Lambda crashes / API Gateway errors
 *   - Auth state machine failures
 *   - CSS/DOM visibility failures (blank screen)
 *   - DynamoDB connectivity
 *   - React render loops
 *   - Network failures and CORS issues
 *   - Deployment mismatches and build hash verification
 *
 * USAGE
 * -----
 * Filter in DevTools console: type "MDS-DIAG" in the filter box.
 * Check window.__MDS_BUILD__ for commit hash and build timestamp.
 * Check window.__MDS_HEALTH__ for API health check result.
 *
 * DESIGN RULES
 * ------------
 * - All output prefixed [MDS-DIAG/<CATEGORY>] — grep-friendly.
 * - No external dependencies — pure vanilla JS, runs before React.
 * - Safe to leave in production: does not affect behavior.
 * - Every exported function is a no-op on error (never throws).
 */

const TS = () => new Date().toISOString()

// ── Namespaced loggers ────────────────────────────────────────────────────────
export const log = {
  env:    (...a) => console.log   ('%c[MDS-DIAG/ENV]',    'color:#6ee7f7;font-weight:700', TS(), ...a),
  build:  (...a) => console.log   ('%c[MDS-DIAG/BUILD]',  'color:#38bdf8;font-weight:700', TS(), ...a),
  auth:   (...a) => console.log   ('%c[MDS-DIAG/AUTH]',   'color:#86efac;font-weight:700', TS(), ...a),
  route:  (...a) => console.log   ('%c[MDS-DIAG/ROUTE]',  'color:#c4b5fd;font-weight:700', TS(), ...a),
  api:    (...a) => console.log   ('%c[MDS-DIAG/API]',    'color:#fde68a;font-weight:700', TS(), ...a),
  dash:   (...a) => console.log   ('%c[MDS-DIAG/DASH]',   'color:#f9a8d4;font-weight:700', TS(), ...a),
  deploy: (...a) => console.log   ('%c[MDS-DIAG/DEPLOY]', 'color:#4ade80;font-weight:700', TS(), ...a),
  panel:  (...a) => console.log   ('%c[MDS-DIAG/PANEL]',  'color:#fb923c;font-weight:700', TS(), ...a),
  net:    (...a) => console.log   ('%c[MDS-DIAG/NETWORK]','color:#a78bfa;font-weight:700', TS(), ...a),
  css:    (...a) => console.log   ('%c[MDS-DIAG/CSS]',    'color:#67e8f9;font-weight:700', TS(), ...a),
  dom:    (...a) => console.log   ('%c[MDS-DIAG/DOM]',    'color:#a3e635;font-weight:700', TS(), ...a),
  state:  (...a) => console.log   ('%c[MDS-DIAG/STATE]',  'color:#e879f9;font-weight:700', TS(), ...a),
  err:    (...a) => console.error ('%c[MDS-DIAG/ERR]',    'color:#f87171;font-weight:700', TS(), ...a),
  warn:   (...a) => console.warn  ('%c[MDS-DIAG/WARN]',   'color:#fbbf24;font-weight:700', TS(), ...a),
}

// ── 1. ENVIRONMENT + BUILD IDENTIFICATION ────────────────────────────────────
export function diagEnvironment(apiUrl) {
  try {
    const isDemo = !apiUrl
    log.env('=== MDS PANEL ENVIRONMENT ===')
    log.env('hostname         :', window.location.hostname)
    log.env('pathname         :', window.location.pathname)
    log.env('API_URL          :', apiUrl || '(empty — DEMO MODE)')
    log.env('demo mode        :', isDemo)
    log.env('viewport         :', `${window.innerWidth}×${window.innerHeight}`)
    log.env('userAgent        :', navigator.userAgent.slice(0, 120))

    const build = window.__MDS_BUILD__
    if (build) {
      log.build('panel       :', build.panel)
      log.build('version     :', build.version)
      log.build('commit      :', build.commit)
      log.build('frontendHash:', build.frontendHash)
      log.build('builtAt     :', build.builtAt)
      log.build('env         :', build.env)

      if (window.location.hostname === 'localhost') {
        const ageMs = Date.now() - new Date(build.builtAt).getTime()
        if (ageMs > 600_000) {
          log.warn(`BUILD: bundle is ${Math.round(ageMs / 60000)}min old on localhost — run "npm run build" if you expect fresh code`)
        }
      }
    } else {
      log.warn('BUILD: window.__MDS_BUILD__ not set — vite.config.js define{} may be missing')
    }

    if (isDemo && window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.')) {
      log.err('IMPOSSIBLE: demo mode ON but hostname is not localhost — VITE_MDS_API_URL not set in Amplify env vars')
    }

    log.env('=== END ENVIRONMENT ===')
  } catch (ex) {
    console.error('[MDS-DIAG/ERR] diagEnvironment threw:', ex)
  }
}

// ── 2. API ────────────────────────────────────────────────────────────────────
export function diagRequest(method, url) {
  try { log.api(`→ ${method} ${url}`) } catch (_) {}
}

export function diagResponse(method, url, status, elapsed) {
  try {
    const ok = status >= 200 && status < 300
    const logger = ok ? log.api : log.err
    logger(`← ${method} ${url} ${status} (${elapsed}ms)`)
    if (!ok) {
      if (status === 0)   log.err('  status 0 = network failure, CORS block, or aborted request')
      if (status === 401) log.err('  401 = wrong PANEL_KEY — check Lambda PANEL_KEY env var vs VITE_MDS_PANEL_KEY')
      if (status === 403) log.err('  403 = forbidden — check IAM role or auth logic')
      if (status === 404) log.err('  404 = route not matched in Lambda — verify HTTP API v2 routes in setup.sh')
      if (status === 502) log.err('  502 = Lambda crashed (unhandled exception) — check CloudWatch logs for mds-panel-api')
      if (status === 503) log.err('  503 = throttled or Lambda concurrency limit hit')
      if (status === 504) log.err('  504 = Lambda timeout — check DynamoDB connectivity and Lambda timeout setting')
    }
  } catch (_) {}
}

export function diagApiError(path, err) {
  try {
    log.err(`API network error on ${path}: ${err?.message || err}`)
    if (err?.message?.includes('fetch')) log.err('  possible causes: CORS, network down, API Gateway not deployed')
  } catch (_) {}
}

// ── 3. ROUTING / LIFECYCLE ────────────────────────────────────────────────────
export function diagRoute(branch, reason) {
  try { log.route(`rendering branch: ${branch}${reason ? ` | reason: ${reason}` : ''}`) } catch (_) {}
}

export function diagMount(component) {
  try { log.route(`MOUNT: ${component}`) } catch (_) {}
}

export function diagUnmount(component) {
  try { log.route(`UNMOUNT: ${component}`) } catch (_) {}
}

// ── 4. DASHBOARD STATE ────────────────────────────────────────────────────────
export function diagLeads(leads, context) {
  try {
    log.dash(`[${context}] leads: ${leads.length}`)
    if (leads.length === 0) {
      log.warn(`[${context}] leads array empty — check API response, DynamoDB table, and IAM Scan permissions`)
      return
    }
    const first = leads[0]
    log.dash(`[${context}] first lead keys: ${Object.keys(first).join(', ')}`)
  } catch (_) {}
}

export function diagRenderBranch(label, { loading, error, leadsCount }) {
  try {
    log.dash(`render [${label}] — loading:${loading} | error:"${error || 'none'}" | leads:${leadsCount}`)
  } catch (_) {}
}

// ── 5. CSS / VISIBILITY AUDIT ────────────────────────────────────────────────
function _computedReport(el, label) {
  if (!el) { log.warn(`CSS-AUDIT skipped: ${label} element is null`); return }
  try {
    const s    = window.getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    log.css(`[${label}]`, {
      display: s.display, visibility: s.visibility, opacity: s.opacity,
      w: `${Math.round(rect.width)}px`, h: `${Math.round(rect.height)}px`,
      color: s.color, background: s.backgroundColor,
    })
    if (s.display === 'none')      log.err(`CSS: ${label} display:none — INVISIBLE`)
    if (s.visibility === 'hidden') log.err(`CSS: ${label} visibility:hidden — INVISIBLE`)
    if (Number(s.opacity) === 0)   log.err(`CSS: ${label} opacity:0 — INVISIBLE`)
    if (rect.height === 0)         log.err(`CSS: ${label} height:0 — COLLAPSED`)
    if (rect.width === 0)          log.err(`CSS: ${label} width:0 — COLLAPSED`)
    const vw = window.innerWidth, vh = window.innerHeight
    if (rect.right < 0 || rect.bottom < 0 || rect.left > vw || rect.top > vh) {
      log.err(`CSS: ${label} OUTSIDE viewport`)
    }
  } catch (ex) {
    log.warn(`CSS-AUDIT threw for ${label}: ${ex.message}`)
  }
}

export function diagCSS(...elements) {
  try {
    log.css('=== CSS VISIBILITY AUDIT ===')
    _computedReport(document.body, 'body')
    _computedReport(document.getElementById('root'), '#root')
    for (const { el, label } of elements) _computedReport(el, label)
    log.css('=== END CSS AUDIT ===')
  } catch (_) {}
}

// ── 6. GLOBAL ERROR HANDLERS ─────────────────────────────────────────────────
let _handlersInstalled = false
export function installGlobalHandlers() {
  if (_handlersInstalled) return
  _handlersInstalled = true

  window.onerror = (msg, src, line, col, err) => {
    log.err('window.onerror:', msg)
    log.err('  source:', src, `line:${line} col:${col}`)
    if (err?.stack) log.err('  stack:', err.stack.slice(0, 500))
  }

  window.addEventListener('unhandledrejection', e => {
    log.err('unhandledrejection:', e.reason?.message || String(e.reason))
    if (e.reason?.stack) log.err('  stack:', e.reason.stack.slice(0, 500))
  })

  // Render loop detector: >12 MDS log lines in 500ms = suspected infinite loop.
  let renderCount = 0, renderWindow = null
  const origLog = console.log
  console.log = (...args) => {
    if (String(args[0] || '').includes('[MDS-DIAG')) {
      renderCount++
      if (!renderWindow) {
        renderWindow = setTimeout(() => {
          if (renderCount > 12) log.err(`RENDER LOOP SUSPECTED: ${renderCount} MDS log lines in 500ms`)
          renderCount = 0
          renderWindow = null
        }, 500)
      }
    }
    origLog.apply(console, args)
  }

  log.env('Global handlers installed (onerror, unhandledrejection, render-loop detector)')
}

// ── 7. IMPOSSIBLE STATE DETECTOR ─────────────────────────────────────────────
export function assertPossibleState(label, conditions) {
  try {
    for (const [desc, impossible] of Object.entries(conditions)) {
      if (impossible) log.err(`IMPOSSIBLE STATE [${label}]: ${desc}`)
    }
  } catch (_) {}
}
