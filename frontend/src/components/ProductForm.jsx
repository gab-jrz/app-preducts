import { useState } from 'react';

export default function ProductForm({ onCreated }) {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    provincia: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.titulo || !form.descripcion) {
      setError('Completá título y descripción');
      return;
    }
    try {
      setLoading(true);
      const fechaPublicacion = new Date().toISOString();
      const body = { ...form, fechaPublicacion, ownerId: 1 };
      const resp = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!resp.ok) throw new Error('No se pudo crear');
      const creado = await resp.json();
      setForm({ titulo: '', descripcion: '', categoria: '', provincia: '' });
      onCreated?.(creado);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>Nuevo producto</h2>
      {error && <div className="error">{error}</div>}
      <div className="row">
        <label>
          Título
          <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ej: Teclado Mecánico" />
        </label>
        <label>
          Categoría
          <input name="categoria" value={form.categoria} onChange={handleChange} placeholder="Tecnología" />
        </label>
      </div>
      <div className="row">
        <label className="full">
          Descripción
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} placeholder="Descripción breve" />
        </label>
      </div>
      <div className="row">
        <label>
          Provincia
          <input name="provincia" value={form.provincia} onChange={handleChange} placeholder="Buenos Aires" />
        </label>
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear'}</button>
      <style>{`
        .product-form { border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; background: #fff; }
        .product-form h2 { margin: 0 0 12px; font-size: 18px; }
        .product-form .row { display: flex; gap: 12px; margin-bottom: 12px; }
        .product-form label { display: flex; flex-direction: column; gap: 6px; flex: 1; font-size: 14px; }
        .product-form input, .product-form textarea { border: 1px solid #d1d5db; border-radius: 6px; padding: 8px; font-size: 14px; }
        .product-form .full { flex: 1; }
        .product-form .error { color: #b91c1c; background: #fee2e2; border: 1px solid #fecaca; padding: 8px; border-radius: 6px; margin-bottom: 8px; }
        .product-form button { background: linear-gradient(90deg,#667eea,#764ba2); color:#fff; border:none; padding:10px 14px; border-radius:8px; cursor:pointer; }
        .product-form button:disabled { opacity: .6; cursor: not-allowed; }
      `}</style>
    </form>
  );
}
