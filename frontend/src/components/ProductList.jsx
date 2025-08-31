import { useEffect, useMemo, useState } from 'react';

export default function ProductList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [provincia, setProvincia] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const params = useMemo(() => {
    const p = { _page: page, _limit: limit, _sort: 'fechaPublicacion', _order: 'desc' };
    if (q) p.q = q;
    if (categoria) p.categoria = categoria;
    if (provincia) p.provincia = provincia;
    return p;
  }, [page, limit, q, categoria, provincia]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const usp = new URLSearchParams(params).toString();
      const resp = await fetch(`/api/productos?${usp}`);
      if (!resp.ok) throw new Error('Error cargando productos');
      const data = await resp.json();
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onDelete = async (id) => {
    if (!confirm('¿Eliminar producto?')) return;
    const resp = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    if (resp.ok) {
      setItems((arr) => arr.filter((x) => x.id !== id));
    }
  };

  return (
    <div className="product-list">
      <div className="filters">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar..." />
        <input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Categoría" />
        <input value={provincia} onChange={(e) => setProvincia(e.target.value)} placeholder="Provincia" />
        <button onClick={() => { setPage(1); load(); }}>Buscar</button>
      </div>

      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <ul className="list">
          {items.map((p) => (
            <li key={p.id} className="card">
              <div className="title">{p.titulo}</div>
              <div className="meta">
                <span>Cat: {p.categoria || '—'}</span>
                <span>Prov: {p.provincia || '—'}</span>
                <span>{new Date(p.fechaPublicacion).toLocaleDateString()}</span>
              </div>
              <div className="desc">{p.descripcion}</div>
              <div className="actions">
                <button className="danger" onClick={() => onDelete(p.id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="pager">
        <button disabled={page === 1} onClick={() => setPage((n) => Math.max(1, n - 1))}>Anterior</button>
        <span>Página {page}</span>
        <button onClick={() => setPage((n) => n + 1)}>Siguiente</button>
      </div>

      <style>{`
        .product-list { display: flex; flex-direction: column; gap: 12px; }
        .filters { display: flex; gap: 8px; }
        .filters input { border:1px solid #d1d5db; border-radius:6px; padding:8px; }
        .filters button { background:#111827; color:#fff; border:none; padding:8px 12px; border-radius:6px; }
        .error { color:#b91c1c; background:#fee2e2; border:1px solid #fecaca; padding:8px; border-radius:6px; }
        .loading { color:#374151; }
        .list { list-style:none; display:grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap:12px; padding:0; margin:0; }
        .card { border:1px solid #e5e7eb; border-radius:8px; padding:12px; background:#fff; display:flex; flex-direction:column; gap:8px; }
        .card .title { font-weight:600; }
        .card .meta { display:flex; gap:8px; font-size:12px; color:#6b7280; }
        .card .desc { color:#374151; font-size:14px; min-height: 40px; }
        .actions { display:flex; gap:8px; }
        .actions .danger { background:#ef4444; color:#fff; border:none; padding:6px 10px; border-radius:6px; }
        .pager { display:flex; align-items:center; gap:8px; }
      `}</style>
    </div>
  );
}
