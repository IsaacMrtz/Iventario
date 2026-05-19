// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import './Inventario.css';

// ==========================================
// COMPONENTE: NAVBAR
// ==========================================
function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{
      background: '#003459',
      padding: '14px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      borderRadius: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ 
          fontSize: '16px', 
          fontWeight: '500', 
          color: '#ffffff',
          letterSpacing: '-0.3px'
        }}>
          Inventario Fastech
        </span>
        <span style={{
          fontSize: '11px',
          color: '#c8e4ef',
          background: '#007EA7',
          padding: '3px 8px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          fontWeight: '500',
          letterSpacing: '0.4px'
        }}>
          {user.rol || 'Usuario'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '13px', color: '#c8e4ef' }}>
          {user.username || 'Usuario'}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '0.5px solid #c8e4ef',
            color: '#ffffff',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background 0.15s'
          }}
          onMouseOver={(e) => e.target.style.background = '#007EA7'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE: VISTA DE ACTIVACIÓN (CLIENTES)
// ==========================================
function VistaActivacion() {
  return (
    <div className="inventario-wrapper">
      <Navbar />
      
      <div className="form-card" style={{ 
        textAlign: 'center', 
        padding: '3rem 2rem',
        maxWidth: '480px',
        margin: '60px auto'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#e6f4fa',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '36px'
        }}>
          ⏳
        </div>

        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '500', 
          color: '#003459',
          marginBottom: '12px',
          letterSpacing: '-0.3px'
        }}>
          Cuenta en proceso de activación
        </h2>

        <p style={{ 
          fontSize: '14px', 
          color: '#5a8fa3',
          lineHeight: '1.6',
          marginBottom: '0'
        }}>
          Tu cuenta ha sido creada exitosamente. Un administrador revisará tu solicitud 
          y activará tu acceso al sistema. Recibirás una notificación cuando tu cuenta esté lista.
        </p>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE: INVENTARIO (SOLO ADMIN)
// ==========================================
function ComponenteInventario() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalProductos = productos.length;
  const totalUnidades = productos.reduce((s, p) => s + parseInt(p.stock || 0), 0);
  const valorTotal = productos.reduce((s, p) => s + parseFloat(p.precio || 0) * parseInt(p.stock || 0), 0);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/productos')
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
    setLoading(true);

    const datosProducto = { 
      nombre, 
      precio: parseFloat(precio), 
      stock: parseInt(stock) 
    };

    if (editandoId) {
      // ACTUALIZAR PRODUCTO
      const res = await fetch(`http://localhost:5000/productos/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosProducto)
      });

      setLoading(false);

      if (res.ok) {
        const productoActualizado = await res.json();
        setProductos(productos.map(p => p.id === editandoId ? productoActualizado : p));
        cancelarEdicion();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Error al actualizar el producto');
      }
    } else {
      // CREAR PRODUCTO NUEVO
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/productos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosProducto)
      });

      setLoading(false);

      if (res.ok) {
        const productoGuardado = await res.json();
        setProductos([...productos, productoGuardado]);
        setNombre('');
        setPrecio('');
        setStock('');
      } else {
        const errorData = await res.json();
        
        // Si el servidor responde con error de autenticación
        if (res.status === 401 || res.status === 403) {
          alert('Tu sesión ha expirado. Inicia sesión nuevamente.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          // Mostrar error de validación del servidor
          alert(errorData.error || 'Error al guardar el producto');
        }
      }
    }
  };

  const eliminarProducto = async (id) => {
    setLoading(true);
    const res = await fetch(`http://localhost:5000/productos/${id}`, {
      method: 'DELETE'
    });

    setLoading(false);

    if (res.ok) {
      setProductos(productos.filter(p => p.id !== id));
    } else {
      alert('Error al eliminar el producto');
    }
  };

  return (
    <div className="inventario-wrapper">
      <Navbar />

      {/* Indicador de carga global */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#003459',
          color: '#ffffff',
          padding: '16px 32px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,52,89,0.3)'
        }}>
          Cargando...
        </div>
      )}

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
              <input 
                id="inp-nombre" 
                placeholder="Ej. Laptop Dell" 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
                required 
              />
            </div>
            <div className="form-field">
              <label htmlFor="inp-precio">Precio ($)</label>
              <input 
                id="inp-precio" 
                placeholder="0.00" 
                type="number" 
                step="0.01" 
                value={precio} 
                onChange={e => setPrecio(e.target.value)} 
                required 
              />
            </div>
            <div className="form-field">
              <label htmlFor="inp-stock">Stock</label>
              <input 
                id="inp-stock" 
                placeholder="0" 
                type="number" 
                value={stock} 
                onChange={e => setStock(e.target.value)} 
                required 
              />
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

// ==========================================
// COMPONENTE: PROTECCIÓN DE RUTAS
// ==========================================
function RutaProtegida({ children, rolesPermitidos }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si hay roles específicos permitidos, verificar
  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    // Si el usuario no tiene el rol permitido, redirigir según su rol
    if (user.rol === 'cliente') {
      return <Navigate to="/activacion" />;
    }
    return <Navigate to="/login" />;
  }

  return children;
}

// ==========================================
// COMPONENTE PRINCIPAL: APP
// ==========================================
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta raíz redirige a login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Ruta para clientes: Vista de activación */}
        <Route 
          path="/activacion" 
          element={
            <RutaProtegida rolesPermitidos={['cliente']}>
              <VistaActivacion />
            </RutaProtegida>
          } 
        />
        
        {/* Ruta protegida solo para admin: Inventario */}
        <Route 
          path="/inventario" 
          element={
            <RutaProtegida rolesPermitidos={['admin']}>
              <ComponenteInventario />
            </RutaProtegida>
          } 
        />
        
        {/* Cualquier otra ruta redirige a login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}