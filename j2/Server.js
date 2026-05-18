//Server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

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




app.listen(5000, () => console.log("Servidor corriendo en puerto 5000"));