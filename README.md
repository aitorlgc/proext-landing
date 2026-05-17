# ProExt - Landing Page Premium

Web profesional para ProExt, especialistas en toldos, pérgolas bioclimáticas, ventanas y cerramientos de alta gama.

---

## 🚀 Características

- **Diseño Premium**: Colores marfil (#FDFBF7) y verde bosque (#1B4332)
- **Totalmente Responsive**: Adaptado para móvil, tablet y escritorio
- **Animaciones**: Efectos de reveal y transiciones suaves
- **Formulario de Contacto**: Seguro con encriptación AES-256-CBC
- **Panel de Administración**: Gestiona contactos, blog y productos
- **Blog Dinámico**: Artículos con categorías y lightbox
- **Catálogo de Productos**: Filtros y productos dinámicos desde JSON
- **Botón WhatsApp**: Flotante con enlace directo (+34 658 193 209)

---

## 📄 Páginas

| Página | Descripción |
|--------|-------------|
| `index.html` | Página principal con hero, features, productos y testimonios |
| `catalogo.html` | Catálogo de productos con filtros por categoría |
| `producto.html` | Plantilla dinámica de producto (ID como parámetro) |
| `nosotros.html` | Página sobre la empresa |
| `blog.html` | Blog con artículos y categorías |
| `contacto.html` | Formulario de contacto y información |
| `admin.html` | Panel de administración (Admin / Prueba) |

---

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **Seguridad**: Helmet.js, Rate Limiting, Tokens seguros
- **Encriptación**: AES-256-CBC para datos de contacto

---

## ⚙️ Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/aitorlgc/proext-landing.git
cd proext-landing

# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

El servidor estará en: `http://localhost:3000`

---

## 🔐 Panel de Administración

**URL**: `/admin`  
**Usuario**: `Admin`  
**Contraseña**: `Prueba`

### Funcionalidades:
- Ver contactos recibidos (encriptados)
- Gestionar blog (añadir/editar artículos)
- Gestionar productos (añadir/editar)
- Exportar datos

---

## 📁 Estructura

```
proext-landing/
├── index.html          # Página principal
├── catalogo.html       # Catálogo de productos
├── producto.html       # Plantilla de producto dinámico
├── nosotros.html       # Página sobre nosotros
├── blog.html           # Blog
├── contacto.html       # Página de contacto
├── admin.html          # Panel de administración
├── server.js           # Servidor Express con APIs
├── styles.css          # Todos los estilos
├── package.json        # Dependencias
├── js/
│   ├── main.js        # Scripts principales
│   ├── catalogo.js    # Lógica del catálogo
│   └── contacto.js    # Lógica del formulario
├── assets/             # Imágenes y recursos
│   ├── logo.png
│   ├── logo-blanco.png
│   ├── velux.png
│   └── whatsapp.png
└── data/               # Datos JSON
    ├── contacts.json   # Contactos (encriptados)
    ├── products.json  # Productos
    └── blog.json      # Artículos del blog
```

---

## 🌐 Despliegue

### Railway (Recomendado)

1. Crear cuenta en [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Seleccionar repositorio `aitorlgc/proext-landing`
4. Railway detectará automáticamente `npm install` y `npm start`
5. Añadir dominio en Settings → Domains

### Dominio Personalizado

- Comprar dominio (ej: proextoutdoor.com)
- Configurar DNS en Railway Settings → Domains
- SSL automático incluido

---

## 🔧 Configuración

### Variables de Entorno (opcional)

```env
PORT=3000
ENCRYPTION_KEY=tu_clave_encriptacion_aqui
```

### Seguridad

- **Rate Limiting**: 5 intentos de login cada 15 minutos
- **Tokens**: Caducan en 24 horas
- **Helmet.js**: Cabeceras de seguridad HTTP
- **Sanitización**: Protección XSS en inputs

---

## 📱 Responsive

| Breakpoint | Ancho |
|------------|-------|
| Desktop    | > 1024px |
| Tablet     | 769px - 1024px |
| Móvil      | < 768px |

---

## 🏷️ Categorías de Productos

- Toldos y Pérgolas
- Pérgolas Bioclimáticas
- Cerramientos
- Ventanas

---

## 📝 Notas

- Los datos de contactos se almacenan encriptados en `data/contacts.json`
- Los productos se cargan dinámicamente desde `data/products.json`
- Las imágenes de productos pueden subirse desde el panel de admin
- El formulario de contacto requiere código postal válido (España)

---

## 📄 Licencia

MIT License - ProExt 2024