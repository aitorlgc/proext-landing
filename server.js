require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://*.google.com", "https://*.googleusercontent.com", "https://www.googletagmanager.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "https://*.google.com", "https://*.googleusercontent.com"],
      frameSrc: ["'self'", "https://*.google.com", "https://*.googleusercontent.com", "https://maps.google.com", "https://www.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.static(path.join(__dirname)));

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ARTICLES_FILE = path.join(__dirname, 'data', 'articles.json');

// ---------- Pages ----------
const pages = [
  ['/', 'index.html'],
  ['/catalogo', 'catalogo.html'],
  ['/contacto', 'contacto.html'],
  ['/nosotros', 'nosotros.html'],
  ['/blog', 'blog.html'],
  ['/producto', 'product.html'],
];
pages.forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

// ---------- Read-only data APIs ----------
app.get('/api/products', (req, res) => {
  if (!fs.existsSync(PRODUCTS_FILE)) return res.json([]);
  try {
    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    res.json(data.products || []);
  } catch (e) {
    console.error('Error reading products:', e);
    res.json([]);
  }
});

app.get('/api/blog', (req, res) => {
  if (!fs.existsSync(ARTICLES_FILE)) return res.json([]);
  try {
    const data = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
    res.json(data.articles || []);
  } catch (e) {
    console.error('Error reading articles:', e);
    res.json([]);
  }
});

// ---------- 404 fallback ----------
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor ProExt escuchando en http://localhost:${port}`);
});
