const BASE = import.meta.env.VITE_API_URL || '';

async function handleResp(resp) {
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`HTTP ${resp.status} ${resp.statusText} - ${text}`);
  }
  return resp.json();
}

export const productosApi = {
  list: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = `${BASE}/api/productos${qs ? `?${qs}` : ''}`;
    const resp = await fetch(url);
    return handleResp(resp);
  },
  create: async (data) => {
    const resp = await fetch(`${BASE}/api/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResp(resp);
  },
  remove: async (id) => {
    const resp = await fetch(`${BASE}/api/productos/${id}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error(`No se pudo eliminar id=${id}`);
    return true;
  }
};
