const BASE_URL = import.meta.env.VITE_API_URL || ''
 
async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  
  const token = localStorage.getItem('aegis_jwt_token');
  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE_URL}${path}`, opts)
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`)
  return res.json()
}
 
export const hazardApi = {
  getAll: async () => {
    const { hazards } = await request('GET', '/api/hazards/')
    return hazards.map(adaptHazard)
  },
  create: async (data) => {
    const payload = {
      road_name: data.location || data.road_name || 'Unknown road',
      lat: data.coordinates?.lat ?? data.lat ?? 16.4307,
      lng: data.coordinates?.lng ?? data.lng ?? 80.6241,
      cls: data.cls || 'D40',
      severity: data.severity || 'high',
      contractor: data.contractor || null,
      description: data.description || null
    }
    const created = await request('POST', '/api/hazards/', payload)
    return adaptHazard(created)
  },
  update: async (id, data) => {
    const payload = { ...data }
    if (payload.status) payload.status = toBackendStatus(payload.status)
    if (payload.completionPercent != null) {
      payload.completion_percent = payload.completionPercent
      delete payload.completionPercent
    }
    const updated = await request('PATCH', `/api/hazards/${id}`, payload)
    return adaptHazard(updated)
  },
}

export const authApi = {
  login: async (credentials) => {
    return request('POST', '/api/auth/login', credentials);
  },
  register: async (userData) => {
    return request('POST', '/api/auth/register', userData);
  }
}
 
export const contractorApi = {
  getAll: async () => {
    const { contractors } = await request('GET', '/api/contractors/')
    return contractors.map(adaptContractor)
  },
  getOne: (id) => request('GET', `/api/contractors/${id}`).then(adaptContractor),
}
 
export const chatApi = {
  send: async (message, history = []) => {
    const { reply } = await request('POST', '/api/chat/', { message, history })
    return reply
  },
}
 
export const inferenceApi = {
  predict: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BASE_URL}/api/predict/`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('Inference failed')
    return res.json()
  }
}
 
// ── Status mapping (frontend ↔ backend) ──
const BACKEND_TO_UI = {
  open: 'unassigned',
  in_progress: 'in-progress',
  resolved: 'completed',
}
const UI_TO_BACKEND = {
  unassigned: 'open',
  open: 'open',
  'in-progress': 'in_progress',
  in_progress: 'in_progress',
  completed: 'resolved',
  resolved: 'resolved',
}

function toBackendStatus(status) {
  return UI_TO_BACKEND[status] || status
}

function toUiStatus(status) {
  return BACKEND_TO_UI[status] || status
}

// ── Adapters ──
function adaptHazard(h) {
  const LABELS = {
    D00:'Longitudinal Crack', D10:'Transverse Crack',
    D20:'Alligator Cracking',  D40:'Pothole (Critical)',
  }
  return {
    id: String(h.id), cls: h.cls, lat: h.lat, lng: h.lng,
    severity: h.severity, status: toUiStatus(h.status), sla_hours: h.sla_hours,
    contractor: h.contractor || null, reported: h.reported,
    title: LABELS[h.cls] || h.cls,
    location: h.road_name, road_name: h.road_name,
    reporter: h.reporter || 'AegisScan',
    description: h.description || `${LABELS[h.cls]||h.cls} on ${h.road_name}`,
    reportedTimeAgo: formatTimeAgo(new Date(h.reported || Date.now())),
    completionPercent:
      h.completion_percent ??
      (h.status === 'resolved' ? 100 : h.status === 'in_progress' ? 55 : 0),
    coordinates: {
      x: Math.round(((h.lng-79.5)/2)*80+10),
      y: Math.round(((17.2-h.lat)/1.5)*70+10),
      lat: h.lat, lng: h.lng,
    },
  }
}
 
function adaptContractor(c) {
  return {
    id: String(c.id), name: c.name, district: c.district,
    score: c.score, avg_days: c.avg_days, budget: c.budget,
    spent: c.spent, active_sla: c.active_sla,
    contracts: c.contracts ?? 10,
    repaired: c.repaired ?? Math.round((c.score/100)*10),
    activeJobs: c.active_sla ?? 0,
    successRate: c.score ?? 80,
    orgName: c.name,
  }
}
 
function formatTimeAgo(date) {
  const d = (Date.now()-date.getTime())/1000
  if (d < 60)    return `${Math.round(d)}s ago`
  if (d < 3600)  return `${Math.round(d/60)}m ago`
  if (d < 86400) return `${Math.round(d/3600)}h ago`
  return `${Math.round(d/86400)}d ago`
}
