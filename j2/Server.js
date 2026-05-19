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

// Configura tu conexión a MySQL aquí
const db = mysql.createConnection({
host: 'localhost',

user: 'root', // Tu usuario de MySQL
password: 'stopthetime98.', // Tu contraseña de MySQL
database: 'fastech_db'
});

// Ruta para obtener productos
app.get('/productos', (req, res) => {
db.query('SELECT * FROM productos', (err, results) => {
if (err) return res.status(500).send(err);
res.json(results);
});
});

// Ruta para agregar un producto
app.post('/productos', (req, res) => {
const { nombre, precio, stock } = req.body;
db.query('INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
[nombre, precio, stock], (err, result) => {
if (err) return res.status(500).send(err);
res.json({ id: result.insertId, ...req.body });
});
});

app.delete('/productos/:id', (req, res) => {
    const{id} = req.params;
db.query('DELETE FROM productos WHERE id = ?' , [id],(err, result) => {
if (err) return res.status(500).send(err);
if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json({ message: `Producto con ID ${id} eliminado con éxito` });
    });

});

app.put('/productos/:id', (req, res) => {
    const{id} = req.params;
    const{nombre, precio, stock} = req.body;
db.query('UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?' ,
     [nombre, precio, stock,id],(err, result) => {
if (err) return res.status(500).send(err);
if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        // Devolvemos los datos actualizados
        res.json({ id, nombre, precio, stock });
    });

});


// ==========================================
// 1. ENDPOINT DE REGISTRO
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Encriptar la contraseña (10 salt rounds es el estándar seguro)
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO usuarios (nombre, password) VALUES (?, ?)';
        db.query(query, [username, hashedPassword], (err, result) => {
            if (err) {
                // Manejar error por si el usuario ya existe (columna UNIQUE)
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Usuario registrado con éxito' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar el registro' });
    }
});

// ==========================================
// 2. ENDPOINT DE LOGIN
// ==========================================
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

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
            { id: user.id, username: user.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '2h' } // Expira en 2 horas
        );

        // Enviamos el token al frontend
        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user.id, username: user.nombre } // Datos públicos útiles para el front
        });
    });
});




app.listen(5000, () => console.log("Servidor corriendo en puerto 5000"));