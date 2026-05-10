/**
 * admin-healthcheck.js — MDS Panel Startup Health Check
 *
 * Runs once after React mounts (non-blocking).
 * Verifies API reachability, logs results via MDS-DIAG,
 * and exposes window.__MDS_HEALTH__ for the Diagnostics page.
 *
 * On failure: logs to console with MDS-DIAG categories.
 * Never throws — failures are reported only, never crash the panel.
 */

import { log } from './mds-diag.js'

const HEALTH_TIMEOUT_MS = 6000

export async function runHealthCheck(apiUrl) {
  const result = {
    ts:            new Date().toISOString(),
    demoMode:      !apiUrl,
    apiConfigured: !!apiUrl,
    apiReachable:  false,
    apiStatus:     null,
    latencyMs:     null,
    region:        null,
    error:         null,
    build:         window.__MDS_BUILD__ || null,
  }

  log.panel('=== MDS PANEL HEALTH CHECK ===')
  log.panel('demo mode     :', result.demoMode)
  log.panel('api configured:', result.apiConfigured)

  if (result.build) {
    log.panel('build commit  :', result.build.commit)
    log.panel('built at      :', result.build.builtAt)
  }

  if (!apiUrl) {
    log.warn('HEALTH: demo mode active — no live API check performed')
    log.warn('  → Set VITE_MDS_API_URL in Amplify env vars to connect to AWS')
    window.__MDS_HEALTH__ = result
    log.panel('=== END HEALTH CHECK ===')
    return result
  }

  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS)

    const res = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeout)
    result.latencyMs  = Date.now() - start
    result.apiStatus  = res.status
    result.apiReachable = res.ok

    if (res.ok) {
      let data = {}
      try { data = await res.json() } catch (_) {}
      result.region = data.region || null
      log.panel(`HEALTH: API reachable — status:${res.status} latency:${result.latencyMs}ms region:${result.region || 'unknown'}`)
    } else {
      result.error = `HTTP ${res.status}`
      log.err(`HEALTH: API returned ${res.status} (${result.latencyMs}ms)`)
      if (res.status === 401) log.err('  HEALTH: 401 — PANEL_KEY not set in Lambda env vars')
      if (res.status === 403) log.err('  HEALTH: 403 — request forbidden (IAM or CORS issue)')
      if (res.status >= 500)  log.err('  HEALTH: 5xx — Lambda crashed or misconfigured; check CloudWatch')
    }

  } catch (err) {
    result.latencyMs = Date.now() - start
    result.error     = err.message

    if (err.name === 'AbortError') {
      log.err(`HEALTH: timeout after ${HEALTH_TIMEOUT_MS}ms — API Gateway or Lambda not responding`)
    } else if (err.message?.toLowerCase().includes('cors')) {
      log.err('HEALTH: CORS error — API Gateway CORS config missing or wrong allowed origin')
    } else {
      log.err('HEALTH: network error —', err.message)
      log.err('  possible: Lambda not deployed, API Gateway route missing, incorrect URL')
    }
  }

  window.__MDS_HEALTH__ = result
  log.panel('=== END HEALTH CHECK ===')
  return result
}
