// src/Register.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inventario.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validación: las contraseñas deben coincidir
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validación: contraseña mínima de 6 caracteres
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true); // Activar estado de carga

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      // Registro exitoso, redirigir al login
      alert('¡Registro exitoso! Ya puedes iniciar sesión.');
      navigate('/login');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Desactivar estado de carga
    }
  };

  return (
    <div className="inventario-wrapper">
      <div className="inventario-header">
        <h1>Crear cuenta</h1>
        <p>Registro de nuevo usuario</p>
      </div>

      <div className="form-card" style={{ maxWidth: '420px', margin: '0 auto' }}>
        {error && (
          <div style={{ 
            background: '#fdf0ef', 
            color: '#c0392b', 
            padding: '10px 14px', 
            borderRadius: '7px',
            fontSize: '13px',
            marginBottom: '16px',
            border: '0.5px solid #f5c6c2'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-field" style={{ marginBottom: '14px' }}>
            <label htmlFor="inp-username">Usuario</label>
            <input
              id="inp-username"
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-field" style={{ marginBottom: '14px' }}>
            <label htmlFor="inp-email">Correo electrónico</label>
            <input
              id="inp-email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-field" style={{ marginBottom: '14px' }}>
            <label htmlFor="inp-password">Contraseña</label>
            <input
              id="inp-password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-field" style={{ marginBottom: '18px' }}>
            <label htmlFor="inp-confirm-password">Confirmar contraseña</label>
            <input
              id="inp-confirm-password"
              type="password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-actions" style={{ marginBottom: '14px' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Registrarse'}
            </button>
          </div>

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#5a8fa3' }}>
            ¿Ya tienes cuenta?{' '}
            <span 
              onClick={() => navigate('/login')}
              style={{ 
                color: '#007EA7', 
                cursor: 'pointer',
                fontWeight: '500',
                textDecoration: 'underline'
              }}
            >
              Inicia sesión aquí
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}