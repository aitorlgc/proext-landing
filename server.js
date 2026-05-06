const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

// Simple contact endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  // In production: persist or send email
  console.log('Contacto recibido:', { name, email, message });
  res.json({ success: true, message: 'Gracias por contactarnos. Nos pondremos en contacto contigo pronto.' });
});

// Fallback to index.html for SPA behavior (if not found static file)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor ProExt escuchando en http://localhost:${port}`);
});
