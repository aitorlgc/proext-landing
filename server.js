require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

// Rate limiting
const loginAttempts = new Map();
const rateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const attempts = loginAttempts.get(ip) || [];
    const recentAttempts = attempts.filter(t => now - t < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return res.status(429).json({ error: 'Demasiados intentos. Intenta más tarde.' });
    }
    recentAttempts.push(now);
    loginAttempts.set(ip, recentAttempts);
    next();
  };
};

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2';
const IV_LENGTH = 16;

const encrypt = (text) => {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  if (!text || !text.includes(':')) return text;
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) { return text; }
};

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.use(express.static(path.join(__dirname)));

const ADMIN_USER = process.env.ADMIN_USER || 'Admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Prueba';

// Secure token generation
const generateSecureToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

const validTokens = new Set();

app.post('/api/login', rateLimit(5, 15 * 60 * 1000), (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = generateSecureToken();
    validTokens.add(token);
    // Token expires in 24 hours
    setTimeout(() => validTokens.delete(token), 24 * 60 * 60 * 1000);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
  }
});

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ error: 'Sesión expirada o no autorizada' });
  }
  next();
};

app.post('/api/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization;
  validTokens.delete(token);
  res.json({ success: true });
});

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[\d\s()-]{9,20}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const validateRequired = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

const DATA_FILE = path.join(__dirname, 'data', 'contacts.json');
const BACKUP_FILE = path.join(__dirname, 'data', 'contacts_backup.json');

const ensureDataDir = () => {
  const dataDir = path.join(__dirname, 'data');
  console.log('Creando directorio:', dataDir);
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Directorio creado exitosamente');
    } catch (err) {
      console.error('Error al crear directorio:', err);
    }
  }
  if (!fs.existsSync(DATA_FILE)) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ contacts: [] }, null, 2));
      console.log('Archivo JSON creado');
    } catch (err) {
      console.error('Error al crear archivo JSON:', err);
    }
  }
};

const saveContact = (contact, unencryptedContact) => {
  try {
    ensureDataDir();
    // Save encrypted version
    console.log('Leyendo archivo JSON...');
    const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
    console.log('Contenido actual:', fileContent ? 'existe' : 'vacío');
    const data = JSON.parse(fileContent);
    data.contacts.push(contact);
    console.log('Escribiendo archivo JSON...');
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Archivo JSON actualizado');

    // Save backup without encryption
    const backupContent = fs.readFileSync(BACKUP_FILE, 'utf8');
    const backupData = JSON.parse(backupContent);
    backupData.contacts.push(unencryptedContact);
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(backupData, null, 2));
    console.log('Backup guardado');
  } catch (err) {
    console.error('Error en saveContact:', err);
    throw err;
  }
};

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

app.get('/toldo-retractil', (req, res) => {
  res.sendFile(path.join(__dirname, 'toldo-retractil.html'));
});

app.get('/ventana-panoramica', (req, res) => {
  res.sendFile(path.join(__dirname, 'ventana-panoramica.html'));
});

app.get('/cerramiento-terraza', (req, res) => {
  res.sendFile(path.join(__dirname, 'cerramiento-terraza.html'));
});

app.get('/toldo-vertical-screen', (req, res) => {
  res.sendFile(path.join(__dirname, 'toldo-vertical-screen.html'));
});

app.get('/pergola-madera', (req, res) => {
  res.sendFile(path.join(__dirname, 'pergola-madera.html'));
});

app.get('/ventana-corredera', (req, res) => {
  res.sendFile(path.join(__dirname, 'ventana-corredera.html'));
});

app.get('/cortina-enrollable', (req, res) => {
  res.sendFile(path.join(__dirname, 'cortina-enrollable.html'));
});

app.get('/toldo-punto-recto', (req, res) => {
  res.sendFile(path.join(__dirname, 'toldo-punto-recto.html'));
});

