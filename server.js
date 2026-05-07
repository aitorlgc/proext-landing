const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// Routes for each page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/catalogo', (req, res) => {
  res.sendFile(path.join(__dirname, 'catalogo.html'));
});

app.get('/contacto', (req, res) => {
  res.sendFile(path.join(__dirname, 'contacto.html'));
});

app.get('/nosotros', (req, res) => {
  res.sendFile(path.join(__dirname, 'nosotros.html'));
});

app.get('/pergola-bioclimatica', (req, res) => {
  res.sendFile(path.join(__dirname, 'pergola-bioclimatica.html'));
});

// API endpoint for contact form
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message, interest } = req.body || {};
  console.log('Contacto recibido:', { name, email, phone, message, interest });
  res.json({ success: true, message: 'Gracias por contactarnos. Nos pondremos en contacto contigo pronto.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor ProExt escuchando en http://localhost:${port}`);
  console.log(`\nPáginas disponibles:`);
  console.log(`- Home: http://localhost:${port}/`);
  console.log(`- Catálogo: http://localhost:${port}/catalogo`);
  console.log(`- Contacto: http://localhost:${port}/contacto`);
  console.log(`- Nosotros: http://localhost:${port}/nosotros`);
});