function base() {
  return localStorage.getItem('mugenBackendUrl') || ''
}

function auth() {
  const key = localStorage.getItem('mugenApiKey')
  const headers = { 'Content-Type': 'application/json' }
  if (key) headers['X-Api-Key'] = key
  return headers
}

async function apiFetch(path, options = {}) {
  const url = base() + '/api/leads' + path
  const headers = { ...auth(), ...options.headers }
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export async function uploadCsv(file) {
  const form = new FormData()
  form.append('file', file)
  const url = base() + '/api/leads/upload'
  const headers = auth()
  delete headers['Content-Type']
  const res = await fetch(url, { method: 'POST', body: form, headers })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export async function getLeads({ search, filterReached } = {}) {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (filterReached !== undefined && filterReached !== null) {
    params.set('filterReached', filterReached)
  }
  return apiFetch('' + (params.toString() ? '?' + params.toString() : ''))
}

export async function toggleStatus(id) {
  return apiFetch(`/${id}/status`, { method: 'PATCH' })
}

export async function updateNotes(id, notes) {
  return apiFetch(`/${id}/notes`, { method: 'PATCH', body: JSON.stringify({ notes }) })
}

export async function tidyLeads() {
  return apiFetch('/tidy', { method: 'POST' })
}

export async function scoreLeads() {
  return apiFetch('/score', { method: 'POST' })
}

export async function generateMessages(ids) {
  return apiFetch('/outreach/generate', { method: 'POST', body: JSON.stringify({ ids }) })
}

export async function scrapeGmaps(query, maxResults = 20) {
  return apiFetch('/scrape', { method: 'POST', body: JSON.stringify({ query, maxResults }) })
}

export async function deleteLead(id) {
  return apiFetch(`/${id}`, { method: 'DELETE' })
}

export async function deleteAllLeads() {
  return apiFetch('', { method: 'DELETE' })
}

export async function importLeads(leads) {
  return apiFetch('/import', { method: 'POST', body: JSON.stringify({ leads }) })
}

export async function fetchSettings() {
  const url = base() + '/api/settings'
  const headers = auth()
  delete headers['Content-Type']
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error('Failed to fetch settings')
  return res.json()
}

export async function saveSettings(data) {
  const url = base() + '/api/settings'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth() },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to save settings')
  return res.json()
}
