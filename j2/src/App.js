import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login'; // Asegúrate de que el archivo Login.js esté en la misma carpeta
import './Inventario.css';

// 1. Separamos el inventario en su propio componente funcional
function ComponenteInventario() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const totalProductos = productos.length;
  const totalUnidades = productos.reduce((s, p) => s + parseInt(p.stock || 0), 0);
  const valorTotal = productos.reduce((s, p) => s + parseFloat(p.precio || 0) * parseInt(p.stock || 0), 0);

  useEffect(() => {
    fetch('http://localhost:5000/productos')
      .then(res => res.json())
      .then(data => setProductos(data));
  }, []);

  const cargarDatosEditar = (producto) => {
    setEditandoId(producto.id);
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setStock(producto.stock);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
    setPrecio('');
    setStock('');
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    const datosProducto = { nombre, precio: parseFloat(precio), stock: parseInt(stock) };

    if (editandoId) {
      const res = await fetch(`http://localhost:5000/productos/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosProducto)
      });

      if (res.ok) {
        const productoActualizado = await res.json();
        setProductos(productos.map(p => p.id === editandoId ? productoActualizado : p));
        cancelarEdicion();
      } else {
        alert('Error al actualizar el producto');
      }
    } else {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/productos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosProducto)
      });

      if (res.ok) {
        const productoGuardado = await res.json();
        setProductos([...productos, productoGuardado]);
        setNombre('');
        setPrecio('');
        setStock('');
      } else {
        // CORRECCIÓN: Si el servidor responde con error de autenticación (401 o 403)
        if (res.status === 401 || res.status === 403) {
          alert('Tu sesión ha expirado o no es válida. Inicia sesión nuevamente.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          alert('Error al guardar el producto');
        }
      }
    }
  };

  const eliminarProducto = async (id) => {
    const res = await fetch(`http://localhost:5000/productos/${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      setProductos(productos.filter(p => p.id !== id));
    } else {
      alert('Error al eliminar el producto');
    }
  };

  return (
    <div className="inventario-wrapper">
      <div className="inventario-header">
        <h1>Inventario</h1>
        <p>Gestión de productos · MySQL</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Productos</span>
          <span className="stat-value">{totalProductos}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Unidades</span>
          <span className="stat-value">{totalUnidades.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Valor total</span>
          <span className="stat-value">
            ${valorTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="form-card">
        <p className="form-card-title">{editandoId ? 'Editar producto' : 'Nuevo producto'}</p>
        {editandoId && <span className="editing-badge">✏ Editando producto</span>}

        <form onSubmit={manejarEnvio}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="inp-nombre">Nombre</label>
              <input id="inp-nombre" placeholder="Ej. Laptop Dell" value={nombre} onChange={e => setNombre(e.target.value)} required />
            </div>
            <div className="form-field">
              <label htmlFor="inp-precio">Precio ($)</label>
              <input id="inp-precio" placeholder="0.00" type="number" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} required />
            </div>
            <div className="form-field">
              <label htmlFor="inp-stock">Stock</label>
              <input id="inp-stock" placeholder="0" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className={editandoId ? 'btn btn-success' : 'btn btn-primary'}>
              {editandoId ? 'Actualizar en MySQL' : 'Guardar en MySQL'}
            </button>
            {editandoId && <button type="button" className="btn btn-cancel" onClick={cancelarEdicion}>Cancelar edición</button>}
          </div>
        </form>
      </div>

      <div className="table-wrap">
        <table className="inventario-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th className="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr><td colSpan="4" className="tabla-vacia">No hay productos registrados.</td></tr>
            ) : (
              productos.map(p => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td className="td-precio">${parseFloat(p.precio).toFixed(2)}</td>
                  <td><span className="stock-pill">{p.stock} uds.</span></td>
                  <td className="td-acciones">
                    <div className="acciones-wrap">
                      <button className="btn-editar" onClick={() => cargarDatosEditar(p)}>Editar</button>
                      <button className="btn-borrar" onClick={() => eliminarProducto(p.id)}>Borrar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 2. Componente principal que maneja las rutas de la app
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Al cargar la raíz "/", redirige automáticamente a /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Rutas configuradas */}
        <Route path="/login" element={<Login />} />
        <Route path="/inventario" element={<ComponenteInventario />} />
        
        {/* Cualquier otra ruta inexistente redirige a /login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}