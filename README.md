# 📦 Fastech Inventory System

Un sistema completo de gestión de inventario con autenticación de usuarios, roles y CRUD de productos. Construido con **React** en el frontend y **Node.js/Express** en el backend.

---

## 🏗️ Estructura del Proyecto

```
fastech-inventory/
├── Server.js                 # Servidor Express principal
├── src/                      # Componentes React
│   ├── App.js               # Componente principal con ruteo
│   ├── Login.js             # Componente de login
│   ├── Register.js          # Componente de registro
│   └── Inventario.css       # Estilos globales
├── node_modules/            # Dependencias del proyecto (no incluido)
├── public/                  # Archivos estáticos (no incluido)
├── package.json             # Dependencias del proyecto
└── .env                      # Variables de entorno (no incluido)
```

---

## 🚀 Características Principales

### 🔐 Autenticación
- **Registro de usuarios** con validaciones
- **Login con JWT** (tokens de 2 horas)
- **Encriptación de contraseñas** con bcryptjs
- **Sistema de roles** (cliente, admin, etc.)

### 📊 Gestión de Inventario
- **CRUD completo** de productos
- **Validaciones** en precio y cantidad
- **Actualización en tiempo real** del inventario
- **Búsqueda y filtrado** de productos

### 🛡️ Seguridad
- Tokens JWT con expiración
- Contraseñas hasheadas
- Validación de datos en servidor
- CORS habilitado

---

## 💻 Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de datos
- **bcryptjs** - Hash de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **dotenv** - Variables de entorno

### Frontend
- **React** - Librería UI
- **React Router** - Enrutamiento
- **Fetch API** - Peticiones HTTP
- **CSS3** - Estilos personalizados

---

## 📋 Requisitos Previos

- Node.js v14+ 
- MySQL Server 5.7+
- npm o yarn
- Un editor de código (VS Code recomendado)

---

## 🔧 Instalación

### 1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd fastech-inventory
```

### 2. **Instalar dependencias**
```bash
npm install
```

### 3. **Configurar la base de datos MySQL**

Crea una base de datos llamada `fastech_db`:

```sql
CREATE DATABASE fastech_db;
USE fastech_db;

-- Tabla de usuarios
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'cliente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE productos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
JWT_SECRET=tu_secret_key_muy_segura_aqui
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=fastech_db
PORT=5000
```

**⚠️ Nota:** Reemplaza las credenciales de MySQL con las tuyas.

### 5. **Iniciar el servidor**

```bash
node Server.js
```

El servidor estará disponible en `http://localhost:5000`

### 6. **Iniciar el frontend React** (en otra terminal)

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📡 Endpoints del API

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |

**Registro:**
```json
{
  "username": "juan",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Login:**
```json
{
  "username": "juan",
  "password": "password123"
}
```

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/productos` | Obtener todos los productos |
| `POST` | `/productos` | Crear nuevo producto |
| `PUT` | `/productos/:id` | Actualizar producto |
| `DELETE` | `/productos/:id` | Eliminar producto |

**Crear/Actualizar Producto:**
```json
{
  "nombre": "Laptop Dell",
  "precio": 899.99,
  "stock": 15
}
```

---

## 🎯 Flujo de la Aplicación

```
┌─────────────────────┐
│   Usuario Nuevo     │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │   REGISTER   │
    └──────┬───────┘
           │
           ▼ (Success)
    ┌──────────────┐      ┌──────────────┐
    │    LOGIN     │◄─────┤   Usuario    │
    └──────┬───────┘      │   Existente  │
           │              └──────────────┘
           ▼ (JWT Token)
    ┌──────────────────────┐
    │  DASHBOARD           │
    │  (Ver Inventario)    │
    └──────┬───────────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
  Agregar    Editar/
  Producto   Eliminar
```

---

## 🧪 Validaciones Implementadas

### Backend
- ✅ Nombre de producto no vacío
- ✅ Precio no negativo
- ✅ Contraseña mínimo 6 caracteres
- ✅ Email único en registro
- ✅ Usuario único en registro
- ✅ Validación de JWT en requests

### Frontend
- ✅ Campos requeridos en formularios
- ✅ Coincidencia de contraseñas
- ✅ Mensajes de error dinámicos
- ✅ Estados de carga en peticiones

---

## 🔑 Variables de Entorno

```env
# Autenticación
JWT_SECRET=your_secret_key_here

# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fastech_db

# Servidor
PORT=5000
NODE_ENV=development
```

---

## 📝 Notas Importantes

### Seguridad
- **Nunca** commits credenciales reales en el repositorio
- Usa `.gitignore` para proteger `.env`
- Cambia `JWT_SECRET` en producción
- Implementa HTTPS en producción

### Base de Datos
- El servidor espera MySQL en `localhost`
- Credenciales por defecto: `root` / `stopthetime98.`
- **⚠️ Cambia estas credenciales antes de desplegar**

---

## 🐛 Solución de Problemas

### Error: "ECONNREFUSED" en conexión a MySQL
- ✅ Verifica que MySQL Server esté corriendo
- ✅ Revisa las credenciales en `.env`
- ✅ Asegúrate de que la DB existe: `CREATE DATABASE fastech_db;`

### Error: "PORT 5000 already in use"
- ✅ Cambia el puerto en `Server.js` y `.env`
- ✅ O termina el proceso: `lsof -ti:5000 | xargs kill -9`

### Error: "JWT not found"
- ✅ Asegúrate de estar autenticado
- ✅ Revisa que el token se guardó en localStorage
- ✅ Verifica que `JWT_SECRET` está configurado

---

## 📦 Dependencias Principales

```json
{
  "backend": {
    "express": "^4.x",
    "mysql2": "^3.x",
    "bcryptjs": "^2.x",
    "jsonwebtoken": "^9.x",
    "cors": "^2.x",
    "dotenv": "^16.x"
  },
  "frontend": {
    "react": "^18.x",
    "react-router-dom": "^6.x"
  }
}
```

---

## 👤 Roles de Usuario

- **cliente** - Rol por defecto al registrarse
- **admin** - Acceso total al sistema (asignar manualmente en DB)

---

## 📄 Licencia

Este proyecto es de código abierto. Úsalo libremente.



