//Server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());


// CONFIGURACIÓN DE LA BASE DE DATOS

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Tu usuario de MySQL
  password: 'stopthetime98.', // Tu contraseña de MySQL
  database: 'fastech_db'
});


// RUTAS DE PRODUCTOS


// Ruta para obtener productos
app.get('/productos', (req, res) => {
  db.query('SELECT * FROM productos', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Ruta para agregar un producto (CON VALIDACIONES)
app.post('/productos', (req, res) => {
  const { nombre, precio, stock } = req.body;

  // VALIDACIÓN 1: El nombre no puede estar vacío
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ 
      error: 'El nombre del producto no puede estar vacío' 
    });
  }

  // VALIDACIÓN 2: El precio no puede ser negativo
  if (precio < 0) {
    return res.status(400).json({ 
      error: 'El precio no puede ser negativo' 
    });
  }

  db.query(
    'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
    [nombre, precio, stock], 
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId, ...req.body });
    }
  );
});

// Ruta para eliminar un producto
app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ message: `Producto con ID ${id} eliminado con éxito` });
  });
});

// Ruta para actualizar un producto (CON VALIDACIONES)
app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;

  // VALIDACIÓN 1: El nombre no puede estar vacío
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ 
      error: 'El nombre del producto no puede estar vacío' 
    });
  }

  // VALIDACIÓN 2: El precio no puede ser negativo
  if (precio < 0) {
    return res.status(400).json({ 
      error: 'El precio no puede ser negativo' 
    });
  }

  db.query(
    'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
    [nombre, precio, stock, id], 
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      // Devolvemos los datos actualizados
      res.json({ id, nombre, precio, stock });
    }
  );
});

// ==========================================
// ENDPOINT DE REGISTRO (CON ROL POR DEFECTO)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validación de campos obligatorios
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Por defecto, el rol es 'cliente' al registrarse
    const query = 'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)';
    
    db.query(query, [username, email, hashedPassword, 'cliente'], (err, result) => {
      if (err) {
        // Manejar error por si el usuario o correo ya existe
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ 
            error: 'El nombre de usuario o correo ya está en uso' 
          });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ 
        message: 'Usuario registrado con éxito. Tu cuenta está en proceso de activación.' 
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el registro' });
  }
});


// ENDPOINT DE LOGIN (CON ROL EN RESPUESTA)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Buscamos por nombre de usuario
  const query = 'SELECT * FROM usuarios WHERE nombre = ?';
  
  db.query(query, [username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Si no devuelve filas, el usuario no existe
    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = results[0];

    // Verificar si la contraseña coincide con el hash guardado
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar el token JWT si todo coincide
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.nombre,
        rol: user.rol // Incluimos el rol en el token
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' } // Expira en 2 horas
    );

    // Enviamos el token y los datos del usuario (incluyendo el rol)
    res.json({
      message: 'Login exitoso',
      token,
      user: { 
        id: user.id, 
        username: user.nombre,
        rol: user.rol // Enviamos el rol al frontend
      }
    });
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(5000, () => console.log("Servidor corriendo en puerto 5000"));