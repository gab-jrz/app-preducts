const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: '*', // Ajusta a tu dominio de Vercel cuando lo tengas, p.ej: [/\.vercel\.app$/]
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Logger simple
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'backend', timestamp: new Date().toISOString() });
});

// Ejemplo de endpoint API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hola desde el backend en Railway!' });
});

// Cargar DB en memoria desde db.json
const dbPath = path.join(__dirname, '..', 'db.json');
let dbObj = { productos: [], usuarios: [], mensajes: [] };
try {
  const raw = fs.readFileSync(dbPath, 'utf-8');
  dbObj = JSON.parse(raw);
} catch (e) {
  console.warn('No se pudo leer db.json, usando DB en memoria:', e.message);
}

// CRUD en memoria para productos
app.get('/api/productos', (req, res) => {
  try {
    const { q = '', categoria = '', provincia = '', _page = '1', _limit = '10', _sort = 'fechaPublicacion', _order = 'desc' } = req.query;
    let data = Array.isArray(dbObj.productos) ? [...dbObj.productos] : [];
    const ql = String(q).toLowerCase();
    if (ql) {
      data = data.filter(p => `${p.titulo} ${p.descripcion}`.toLowerCase().includes(ql));
    }
    if (categoria) data = data.filter(p => String(p.categoria || '').toLowerCase() === String(categoria).toLowerCase());
    if (provincia) data = data.filter(p => String(p.provincia || '').toLowerCase() === String(provincia).toLowerCase());
    // Orden
    data.sort((a, b) => {
      const av = a[_sort]; const bv = b[_sort];
      if (av === bv) return 0;
      const comp = av > bv ? 1 : -1;
      return _order.toLowerCase() === 'desc' ? -comp : comp;
    });
    // Paginación
    const page = Math.max(1, parseInt(_page, 10) || 1);
    const limit = Math.max(1, parseInt(_limit, 10) || 10);
    const start = (page - 1) * limit;
    const slice = data.slice(start, start + limit);
    res.set('X-Total-Count', String(data.length));
    return res.json(slice);
  } catch (e) {
    console.error('Error listando productos:', e);
    return res.status(500).json({ error: 'Error interno listando productos' });
  }
});

app.get('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id);
  const itm = (dbObj.productos || []).find(p => p.id === id);
  if (!itm) return res.status(404).json({ error: 'No encontrado' });
  return res.json(itm);
});

app.post('/api/productos', (req, res) => {
  try {
    const body = req.body || {};
    if (!body.titulo || !body.descripcion) {
      return res.status(400).json({ error: 'Faltan campos requeridos: titulo, descripcion' });
    }
    const arr = Array.isArray(dbObj.productos) ? dbObj.productos : (dbObj.productos = []);
    const maxId = arr.reduce((m, x) => (typeof x.id === 'number' && x.id > m ? x.id : m), 0);
    const nuevo = {
      id: maxId + 1,
      titulo: body.titulo,
      descripcion: body.descripcion,
      categoria: body.categoria || '',
      provincia: body.provincia || '',
      fechaPublicacion: body.fechaPublicacion || new Date().toISOString(),
      ownerId: body.ownerId || 1,
      createdAt: new Date().toISOString()
    };
    arr.push(nuevo);
    return res.status(201).json(nuevo);
  } catch (e) {
    console.error('Error creando producto:', e);
    return res.status(500).json({ error: 'Error interno creando producto' });
  }
});

app.delete('/api/productos/:id', (req, res) => {
  const id = Number(req.params.id);
  const arr = Array.isArray(dbObj.productos) ? dbObj.productos : (dbObj.productos = []);
  const idx = arr.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  arr.splice(idx, 1);
  return res.status(204).send();
});

// Manejador de errores global
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Puerto desde env (Railway asigna uno)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend escuchando en puerto ${PORT}`);
});
