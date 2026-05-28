import axios from 'axios'

const BASE = 'http://localhost:3001'

const api = axios.create({ baseURL: BASE, timeout: 15000 })

api.interceptors.response.use(
  res => res.data,
  err => { console.error('API error:', err.message); return Promise.reject(err) }
)

export const hazardApi = {
  getAll: ()     => api.get('/hazards'),
  report: (data) => api.post('/hazards', data),
}

export const contractorApi = {
  getAll: ()    => api.get('/contractors'),
  getOne: (id)  => api.get(`/contractors/${id}`),
}

// Inference goes straight to HF Space (or localhost:8000 fallback)
const HF_URL = 'https://hacksss-aegisroad-detector.hf.space'

export const inferenceApi = {
  predict: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${HF_URL}/predict`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('Inference failed')
    return res.json()
  }
}

export default api
