import { useState } from 'react';
import './App.css';
import ProductList from './components/ProductList.jsx';
import ProductForm from './components/ProductForm.jsx';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="container">
      <header className="header">
        <h1>Mini app de productos (mock)</h1>
        <p>API: /api/productos (json-server) — Dev proxied por Vite, Prod reescrito por Vercel</p>
      </header>

      <main className="grid">
        <section>
          <ProductForm onCreated={() => setRefreshKey((k) => k + 1)} />
        </section>
        <section>
          {/* Cambia la key para forzar recarga tras crear */}
          <div key={refreshKey}>
            <ProductList />
          </div>
        </section>
      </main>

      <style>{`
        .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
        .header { margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 16px; }
        @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

export default App;