app.get('/pergola-motorizada', (req, res) => {
  res.sendFile(path.join(__dirname, 'pergola-motorizada.html'));
});

app.get('/ventana-batiente', (req, res) => {
  res.sendFile(path.join(__dirname, 'ventana-batiente.html'));
});

app.get('/cerramiento-zenital', (req, res) => {
  res.sendFile(path.join(__dirname, 'cerramiento-zenital.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog.html'));
});

const BLOG_FILE = path.join(__dirname, 'data', 'blog.json');

app.get('/api/blog', (req, res) => {
  ensureDataDir();
  if (!fs.existsSync(BLOG_FILE)) {
    return res.json([]);
  }
  const data = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
  res.json(data.articles || []);
});

app.post('/api/blog', requireAuth, express.json(), (req, res) => {
  try {
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      return res.status(400).json({ success: false, error: 'Use form-data for file uploads' });
    }

    const { title, image, excerpt, content, imageData } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'El título y contenido son obligatorios' });
    }

    ensureDataDir();
    let data = { articles: [] };
    if (fs.existsSync(BLOG_FILE)) {
      data = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    }

    let finalImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop';

    if (image && (image.startsWith('http') || image.startsWith('/'))) {
      finalImage = image;
    } else if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const ext = imageData.match(/data:image\/(\w+)/)?.[1] || 'jpg';
      const filename = `blog_${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(base64Data, 'base64'));
      finalImage = `/uploads/${filename}`;
    }

    const article = {
      id: uuidv4(),
      title: sanitizeInput(title),
      image: finalImage,
      excerpt: sanitizeInput(excerpt || content.substring(0, 150) + '...'),
      content: sanitizeInput(content),
      createdAt: new Date().toISOString()
    };

    data.articles.push(article);
    fs.writeFileSync(BLOG_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, article });
  } catch (error) {
    console.error('Error saving blog:', error);
    res.status(500).json({ success: false, error: 'Error al guardar el artículo' });
  }
});

app.use('/uploads', express.static(uploadDir));

app.delete('/api/blog/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    ensureDataDir();
    if (!fs.existsSync(BLOG_FILE)) {
      return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
    }
    const data = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    const index = data.articles.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
    }
    data.articles.splice(index, 1);
    fs.writeFileSync(BLOG_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al eliminar' });
  }
});

app.put('/api/blog/:id', requireAuth, express.json(), (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, excerpt, content, imageData } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'El título y contenido son obligatorios' });
    }

    ensureDataDir();
    if (!fs.existsSync(BLOG_FILE)) {
      return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
    }

    const data = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    const index = data.articles.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Artículo no encontrado' });
    }

    let finalImage = data.articles[index].image;
    if (image && (image.startsWith('http') || image.startsWith('/'))) {
      finalImage = image;
    } else if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const ext = imageData.match(/data:image\/(\w+)/)?.[1] || 'jpg';
      const filename = `blog_${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(base64Data, 'base64'));
      finalImage = `/uploads/${filename}`;
    }

    data.articles[index] = {
      ...data.articles[index],
      title: sanitizeInput(title),
      image: finalImage,
      excerpt: sanitizeInput(excerpt || content.substring(0, 150) + '...'),
      content: sanitizeInput(content),
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(BLOG_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, article: data.articles[index] });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar' });
  }
});

app.get('/producto', (req, res) => {
  res.sendFile(path.join(__dirname, 'product.html'));
});

const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');

app.get('/api/products', (req, res) => {
  ensureDataDir();
  if (!fs.existsSync(PRODUCTS_FILE)) {
    return res.json([]);
  }
  const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  res.json(data.products || []);
});

