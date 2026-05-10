/**
 * api.js — MDS Panel API Client
 *
 * DEMO MODE: when VITE_MDS_API_URL is not set, all calls return mock data
 * from panel.config.js. Allows the panel to run without any AWS infrastructure.
 *
 * LIVE MODE: calls the mds-panel-api Lambda via API Gateway HTTP API v2.
 * Auth: x-mds-panel-key header (must match Lambda PANEL_KEY env var).
 *
 * Env vars:
 *   VITE_MDS_API_URL   — API Gateway invoke URL (no trailing slash)
 *   VITE_MDS_PANEL_KEY — secret key for all authenticated requests
 */

import {
  diagRequest, diagResponse, diagApiError,
} from '../mds-diag.js'
import {
  DEMO_CLIENTS, DEMO_LEADS, DEMO_DEPLOYMENTS, DEMO_EVENTS,
} from '../panel.config.js'

const API_URL   = import.meta.env.VITE_MDS_API_URL   || ''
const PANEL_KEY = import.meta.env.VITE_MDS_PANEL_KEY || ''
export const DEMO_MODE = !API_URL

// ── HTTP Request ──────────────────────────────────────────────────────────────

async function request(method, path, body) {
  if (DEMO_MODE) return demoHandler(method, path, body)

  const url   = `${API_URL}${path}`
  const start = Date.now()
  diagRequest(method, url)

  let res
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type':    'application/json',
        'x-mds-panel-key': PANEL_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (netErr) {
    diagApiError(path, netErr)
    throw new Error(`Network error: ${netErr.message}`)
  }

  const elapsed = Date.now() - start
  const text = await res.text()
  diagResponse(method, url, res.status, elapsed)

  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }

  if (!res.ok) {
    const msg = data?.message || res.statusText || `HTTP ${res.status}`
    throw Object.assign(new Error(msg), { status: res.status, data })
  }
  return data
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  // Clients
  getClients:       ()           => request('GET',    '/clients'),
  getClient:        (id)         => request('GET',    `/clients/${id}`),
  createClient:     (data)       => request('POST',   '/clients', data),
  updateClient:     (id, data)   => request('PUT',    `/clients/${id}`, data),

  // Leads
  getLeads:         (params)     => request('GET',    `/leads${buildQuery(params)}`),
  updateLead:       (id, data)   => request('PUT',    `/leads/${id}`, data),

  // Deployments
  getDeployments:   (params)     => request('GET',    `/deployments${buildQuery(params)}`),
  recordDeployment: (data)       => request('POST',   '/deployments', data),
  updateDeployment: (id, data)   => request('PUT',    `/deployments/${id}`, data),

  // Events
  getEvents:        (params)     => request('GET',    `/events${buildQuery(params)}`),
  recordEvent:      (data)       => request('POST',   '/events', data),
  deleteEvent:      (id)         => request('DELETE', `/events/${id}`),

  // Health
  health:           ()           => request('GET',    '/health'),
}

// ── Query String Builder ──────────────────────────────────────────────────────

function buildQuery(params) {
  if (!params) return ''
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString()
  return q ? `?${q}` : ''
}

// ── Demo Handler ──────────────────────────────────────────────────────────────
// Simulates the Lambda API contract locally — no AWS required.

function demoHandler(method, path, body) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(_demoRoute(method, path, body)), 150)
  })
}

function _demoRoute(method, path, body) {
  // Clients
  if (method === 'GET'  && path === '/clients')
    return { clients: DEMO_CLIENTS, count: DEMO_CLIENTS.length }

  if (method === 'GET'  && path.match(/^\/clients\/[^/]+$/))
    return { client: DEMO_CLIENTS.find(c => path.endsWith(c.clientId)) || null }

  if (method === 'POST' && path === '/clients')
    return { client: { ...body, clientId: `client-${Date.now()}`, createdAt: new Date().toISOString() } }

  if (method === 'PUT'  && path.match(/^\/clients\/[^/]+$/)) {
    const id = path.split('/').pop()
    return { client: { ...DEMO_CLIENTS.find(c => c.clientId === id), ...body, updatedAt: new Date().toISOString() } }
  }

  // Leads
  if (method === 'GET'  && path.startsWith('/leads')) {
    const params = _parseQuery(path)
    let leads = [...DEMO_LEADS]
    if (params.clientId) leads = leads.filter(l => l.clientId === params.clientId)
    if (params.status)   leads = leads.filter(l => l.status   === params.status)
    leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return { leads, count: leads.length }
  }

  if (method === 'PUT'  && path.match(/^\/leads\/[^/]+$/)) {
    const id   = path.split('/').pop()
    const lead = DEMO_LEADS.find(l => l.leadId === id)
    return { lead: lead ? { ...lead, ...body, updatedAt: new Date().toISOString() } : null }
  }

  // Deployments
  if (method === 'GET'  && path.startsWith('/deployments')) {
    const params = _parseQuery(path)
    let deps = [...DEMO_DEPLOYMENTS]
    if (params.clientId) deps = deps.filter(d => d.clientId === params.clientId)
    deps.sort((a, b) => new Date(b.deployedAt || 0) - new Date(a.deployedAt || 0))
    return { deployments: deps, count: deps.length }
  }

  // Events
  if (method === 'GET'  && path.startsWith('/events')) {
    const params = _parseQuery(path)
    let evts = [...DEMO_EVENTS]
    if (params.clientId) evts = evts.filter(e => e.clientId === params.clientId)
    if (params.severity) evts = evts.filter(e => e.severity === params.severity)
    if (params.category) evts = evts.filter(e => e.category === params.category)
    evts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    const limit = Number(params.limit) || 50
    return { events: evts.slice(0, limit), count: evts.length }
  }

  // Health
  if (path === '/health')
    return { status: 'demo', message: 'Running in demo mode — no AWS connection', ts: new Date().toISOString() }

  return { error: 'Not found', method, path }
}

function _parseQuery(pathWithQuery) {
  const q = pathWithQuery.split('?')[1] || ''
  return Object.fromEntries(new URLSearchParams(q).entries())
}