app.post('/api/products', requireAuth, express.json(), (req, res) => {
  try {
    const { title, image, thumbnails, price, tag, description, category, features, caracteristicas, instalacion, garantia, imageData } = req.body || {};

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'El título y descripción son obligatorios' });
    }

    ensureDataDir();
    let data = { products: [] };
    if (fs.existsSync(PRODUCTS_FILE)) {
      data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    }

    let finalImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop';
    if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const ext = imageData.match(/data:image\/(\w+)/)?.[1] || 'jpg';
      const filename = `product_${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(base64Data, 'base64'));
      finalImage = `/uploads/${filename}`;
    } else if (image && (image.startsWith('http') || image.startsWith('/'))) {
      finalImage = image;
    }

    let finalThumbnails = [];
    if (thumbnails && Array.isArray(thumbnails)) {
      thumbnails.forEach((t, i) => {
        if (t.startsWith('data:image')) {
          const base64Data = t.replace(/^data:image\/\w+;base64,/, '');
          const ext = t.match(/data:image\/(\w+)/)?.[1] || 'jpg';
          const filename = `product_thumb_${Date.now()}_${i}.${ext}`;
          fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(base64Data, 'base64'));
          finalThumbnails.push(`/uploads/${filename}`);
        } else if (t.startsWith('http') || t.startsWith('/')) {
          finalThumbnails.push(t);
        }
      });
    }

    const product = {
      id: uuidv4(),
      title: sanitizeInput(title),
      image: finalImage,
      thumbnails: finalThumbnails,
      price: sanitizeInput(price || 'Consultar'),
      tag: sanitizeInput(tag || ''),
      description: sanitizeInput(description),
      category: sanitizeInput(category || 'otro'),
      features: features || [],
      caracteristicas: sanitizeInput(caracteristicas || ''),
      instalacion: sanitizeInput(instalacion || ''),
      garantia: sanitizeInput(garantia || ''),
      createdAt: new Date().toISOString()
    };

    data.products.push(product);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, product });
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ success: false, error: 'Error al guardar el producto' });
  }
});

app.delete('/api/products/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    ensureDataDir();
    if (!fs.existsSync(PRODUCTS_FILE)) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    data.products.splice(index, 1);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al eliminar' });
  }
});

app.put('/api/products/:id', requireAuth, express.json(), (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, thumbnails, price, tag, description, category, features, caracteristicas, instalacion, garantia, imageData, thumbnailsData } = req.body || {};

    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'El título y descripción son obligatorios' });
    }

    ensureDataDir();
    if (!fs.existsSync(PRODUCTS_FILE)) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    let finalImage = (image && (image.startsWith('http') || image.startsWith('/'))) ? image : data.products[index].image;
    if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const ext = imageData.match(/data:image\/(\w+)/)?.[1] || 'jpg';
      const filename = `product_${Date.now()}.${ext}`;
      fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(base64Data, 'base64'));
      finalImage = `/uploads/${filename}`;
    }

    let finalThumbnails = data.products[index].thumbnails || [];
    if (thumbnails && Array.isArray(thumbnails)) {
      thumbnails.forEach((t, i) => {
        if (t.startsWith('data:')) {
          const base64Data = t.replace(/^data:image\/\w+;base64,/, '');
          const ext = t.match(/data:image\/(\w+)/)?.[1] || 'jpg';
          const filename = `product_thumb_${Date.now()}_${i}.${ext}`;
          fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(base64Data, 'base64'));
          finalThumbnails.push(`/uploads/${filename}`);
        } else if (t.startsWith('http') || t.startsWith('/')) {
          finalThumbnails.push(t);
        }
      });
    }

    data.products[index] = {
      ...data.products[index],
      title: sanitizeInput(title),
      image: finalImage,
      thumbnails: finalThumbnails,
      price: sanitizeInput(price || ''),
      tag: sanitizeInput(tag || ''),
      description: sanitizeInput(description),
      category: sanitizeInput(category || 'otro'),
      features: features || [],
      caracteristicas: sanitizeInput(caracteristicas || ''),
      instalacion: sanitizeInput(instalacion || ''),
      garantia: sanitizeInput(garantia || ''),
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, product: data.products[index] });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar' });
  }
});

app.post('/api/contact', (req, res) => {
  try {
    console.log('Body recibido:', req.body);
    
    const { name, email, phone, message, interest, codigo_postal } = req.body || {};

    console.log('Datos recibidos:', { name, email, phone, interest, codigo_postal });

    const errors = [];

    if (!validateRequired(name) || name.length > 100) {
      errors.push('El nombre es obligatorio y debe tener menos de 100 caracteres');
    }

    if (!validateRequired(email) || !validateEmail(email)) {
      errors.push('El email no es válido');
    }

    if (phone && !validatePhone(phone)) {
      errors.push('El teléfono no es válido');
    }

    if (!validateRequired(codigo_postal) || !/^\d{5}$/.test(codigo_postal)) {
      errors.push('El código postal debe tener 5 dígitos');
    }

    if (!validateRequired(message) || message.length > 1000) {
      errors.push('El mensaje es obligatorio y debe tener menos de 1000 caracteres');
    }

    if (errors.length > 0) {
      console.log('Errores de validación:', errors);
      return res.status(400).json({ success: false, errors });
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedPhone = sanitizeInput(phone || '');
    const sanitizedMessage = sanitizeInput(message);
    const sanitizedInterest = sanitizeInput(interest || 'General');
    const sanitizedPostalCode = sanitizeInput(codigo_postal);

    const contact = {
      id: uuidv4(),
      _name: encrypt(sanitizedName),
      _email: encrypt(sanitizedEmail),
      _phone: encrypt(sanitizedPhone),
      _codigo_postal: encrypt(sanitizedPostalCode),
      _message: encrypt(sanitizedMessage),
      interest: sanitizedInterest,
      status: 'nuevo',
      createdAt: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown'
    };

    const unencryptedContact = {
      id: contact.id,
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      codigo_postal: sanitizedPostalCode,
      message: sanitizedMessage,
      interest: sanitizedInterest,
      status: 'nuevo',
      createdAt: contact.createdAt,
      ip: contact.ip,
      userAgent: contact.userAgent
    };

    console.log('Guardando contacto...');
    saveContact(contact, unencryptedContact);
    console.log('Contacto guardado exitosamente');

    console.log('Nuevo contacto recibido:', { id: contact.id, timestamp: contact.createdAt });

    res.json({
      success: true,
      message: 'Gracias por contactarnos. Nos pondremos en contacto contigo pronto.',
      contactId: contact.id
    });

  } catch (error) {
    console.error('Error al procesar contacto:', error);
    res.status(500).json({
      success: false,
      errors: ['Ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.']
    });
  }
});

app.get('/api/contacts', requireAuth, (req, res) => {
  ensureDataDir();
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const decrypted = data.contacts.map(c => ({
    ...c,
    name: decrypt(c._name),
    email: decrypt(c._email),
    phone: decrypt(c._phone),
    codigo_postal: decrypt(c._codigo_postal),
    message: decrypt(c._message)
  }));
  res.json(decrypted);
});

app.patch('/api/contacts/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['nuevo', 'por_contactar', 'contactado', 'presupuesto_enviado', 'presupuesto_aceptado', 'presupuesto_rechazado', 'finalizado'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Estado no válido' });
    }

    ensureDataDir();
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    const contactIndex = data.contacts.findIndex(c => c.id === id);
    if (contactIndex === -1) {
      return res.status(404).json({ success: false, error: 'Contacto no encontrado' });
    }

    data.contacts[contactIndex].status = status;
    data.contacts[contactIndex].statusUpdatedAt = new Date().toISOString();
    data.contacts[contactIndex].statusUpdatedBy = req.ip || 'admin';

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, contact: data.contacts[contactIndex] });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar' });
  }
});

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
  console.log(`\nDatos de contactos guardados en: ${DATA_FILE}`);
});